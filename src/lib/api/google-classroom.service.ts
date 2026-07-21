import type {
  GoogleClassroomConnectionStatus,
  GoogleClassroomSyncResult,
  LocalClassroomTask,
  LocalClassroomTasksData,
} from "@/features/integrations/google-classroom/types";
import { api } from "@/lib/api/fetcher";

const CLASSROOM_API =
  "/api/integrations/google-classroom";

export function getGoogleClassroomStatus() {
  return api.get<GoogleClassroomConnectionStatus>(
    `${CLASSROOM_API}/status`,
  );
}

export function getGoogleClassroomTasks() {
  return api.get<LocalClassroomTasksData>(
    `${CLASSROOM_API}/tasks?limit=200`,
  );
}

export function getGoogleClassroomTask(
  taskId: string,
) {
  return api.get<LocalClassroomTask>(
    `${CLASSROOM_API}/tasks/${encodeURIComponent(taskId)}`,
  );
}

export function syncGoogleClassroomData() {
  return api.post<GoogleClassroomSyncResult>(
    `${CLASSROOM_API}/sync`,
    {},
  );
}