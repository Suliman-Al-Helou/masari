import "server-only";

import { classroom_v1, google } from "googleapis";

import {
  createAuthorizedGoogleClassroomClient,
  GoogleClassroomClientError,
} from "@/features/integrations/google-classroom/server/google-classroom-client";
import {
  getGoogleClassroomCoursework,
  type GoogleClassroomTask,
} from "@/features/integrations/google-classroom/server/google-classroom-coursework";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 100;
const DATABASE_CHUNK_SIZE = 200;
const FULL_SYNC_PAST_DAYS = 36_500;
const SYNC_LOCK_MINUTES = 5;

const CONNECTION_TABLE = "google_classroom_connections";
const COURSES_TABLE = "google_classroom_courses";
const TASKS_TABLE = "google_classroom_tasks";
const SUBMISSIONS_TABLE = "google_classroom_submissions";

export type GoogleClassroomSyncErrorCode =
  | "SYNC_IN_PROGRESS"
  | "SYNC_STATE_FAILED"
  | "COURSES_SYNC_FAILED"
  | "TASKS_SYNC_FAILED"
  | "SUBMISSIONS_SYNC_FAILED";

const ERROR_STATUS: Record<
  GoogleClassroomSyncErrorCode,
  number
> = {
  SYNC_IN_PROGRESS: 409,
  SYNC_STATE_FAILED: 500,
  COURSES_SYNC_FAILED: 500,
  TASKS_SYNC_FAILED: 500,
  SUBMISSIONS_SYNC_FAILED: 500,
};

export class GoogleClassroomSyncError extends Error {
  readonly code: GoogleClassroomSyncErrorCode;
  readonly status: number;
  readonly originalError?: unknown;

  constructor(
    code: GoogleClassroomSyncErrorCode,
    message: string,
    originalError?: unknown,
  ) {
    super(message);

    this.name = "GoogleClassroomSyncError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    this.originalError = originalError;
  }
}

type ClassroomClient = classroom_v1.Classroom;

type GoogleClassroomCourse = {
  id: string;
  name: string;
  section: string | null;
  courseState: string | null;
  alternateLink: string | null;
  creationTime: string | null;
  updateTime: string | null;
};

type StoredCourseRow = {
  id: string;
  google_course_id: string;
};

type StoredTaskRow = {
  id: string;
  google_course_id: string;
  google_coursework_id: string;
};

type StoredSubmissionRow = {
  id: string;
  task_id: string;
};

type SyncConnectionRow = {
  is_active: boolean;
  last_sync_status: string | null;
  last_sync_started_at: string | null;
};

function chunkValues<T>(
  values: T[],
  chunkSize = DATABASE_CHUNK_SIZE,
): T[][] {
  const chunks: T[][] = [];

  for (
    let index = 0;
    index < values.length;
    index += chunkSize
  ) {
    chunks.push(
      values.slice(index, index + chunkSize),
    );
  }

  return chunks;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message.slice(0, 2000);
  }

  if (typeof error === "string") {
    return error.slice(0, 2000);
  }

  return "Unknown Google Classroom synchronization error";
}

function taskKey(
  googleCourseId: string,
  googleCourseworkId: string,
): string {
  return `${googleCourseId}:${googleCourseworkId}`;
}

async function startSync(
  userId: string,
  startedAt: string,
): Promise<void> {
  const { data, error } = await dbAdmin
    .from(CONNECTION_TABLE)
    .select(
      [
        "is_active",
        "last_sync_status",
        "last_sync_started_at",
      ].join(","),
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new GoogleClassroomSyncError(
      "SYNC_STATE_FAILED",
      "تعذر قراءة حالة مزامنة Google Classroom",
      error,
    );
  }

  const connection = data as SyncConnectionRow | null;

  if (!connection || !connection.is_active) {
    throw new GoogleClassroomClientError(
      "NOT_CONNECTED",
      "حساب Google Classroom غير مربوط",
    );
  }

  if (
    connection.last_sync_status === "running" &&
    connection.last_sync_started_at
  ) {
    const previousStartedAt = Date.parse(
      connection.last_sync_started_at,
    );

    const lockExpiresAt =
      previousStartedAt +
      SYNC_LOCK_MINUTES * 60 * 1000;

    if (
      !Number.isNaN(previousStartedAt) &&
      lockExpiresAt > Date.now()
    ) {
      throw new GoogleClassroomSyncError(
        "SYNC_IN_PROGRESS",
        "توجد مزامنة Google Classroom قيد التنفيذ",
      );
    }
  }

  const { error: updateError } = await dbAdmin
    .from(CONNECTION_TABLE)
    .update({
      last_sync_started_at: startedAt,
      last_sync_status: "running",
      last_sync_error: null,
      updated_at: startedAt,
    })
    .eq("user_id", userId);

  if (updateError) {
    throw new GoogleClassroomSyncError(
      "SYNC_STATE_FAILED",
      "تعذر بدء مزامنة Google Classroom",
      updateError,
    );
  }
}

