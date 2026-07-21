export type LocalClassroomTaskStatus =
  | "upcoming"
  | "overdue"
  | "submitted"
  | "returned"
  | "no_due_date";

export type LocalClassroomTask = {
  id: string;
  googleCourseworkId: string;
  googleCourseId: string;

  title: string;
  description: string | null;

  workType: string | null;
  classroomState: string | null;
  status: LocalClassroomTaskStatus;

  alternateLink: string | null;
  maxPoints: number | null;
  dueAt: string | null;

  associatedWithDeveloper: boolean;
  directSubmissionEligible: boolean;

  course: {
    id: string;
    name: string;
    section: string | null;
    alternateLink: string | null;
  };

  submission: {
    id: string;
    googleSubmissionId: string;
    state: string | null;
    late: boolean;
    assignedGrade: number | null;
    draftGrade: number | null;
    alternateLink: string | null;
  } | null;

  googleCreationTime: string | null;
  googleUpdatedAt: string | null;
  lastSyncedAt: string;
};

export type LocalClassroomTasksSummary = {
  total: number;
  upcoming: number;
  overdue: number;
  submitted: number;
  returned: number;
  noDueDate: number;
  late: number;
  graded: number;
};

export type LocalClassroomTasksData = {
  tasks: LocalClassroomTask[];
  summary: LocalClassroomTasksSummary;
};

export type GetLocalClassroomTasksOptions = {
  status?: LocalClassroomTaskStatus;
  googleCourseId?: string;
  limit?: number;
};

export type GoogleClassroomSyncStatus =
  | "running"
  | "success"
  | "error";

export type GoogleClassroomConnectionStatus = {
  connected: boolean;
  connectedAt: string | null;
  lastSyncedAt: string | null;
  lastSyncStartedAt: string | null;
  lastSyncStatus: GoogleClassroomSyncStatus | null;
  lastSyncError: string | null;
};

export type GoogleClassroomSyncResult = {
  coursesSynced: number;
  coursesDeactivated: number;
  tasksSynced: number;
  tasksDeactivated: number;
  submissionsSynced: number;
  submissionsDeactivated: number;
  failedCourseIds: string[];
  syncedAt: string;
};