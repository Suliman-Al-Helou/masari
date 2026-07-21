import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getGoogleClassroomStatus,
  getGoogleClassroomTask,
  getGoogleClassroomTasks,
  syncGoogleClassroomData,
} from "@/lib/api/google-classroom.service";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";

export function useGoogleClassroomStatus() {
  return useQuery({
    queryKey: queryKeys.classroom.status(),
    queryFn: getGoogleClassroomStatus,
    staleTime: QUERY_STALE_TIME.CLASSROOM_STATUS,
    retry: 1,
    refetchInterval: (query) =>
      query.state.data?.lastSyncStatus === "running"
        ? 3_000
        : false,
    meta: {
      silent: true,
    },
  });
}

export function useGoogleClassroomTasks(
  enabled = true,
) {
  return useQuery({
    queryKey: queryKeys.classroom.tasks(),
    queryFn: getGoogleClassroomTasks,
    staleTime: QUERY_STALE_TIME.CLASSROOM_TASKS,
    enabled,
    retry: 1,
    meta: {
      silent: true,
    },
  });
}

export function useGoogleClassroomTask(
  taskId: string,
) {
  return useQuery({
    queryKey: queryKeys.classroom.task(taskId),
    queryFn: () =>
      getGoogleClassroomTask(taskId),
    staleTime: QUERY_STALE_TIME.CLASSROOM_TASKS,
    enabled: Boolean(taskId),
    retry: 1,
    meta: {
      silent: true,
    },
  });
}

export function useSyncGoogleClassroom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncGoogleClassroomData,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.classroom.all(),
      });
    },
    meta: {
      silent: true,
    },
  });
}