async function completeSync(
  userId: string,
  syncedAt: string,
): Promise<void> {
  const { error } = await dbAdmin
    .from(CONNECTION_TABLE)
    .update({
      last_sync_status: "success",
      last_sync_error: null,
      last_synced_at: syncedAt,
      updated_at: syncedAt,
    })
    .eq("user_id", userId);

  if (error) {
    throw new GoogleClassroomSyncError(
      "SYNC_STATE_FAILED",
      "اكتملت المزامنة لكن تعذر حفظ حالتها",
      error,
    );
  }
}

async function failSync(
  userId: string,
  error: unknown,
): Promise<void> {
  const failedAt = new Date().toISOString();

  const { error: updateError } = await dbAdmin
    .from(CONNECTION_TABLE)
    .update({
      last_sync_status: "error",
      last_sync_error: getErrorMessage(error),
      updated_at: failedAt,
    })
    .eq("user_id", userId);

  if (updateError) {
    logger.error(
      updateError,
      "Failed to store Google Classroom sync error",
    );
  }
}

async function listActiveCourses(
  userId: string,
): Promise<GoogleClassroomCourse[]> {
  const { auth, persistCredentials } =
    await createAuthorizedGoogleClassroomClient(
      userId,
    );

  const classroom: ClassroomClient =
    google.classroom({
      version: "v1",
      auth,
    });

  const courses: GoogleClassroomCourse[] = [];
  let pageToken: string | undefined;

  do {
    const response = await classroom.courses.list({
      studentId: "me",
      courseStates: ["ACTIVE"],
      pageSize: PAGE_SIZE,
      pageToken,
      fields: [
        "nextPageToken",
        "courses(",
        [
          "id",
          "name",
          "section",
          "courseState",
          "alternateLink",
          "creationTime",
          "updateTime",
        ].join(","),
        ")",
      ].join(","),
    });

    for (const course of response.data.courses ?? []) {
      if (!course.id) {
        continue;
      }

      courses.push({
        id: course.id,
        name: course.name ?? "مقرر بدون اسم",
        section: course.section ?? null,
        courseState: course.courseState ?? null,
        alternateLink: course.alternateLink ?? null,
        creationTime: course.creationTime ?? null,
        updateTime: course.updateTime ?? null,
      });
    }

    pageToken =
      response.data.nextPageToken ?? undefined;
  } while (pageToken);

  await persistCredentials();

  return courses;
}

async function deactivateCourseRows(
  rowIds: string[],
  syncedAt: string,
): Promise<void> {
  for (const ids of chunkValues(rowIds)) {
    const { error } = await dbAdmin
      .from(COURSES_TABLE)
      .update({
        is_active: false,
        last_synced_at: syncedAt,
      })
      .in("id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "COURSES_SYNC_FAILED",
        "تعذر تعطيل مقررات Classroom القديمة",
        error,
      );
    }
  }
}

