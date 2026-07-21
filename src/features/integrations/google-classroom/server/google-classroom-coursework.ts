import "server-only";

import { classroom_v1, google } from "googleapis";

import { createAuthorizedGoogleClassroomClient } from "@/features/integrations/google-classroom/server/google-classroom-client";
import { logger } from "@/lib/logger";

const PAGE_SIZE = 100;
const COURSE_CONCURRENCY = 3;
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

export type GoogleClassroomTaskStatus =
  | "upcoming"
  | "overdue"
  | "submitted"
  | "returned"
  | "no_due_date";

export type GoogleClassroomTask = {
  id: string;
  courseId: string;
  courseName: string;
  courseSection: string | null;
  title: string;
  description: string | null;
  workType: string | null;
  state: string | null;
  alternateLink: string | null;
  maxPoints: number | null;
  dueAt: string | null;
  creationTime: string | null;
  updateTime: string | null;
  associatedWithDeveloper: boolean;
  directSubmissionEligible: boolean;
  status: GoogleClassroomTaskStatus;
  submission: {
    id: string | null;
    state: string | null;
    late: boolean;
    assignedGrade: number | null;
    draftGrade: number | null;
    alternateLink: string | null;
    creationTime: string | null;
    updateTime: string | null;
  };
};

type CourseSummary = {
  id: string;
  name: string;
  section: string | null;
};

type CourseWorkWithDeveloper =
  classroom_v1.Schema$CourseWork & {
    associatedWithDeveloper?: boolean | null;
  };

type ClassroomClient = classroom_v1.Classroom;

function toNullableNumber(
  value: number | null | undefined,
): number | null {
  return typeof value === "number" ? value : null;
}

// Convert Classroom due date and time to UTC ISO format.
function toDueAt(
  dueDate:
    | {
        year?: number | null;
        month?: number | null;
        day?: number | null;
      }
    | null
    | undefined,
  dueTime:
    | {
        hours?: number | null;
        minutes?: number | null;
        seconds?: number | null;
        nanos?: number | null;
      }
    | null
    | undefined,
): string | null {
  if (!dueDate?.year || !dueDate.month || !dueDate.day) {
    return null;
  }

  const hasDueTime = dueTime !== null && dueTime !== undefined;

  const hours = dueTime?.hours ?? (hasDueTime ? 0 : 23);
  const minutes = dueTime?.minutes ?? (hasDueTime ? 0 : 59);
  const seconds = dueTime?.seconds ?? (hasDueTime ? 0 : 59);
  const milliseconds = Math.floor(
    (dueTime?.nanos ?? 0) / 1_000_000,
  );

  return new Date(
    Date.UTC(
      dueDate.year,
      dueDate.month - 1,
      dueDate.day,
      hours,
      minutes,
      seconds,
      milliseconds,
    ),
  ).toISOString();
}

function getTaskStatus(
  dueAt: string | null,
  submissionState: string | null,
  now: number,
): GoogleClassroomTaskStatus {
  if (submissionState === "RETURNED") {
    return "returned";
  }

  if (
    submissionState === "TURNED_IN" ||
    submissionState === "STUDENT_EDITED_AFTER_TURN_IN"
  ) {
    return "submitted";
  }

  if (!dueAt) {
    return "no_due_date";
  }

  return Date.parse(dueAt) < now
    ? "overdue"
    : "upcoming";
}

function canSubmitDirectly(
  work: CourseWorkWithDeveloper,
  submission:
    | classroom_v1.Schema$StudentSubmission
    | undefined,
): boolean {
  if (
    work.associatedWithDeveloper !== true ||
    work.workType !== "ASSIGNMENT" ||
    !submission?.id
  ) {
    return false;
  }

  const blockedStates = new Set([
    "TURNED_IN",
    "RETURNED",
    "STUDENT_EDITED_AFTER_TURN_IN",
  ]);

  return !blockedStates.has(submission.state ?? "");
}

