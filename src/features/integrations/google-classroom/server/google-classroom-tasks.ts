import "server-only";

import { dbAdmin } from "@/lib/db/server-only";

import type {
  GetLocalClassroomTasksOptions,
  LocalClassroomTask,
  LocalClassroomTasksData,
  LocalClassroomTasksSummary,
  LocalClassroomTaskStatus,
} from "../types";

export type {
  GetLocalClassroomTasksOptions,
  LocalClassroomTask,
  LocalClassroomTasksData,
  LocalClassroomTasksSummary,
  LocalClassroomTaskStatus,
} from "../types";

const TASKS_TABLE = "google_classroom_tasks";
const COURSES_TABLE = "google_classroom_courses";
const SUBMISSIONS_TABLE =
  "google_classroom_submissions";

const TASK_FIELDS = [
  "id",
  "course_id",
  "google_course_id",
  "google_coursework_id",
  "title",
  "description",
  "work_type",
  "classroom_state",
  "task_status",
  "alternate_link",
  "max_points",
  "due_at",
  "associated_with_developer",
  "direct_submission_eligible",
  "google_creation_time",
  "google_updated_at",
  "last_synced_at",
].join(",");

const SUBMISSION_FIELDS = [
  "id",
  "task_id",
  "google_submission_id",
  "submission_state",
  "is_late",
  "assigned_grade",
  "draft_grade",
  "alternate_link",
].join(",");

type TaskRow = {
  id: string;
  course_id: string;
  google_course_id: string;
  google_coursework_id: string;

  title: string;
  description: string | null;

  work_type: string | null;
  classroom_state: string | null;
  task_status: LocalClassroomTaskStatus;

  alternate_link: string | null;
  max_points: number | null;
  due_at: string | null;

  associated_with_developer: boolean;
  direct_submission_eligible: boolean;

  google_creation_time: string | null;
  google_updated_at: string | null;
  last_synced_at: string;
};

type CourseRow = {
  id: string;
  name: string;
  section: string | null;
  alternate_link: string | null;
};

type SubmissionRow = {
  id: string;
  task_id: string;
  google_submission_id: string;
  submission_state: string | null;
  is_late: boolean;
  assigned_grade: number | null;
  draft_grade: number | null;
  alternate_link: string | null;
};

function clampLimit(limit: number | undefined): number {
  if (!limit) {
    return 100;
  }

  return Math.min(Math.max(limit, 1), 200);
}

function createEmptySummary(): LocalClassroomTasksSummary {
  return {
    total: 0,
    upcoming: 0,
    overdue: 0,
    submitted: 0,
    returned: 0,
    noDueDate: 0,
    late: 0,
    graded: 0,
  };
}

function getTaskTimestamp(task: TaskRow): number {
  const value =
    task.due_at ??
    task.google_updated_at ??
    task.google_creation_time;

  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp)
    ? Number.MAX_SAFE_INTEGER
    : timestamp;
}