async function syncCourses(
  userId: string,
  courses: GoogleClassroomCourse[],
  syncedAt: string,
): Promise<{
  courseIdMap: Map<string, string>;
  staleCourseRowIds: string[];
}> {
  if (courses.length > 0) {
    const coursePayload = courses.map((course) => ({
      user_id: userId,
      google_course_id: course.id,
      name: course.name,
      section: course.section,
      course_state: course.courseState,
      alternate_link: course.alternateLink,
      google_creation_time: course.creationTime,
      google_updated_at: course.updateTime,
      is_active: true,
      last_synced_at: syncedAt,
    }));

    const { error } = await dbAdmin
      .from(COURSES_TABLE)
      .upsert(coursePayload, {
        onConflict: "user_id,google_course_id",
      });

    if (error) {
      throw new GoogleClassroomSyncError(
        "COURSES_SYNC_FAILED",
        "تعذر حفظ مقررات Google Classroom",
        error,
      );
    }
  }

  const { data, error } = await dbAdmin
    .from(COURSES_TABLE)
    .select("id,google_course_id")
    .eq("user_id", userId);

  if (error) {
    throw new GoogleClassroomSyncError(
      "COURSES_SYNC_FAILED",
      "تعذر قراءة المقررات المحفوظة",
      error,
    );
  }

  const storedCourses =
    (data ?? []) as StoredCourseRow[];

  const activeGoogleCourseIds = new Set(
    courses.map((course) => course.id),
  );

  const staleCourseRows = storedCourses.filter(
    (course) =>
      !activeGoogleCourseIds.has(
        course.google_course_id,
      ),
  );

  await deactivateCourseRows(
    staleCourseRows.map((course) => course.id),
    syncedAt,
  );

  const courseIdMap = new Map<string, string>();

  for (const course of storedCourses) {
    if (
      activeGoogleCourseIds.has(
        course.google_course_id,
      )
    ) {
      courseIdMap.set(
        course.google_course_id,
        course.id,
      );
    }
  }

  return {
    courseIdMap,
    staleCourseRowIds: staleCourseRows.map(
      (course) => course.id,
    ),
  };
}

async function selectTasksByCourseRowIds(
  userId: string,
  courseRowIds: string[],
): Promise<StoredTaskRow[]> {
  const rows: StoredTaskRow[] = [];

  for (const ids of chunkValues(courseRowIds)) {
    const { data, error } = await dbAdmin
      .from(TASKS_TABLE)
      .select(
        "id,google_course_id,google_coursework_id",
      )
      .eq("user_id", userId)
      .in("course_id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "TASKS_SYNC_FAILED",
        "تعذر قراءة مهام المقررات القديمة",
        error,
      );
    }

    rows.push(...((data ?? []) as StoredTaskRow[]));
  }

  return rows;
}

async function selectTasksByGoogleCourseIds(
  userId: string,
  googleCourseIds: string[],
): Promise<StoredTaskRow[]> {
  const rows: StoredTaskRow[] = [];

  for (const ids of chunkValues(googleCourseIds)) {
    const { data, error } = await dbAdmin
      .from(TASKS_TABLE)
      .select(
        "id,google_course_id,google_coursework_id",
      )
      .eq("user_id", userId)
      .in("google_course_id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "TASKS_SYNC_FAILED",
        "تعذر قراءة مهام Google Classroom",
        error,
      );
    }

    rows.push(...((data ?? []) as StoredTaskRow[]));
  }

  return rows;
}

async function deactivateSubmissionRowsByTaskIds(
  userId: string,
  taskRowIds: string[],
  syncedAt: string,
): Promise<void> {
  for (const ids of chunkValues(taskRowIds)) {
    const { error } = await dbAdmin
      .from(SUBMISSIONS_TABLE)
      .update({
        is_active: false,
        last_synced_at: syncedAt,
      })
      .eq("user_id", userId)
      .in("task_id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "SUBMISSIONS_SYNC_FAILED",
        "تعذر تعطيل تسليمات Classroom القديمة",
        error,
      );
    }
  }
}

async function deactivateTaskRows(
  userId: string,
  taskRowIds: string[],
  syncedAt: string,
): Promise<void> {
  if (taskRowIds.length === 0) {
    return;
  }

  await deactivateSubmissionRowsByTaskIds(
    userId,
    taskRowIds,
    syncedAt,
  );

  for (const ids of chunkValues(taskRowIds)) {
    const { error } = await dbAdmin
      .from(TASKS_TABLE)
      .update({
        is_active: false,
        last_synced_at: syncedAt,
      })
      .eq("user_id", userId)
      .in("id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "TASKS_SYNC_FAILED",
        "تعذر تعطيل مهام Classroom القديمة",
        error,
      );
    }
  }
}

async function deactivateTasksForStaleCourses(
  userId: string,
  staleCourseRowIds: string[],
  syncedAt: string,
): Promise<number> {
  if (staleCourseRowIds.length === 0) {
    return 0;
  }

  const rows = await selectTasksByCourseRowIds(
    userId,
    staleCourseRowIds,
  );

  await deactivateTaskRows(
    userId,
    rows.map((row) => row.id),
    syncedAt,
  );

  return rows.length;
}