async function listActiveCourses(
  classroom: ClassroomClient,
): Promise<CourseSummary[]> {
  const courses: CourseSummary[] = [];
  let pageToken: string | undefined;

  do {
    const response = await classroom.courses.list({
      studentId: "me",
      courseStates: ["ACTIVE"],
      pageSize: PAGE_SIZE,
      pageToken,
      fields:
        "nextPageToken,courses(id,name,section)",
    });

    for (const course of response.data.courses ?? []) {
      if (!course.id) {
        continue;
      }

      courses.push({
        id: course.id,
        name: course.name ?? "مقرر بدون اسم",
        section: course.section ?? null,
      });
    }

    pageToken =
      response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return courses;
}

async function listCourseWork(
  classroom: ClassroomClient,
  courseId: string,
): Promise<CourseWorkWithDeveloper[]> {
  const courseWork: CourseWorkWithDeveloper[] = [];
  let pageToken: string | undefined;

  do {
    const response =
      await classroom.courses.courseWork.list({
        courseId,
        courseWorkStates: ["PUBLISHED"],
        pageSize: PAGE_SIZE,
        pageToken,
        fields:
          "nextPageToken,courseWork(id,title,description,workType,state,alternateLink,maxPoints,dueDate,dueTime,creationTime,updateTime,associatedWithDeveloper)",
      });

    courseWork.push(
      ...((response.data.courseWork ??
        []) as CourseWorkWithDeveloper[]),
    );

    pageToken =
      response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return courseWork;
}

async function listStudentSubmissions(
  classroom: ClassroomClient,
  courseId: string,
): Promise<classroom_v1.Schema$StudentSubmission[]> {
  const submissions: classroom_v1.Schema$StudentSubmission[] =
    [];

  let pageToken: string | undefined;

  do {
    const response =
      await classroom.courses.courseWork.studentSubmissions.list(
        {
          courseId,
          courseWorkId: "-",
          userId: "me",
          pageSize: PAGE_SIZE,
          pageToken,
          fields:
            "nextPageToken,studentSubmissions(id,courseWorkId,state,late,assignedGrade,draftGrade,alternateLink,creationTime,updateTime)",
        },
      );

    submissions.push(
      ...(response.data.studentSubmissions ?? []),
    );

    pageToken =
      response.data.nextPageToken ?? undefined;
  } while (pageToken);

  return submissions;
}
async function fetchCourseTasks(
  classroom: ClassroomClient,
  course: CourseSummary,
  now: number,
): Promise<GoogleClassroomTask[]> {
  const [courseWork, submissions] =
    await Promise.all([
      listCourseWork(classroom, course.id),
      listStudentSubmissions(classroom, course.id),
    ]);

  const submissionsByCourseWorkId = new Map<
    string,
    classroom_v1.Schema$StudentSubmission
  >();

  for (const submission of submissions) {
    if (!submission.courseWorkId) {
      continue;
    }

    submissionsByCourseWorkId.set(
      submission.courseWorkId,
      submission,
    );
  }

  return courseWork.flatMap(
    (work): GoogleClassroomTask[] => {
      if (!work.id) {
        return [];
      }

      const submission =
        submissionsByCourseWorkId.get(work.id);

      const dueAt = toDueAt(
        work.dueDate,
        work.dueTime,
      );

      const submissionState =
        submission?.state ?? null;

      const associatedWithDeveloper =
        work.associatedWithDeveloper === true;

      const directSubmissionEligible =
        canSubmitDirectly(work, submission);

      return [
        {
          id: work.id,
          courseId: course.id,
          courseName: course.name,
          courseSection: course.section,
          title: work.title ?? "مهمة بدون عنوان",
          description: work.description ?? null,
          workType: work.workType ?? null,
          state: work.state ?? null,
          alternateLink: work.alternateLink ?? null,
          maxPoints: toNullableNumber(
            work.maxPoints,
          ),
          dueAt,
          creationTime:
            work.creationTime ?? null,
          updateTime: work.updateTime ?? null,
          associatedWithDeveloper,
          directSubmissionEligible,
          status: getTaskStatus(
            dueAt,
            submissionState,
            now,
          ),
          submission: {
            id: submission?.id ?? null,
            state: submissionState,
            late: submission?.late === true,
            assignedGrade: toNullableNumber(
              submission?.assignedGrade,
            ),
            draftGrade: toNullableNumber(
              submission?.draftGrade,
            ),
            alternateLink:
              submission?.alternateLink ?? null,
            creationTime:
              submission?.creationTime ?? null,
            updateTime:
              submission?.updateTime ?? null,
          },
        },
      ];
    },
  );
}

function getRelevantTimestamp(
  task: GoogleClassroomTask,
): number | null {
  const value =
    task.dueAt ??
    task.updateTime ??
    task.creationTime;

  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp)
    ? null
    : timestamp;
}

function sortTasks(
  tasks: GoogleClassroomTask[],
): GoogleClassroomTask[] {
  const statusOrder: Record<
    GoogleClassroomTaskStatus,
    number
  > = {
    overdue: 0,
    upcoming: 1,
    no_due_date: 2,
    submitted: 3,
    returned: 4,
  };

  return tasks.sort((left, right) => {
    const statusDifference =
      statusOrder[left.status] -
      statusOrder[right.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    const leftTime =
      getRelevantTimestamp(left) ??
      Number.MAX_SAFE_INTEGER;

    const rightTime =
      getRelevantTimestamp(right) ??
      Number.MAX_SAFE_INTEGER;

    return leftTime - rightTime;
  });
}

async function mapInChunks<T, R>(
  values: T[],
  chunkSize: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];

  for (
    let index = 0;
    index < values.length;
    index += chunkSize
  ) {
    const chunk = values.slice(
      index,
      index + chunkSize,
    );

    const chunkResults = await Promise.all(
      chunk.map(mapper),
    );

    results.push(...chunkResults);
  }

  return results;
}

export async function getGoogleClassroomCoursework(
  userId: string,
  options: {
    pastDays: number;
  },
) {
  const { auth, persistCredentials } =
    await createAuthorizedGoogleClassroomClient(
      userId,
    );

  const classroom = google.classroom({
    version: "v1",
    auth,
  });

  const courses =
    await listActiveCourses(classroom);

  const now = Date.now();

  const cutoff =
    now -
    options.pastDays * DAY_IN_MILLISECONDS;

  const failedCourseIds: string[] = [];

  const courseResults = await mapInChunks(
    courses,
    COURSE_CONCURRENCY,
    async (course) => {
      try {
        return await fetchCourseTasks(
          classroom,
          course,
          now,
        );
      } catch (error) {
        failedCourseIds.push(course.id);

        logger.error(
          error,
          `Failed to fetch Classroom coursework for course ${course.id}`,
        );

        return [];
      }
    },
  );

  await persistCredentials();

  if (
    courses.length > 0 &&
    failedCourseIds.length === courses.length
  ) {
    throw new Error(
      "Failed to fetch coursework for every Classroom course",
    );
  }

  const tasks = sortTasks(
    courseResults
      .flat()
      .filter((task) => {
        const timestamp =
          getRelevantTimestamp(task);

        return (
          timestamp === null ||
          timestamp >= cutoff
        );
      }),
  );

  const summary = tasks.reduce(
    (result, task) => {
      result.total += 1;
      result[task.status] += 1;

      if (task.submission.late) {
        result.late += 1;
      }

      if (
        task.submission.assignedGrade !== null
      ) {
        result.graded += 1;
      }

      if (task.directSubmissionEligible) {
        result.directSubmissionEligible += 1;
      }

      return result;
    },
    {
      total: 0,
      upcoming: 0,
      overdue: 0,
      submitted: 0,
      returned: 0,
      no_due_date: 0,
      late: 0,
      graded: 0,
      directSubmissionEligible: 0,
    },
  );

  return {
    tasks,
    summary,
    meta: {
      implementationVersion:
        "classroom-coursework-v3",
      coursesCount: courses.length,
      failedCourseIds,
      pastDays: options.pastDays,
      fetchedAt: new Date(now).toISOString(),
    },
  };
}