function sortTasks(tasks: TaskRow[]): TaskRow[] {
  const statusOrder: Record<
    LocalClassroomTaskStatus,
    number
  > = {
    overdue: 0,
    upcoming: 1,
    no_due_date: 2,
    submitted: 3,
    returned: 4,
  };

  return [...tasks].sort((left, right) => {
    const statusDifference =
      statusOrder[left.task_status] -
      statusOrder[right.task_status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return (
      getTaskTimestamp(left) -
      getTaskTimestamp(right)
    );
  });
}

function calculateSummary(
  tasks: LocalClassroomTask[],
): LocalClassroomTasksSummary {
  return tasks.reduce<LocalClassroomTasksSummary>(
    (summary, task) => {
      summary.total += 1;

      switch (task.status) {
        case "upcoming":
          summary.upcoming += 1;
          break;

        case "overdue":
          summary.overdue += 1;
          break;

        case "submitted":
          summary.submitted += 1;
          break;

        case "returned":
          summary.returned += 1;
          break;

        case "no_due_date":
          summary.noDueDate += 1;
          break;
      }

      if (task.submission?.late) {
        summary.late += 1;
      }

      if (
        task.submission?.assignedGrade !== null &&
        task.submission?.assignedGrade !== undefined
      ) {
        summary.graded += 1;
      }

      return summary;
    },
    createEmptySummary(),
  );
}

function mapTask(
  task: TaskRow,
  course: CourseRow,
  submission?: SubmissionRow,
): LocalClassroomTask {
  return {
    id: task.id,
    googleCourseworkId:
      task.google_coursework_id,
    googleCourseId: task.google_course_id,

    title: task.title,
    description: task.description,

    workType: task.work_type,
    classroomState: task.classroom_state,
    status: task.task_status,

    alternateLink: task.alternate_link,
    maxPoints: task.max_points,
    dueAt: task.due_at,

    associatedWithDeveloper:
      task.associated_with_developer,
    directSubmissionEligible:
      task.direct_submission_eligible,

    course: {
      id: course.id,
      name: course.name,
      section: course.section,
      alternateLink: course.alternate_link,
    },

    submission: submission
      ? {
          id: submission.id,
          googleSubmissionId:
            submission.google_submission_id,
          state: submission.submission_state,
          late: submission.is_late,
          assignedGrade:
            submission.assigned_grade,
          draftGrade: submission.draft_grade,
          alternateLink:
            submission.alternate_link,
        }
      : null,

    googleCreationTime:
      task.google_creation_time,
    googleUpdatedAt: task.google_updated_at,
    lastSyncedAt: task.last_synced_at,
  };
}

export async function getLocalGoogleClassroomTasks(
  userId: string,
  options: GetLocalClassroomTasksOptions = {},
): Promise<LocalClassroomTasksData> {
  let query = dbAdmin
    .from(TASKS_TABLE)
    .select(TASK_FIELDS)
    .eq("user_id", userId)
    .eq("is_active", true);

  if (options.status) {
    query = query.eq(
      "task_status",
      options.status,
    );
  }

  if (options.googleCourseId) {
    query = query.eq(
      "google_course_id",
      options.googleCourseId,
    );
  }

  const { data: taskData, error: taskError } =
    await query;

  if (taskError) {
    throw new Error(
      `Failed to read Classroom tasks: ${taskError.message}`,
    );
  }

  const taskRows = sortTasks(
    (taskData ?? []) as TaskRow[],
  ).slice(0, clampLimit(options.limit));

  if (taskRows.length === 0) {
    return {
      tasks: [],
      summary: createEmptySummary(),
    };
  }

  const courseRowIds = Array.from(
    new Set(
      taskRows.map((task) => task.course_id),
    ),
  );

  const taskRowIds = taskRows.map(
    (task) => task.id,
  );

  const [
    { data: courseData, error: courseError },
    {
      data: submissionData,
      error: submissionError,
    },
  ] = await Promise.all([
    dbAdmin
      .from(COURSES_TABLE)
      .select(
        "id,name,section,alternate_link",
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("id", courseRowIds),

    dbAdmin
      .from(SUBMISSIONS_TABLE)
      .select(SUBMISSION_FIELDS)
      .eq("user_id", userId)
      .eq("is_active", true)
      .in("task_id", taskRowIds),
  ]);

  if (courseError) {
    throw new Error(
      `Failed to read Classroom courses: ${courseError.message}`,
    );
  }

  if (submissionError) {
    throw new Error(
      `Failed to read Classroom submissions: ${submissionError.message}`,
    );
  }

  const coursesById = new Map(
    ((courseData ?? []) as CourseRow[]).map(
      (course) => [course.id, course],
    ),
  );

  const submissionsByTaskId = new Map(
    (
      (submissionData ?? []) as SubmissionRow[]
    ).map((submission) => [
      submission.task_id,
      submission,
    ]),
  );

  const tasks = taskRows.flatMap((task) => {
    const course = coursesById.get(
      task.course_id,
    );

    if (!course) {
      return [];
    }

    return [
      mapTask(
        task,
        course,
        submissionsByTaskId.get(task.id),
      ),
    ];
  });

  return {
    tasks,
    summary: calculateSummary(tasks),
  };
}

export async function getLocalGoogleClassroomTaskById(
  userId: string,
  taskId: string,
): Promise<LocalClassroomTask | null> {
  const { data: taskData, error: taskError } =
    await dbAdmin
      .from(TASKS_TABLE)
      .select(TASK_FIELDS)
      .eq("id", taskId)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle();

  if (taskError) {
    throw new Error(
      `Failed to read Classroom task: ${taskError.message}`,
    );
  }

  if (!taskData) {
    return null;
  }

  const task = taskData as TaskRow;

  const [
    { data: courseData, error: courseError },
    {
      data: submissionData,
      error: submissionError,
    },
  ] = await Promise.all([
    dbAdmin
      .from(COURSES_TABLE)
      .select(
        "id,name,section,alternate_link",
      )
      .eq("id", task.course_id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),

    dbAdmin
      .from(SUBMISSIONS_TABLE)
      .select(SUBMISSION_FIELDS)
      .eq("task_id", task.id)
      .eq("user_id", userId)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  if (courseError) {
    throw new Error(
      `Failed to read Classroom course: ${courseError.message}`,
    );
  }

  if (submissionError) {
    throw new Error(
      `Failed to read Classroom submission: ${submissionError.message}`,
    );
  }

  if (!courseData) {
    return null;
  }

  return mapTask(
    task,
    courseData as CourseRow,
    submissionData
      ? (submissionData as SubmissionRow)
      : undefined,
  );
}