async function upsertTasks(
  userId: string,
  tasks: GoogleClassroomTask[],
  courseIdMap: Map<string, string>,
  syncedAt: string,
): Promise<Map<string, string>> {
  if (tasks.length === 0) {
    return new Map();
  }

  const taskPayload = tasks.map((task) => {
    const courseRowId = courseIdMap.get(
      task.courseId,
    );

    if (!courseRowId) {
      throw new GoogleClassroomSyncError(
        "TASKS_SYNC_FAILED",
        `لا يوجد مقرر محلي للمهمة ${task.id}`,
      );
    }

    return {
      user_id: userId,
      course_id: courseRowId,
      google_course_id: task.courseId,
      google_coursework_id: task.id,
      title: task.title,
      description: task.description,
      work_type: task.workType,
      classroom_state: task.state,
      alternate_link: task.alternateLink,
      max_points: task.maxPoints,
      due_at: task.dueAt,
      google_creation_time: task.creationTime,
      google_updated_at: task.updateTime,
      task_status: task.status,
      associated_with_developer:
        task.associatedWithDeveloper,
      direct_submission_eligible:
        task.directSubmissionEligible,
      is_active: true,
      last_synced_at: syncedAt,
    };
  });

  const { data, error } = await dbAdmin
    .from(TASKS_TABLE)
    .upsert(taskPayload, {
      onConflict:
        "user_id,google_course_id,google_coursework_id",
    })
    .select(
      "id,google_course_id,google_coursework_id",
    );

  if (error) {
    throw new GoogleClassroomSyncError(
      "TASKS_SYNC_FAILED",
      "تعذر حفظ مهام Google Classroom",
      error,
    );
  }

  const taskIdMap = new Map<string, string>();

  for (const row of (data ?? []) as StoredTaskRow[]) {
    taskIdMap.set(
      taskKey(
        row.google_course_id,
        row.google_coursework_id,
      ),
      row.id,
    );
  }

  return taskIdMap;
}

async function deactivateStaleTasks(
  userId: string,
  existingTasks: StoredTaskRow[],
  currentTasks: GoogleClassroomTask[],
  syncedAt: string,
): Promise<number> {
  const currentTaskKeys = new Set(
    currentTasks.map((task) =>
      taskKey(task.courseId, task.id),
    ),
  );

  const staleRows = existingTasks.filter(
    (row) =>
      !currentTaskKeys.has(
        taskKey(
          row.google_course_id,
          row.google_coursework_id,
        ),
      ),
  );

  await deactivateTaskRows(
    userId,
    staleRows.map((row) => row.id),
    syncedAt,
  );

  return staleRows.length;
}

async function selectSubmissionsByTaskIds(
  userId: string,
  taskRowIds: string[],
): Promise<StoredSubmissionRow[]> {
  const rows: StoredSubmissionRow[] = [];

  for (const ids of chunkValues(taskRowIds)) {
    const { data, error } = await dbAdmin
      .from(SUBMISSIONS_TABLE)
      .select("id,task_id")
      .eq("user_id", userId)
      .in("task_id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "SUBMISSIONS_SYNC_FAILED",
        "تعذر قراءة تسليمات Google Classroom",
        error,
      );
    }

    rows.push(
      ...((data ?? []) as StoredSubmissionRow[]),
    );
  }

  return rows;
}

async function deactivateSubmissionRows(
  userId: string,
  rowIds: string[],
  syncedAt: string,
): Promise<void> {
  for (const ids of chunkValues(rowIds)) {
    const { error } = await dbAdmin
      .from(SUBMISSIONS_TABLE)
      .update({
        is_active: false,
        last_synced_at: syncedAt,
      })
      .eq("user_id", userId)
      .in("id", ids);

    if (error) {
      throw new GoogleClassroomSyncError(
        "SUBMISSIONS_SYNC_FAILED",
        "تعذر تعطيل تسليمات Classroom القديمة",
        error,
      );
    }
  }
}

