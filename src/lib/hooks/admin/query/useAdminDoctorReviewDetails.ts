import { useQuery } from "@tanstack/react-query";

import { getAdminDoctorReviewDetails } from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";

export function useAdminDoctorReviewDetails(
  doctorId: string | null,
  courseCode?: string | null,
) {
  return useQuery({
    queryKey: queryKeys.admin.doctorReviewDetails(
      doctorId ?? "",
      courseCode ?? undefined,
    ),

    queryFn: () =>
      getAdminDoctorReviewDetails(
        doctorId as string,
        courseCode ?? undefined,
      ),

    enabled: Boolean(doctorId),

    staleTime: QUERY_STALE_TIME.ADMIN_DOCTOR_REVIEWS,

    meta: {
      silent: true,
    },
  });
}