import { useQuery } from "@tanstack/react-query";

import { getStudentDistribution } from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";
import type { StudentDistributionFilters } from "@/types/admin";

export function useStudentDistribution(
  filters: StudentDistributionFilters,
) {
  return useQuery({
    queryKey: queryKeys.admin.studentDistribution(filters),
    queryFn: () => getStudentDistribution(filters),
    staleTime: QUERY_STALE_TIME.ADMIN_DISTRIBUTION,
    meta: {
      silent: true,
    },
  });
}