async function syncSubmissions(
  userId: string,
  tasks: GoogleClassroomTask[],
  taskIdMap: Map<string, string>,
  syncedAt: string,
): Promise<{
  submissionsSynced: number;
  submissionsDeactivated: number;
}> {
  const taskRowIds = Array.from(
    taskIdMap.values(),
  );

  const existingSubmissions =
    await selectSubmissionsByTaskIds(
      userId,
      taskRowIds,
    );

  const submissionPayload = tasks.flatMap(
    (task) => {
      if (!task.submission.id) {
        return [];
      }

      const taskRowId = taskIdMap.get(
        taskKey(task.courseId, task.id),
      );

      if (!taskRowId) {
        throw new GoogleClassroomSyncError(
          "SUBMISSIONS_SYNC_FAILED",
          `لا توجد مهمة محلية للتسليم ${task.submission.id}`,
        );
      }

      return [
        {
          user_id: userId,
          task_id: taskRowId,
          google_submission_id:
            task.submission.id,
          submission_state:
            task.submission.state,
          is_late: task.submission.late,
          assigned_grade:
            task.submission.assignedGrade,
          draft_grade:
            task.submission.draftGrade,
          alternate_link:
            task.submission.alternateLink,
          google_creation_time:
            task.submission.creationTime,
          google_updated_at:
            task.submission.updateTime,
          is_active: true,
          last_synced_at: syncedAt,
        },
      ];
    },
  );

  if (submissionPayload.length > 0) {
    const { error } = await dbAdmin
      .from(SUBMISSIONS_TABLE)
      .upsert(submissionPayload, {
        onConflict: "user_id,task_id",
      });

    if (error) {
      throw new GoogleClassroomSyncError(
        "SUBMISSIONS_SYNC_FAILED",
        "تعذر حفظ تسليمات Google Classroom",
        error,
      );
    }
  }

  const activeTaskRowIds = new Set(
    submissionPayload.map(
      (submission) => submission.task_id,
    ),
  );

  const staleSubmissions =
    existingSubmissions.filter(
      (submission) =>
        !activeTaskRowIds.has(
          submission.task_id,
        ),
    );

  await deactivateSubmissionRows(
    userId,
    staleSubmissions.map(
      (submission) => submission.id,
    ),
    syncedAt,
  );

  return {
    submissionsSynced:
      submissionPayload.length,
    submissionsDeactivated:
      staleSubmissions.length,
  };
}

export async function syncGoogleClassroom(
  userId: string,
) {
  const startedAt = new Date().toISOString();
  let syncStarted = false;

  try {
    await startSync(userId, startedAt);
    syncStarted = true;

    const courses = await listActiveCourses(
      userId,
    );

    const coursework =
      await getGoogleClassroomCoursework(
        userId,
        {
          // Includes all practical Classroom history.
          pastDays: FULL_SYNC_PAST_DAYS,
        },
      );

    const syncedAt = new Date().toISOString();

    const {
      courseIdMap,
      staleCourseRowIds,
    } = await syncCourses(
      userId,
      courses,
      syncedAt,
    );

    const staleCourseTasks =
      await deactivateTasksForStaleCourses(
        userId,
        staleCourseRowIds,
        syncedAt,
      );

    const failedCourseIds = new Set(
      coursework.meta.failedCourseIds,
    );

    const successfulGoogleCourseIds =
      courses
        .map((course) => course.id)
        .filter(
          (courseId) =>
            !failedCourseIds.has(courseId),
        );

    const existingTasks =
      await selectTasksByGoogleCourseIds(
        userId,
        successfulGoogleCourseIds,
      );

    const currentTasks =
      coursework.tasks.filter(
        (task) =>
          !failedCourseIds.has(task.courseId),
      );

    const taskIdMap = await upsertTasks(
      userId,
      currentTasks,
      courseIdMap,
      syncedAt,
    );

    const staleTasks =
      await deactivateStaleTasks(
        userId,
        existingTasks,
        currentTasks,
        syncedAt,
      );

    const submissionResult =
      await syncSubmissions(
        userId,
        currentTasks,
        taskIdMap,
        syncedAt,
      );

    await completeSync(userId, syncedAt);

    return {
      coursesSynced: courses.length,
      coursesDeactivated:
        staleCourseRowIds.length,
      tasksSynced: currentTasks.length,
      tasksDeactivated:
        staleTasks + staleCourseTasks,
      submissionsSynced:
        submissionResult.submissionsSynced,
      submissionsDeactivated:
        submissionResult.submissionsDeactivated,
      failedCourseIds:
        coursework.meta.failedCourseIds,
      syncedAt,
    };
  } catch (error) {
    if (syncStarted) {
      await failSync(userId, error);
    }

    throw error;
  }
}