import { useQuery } from "@tanstack/react-query";

import { getPlatformActivityTrend } from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";
import type { PlatformActivityFilters } from "@/types/admin";

// Fetches and caches platform activity trend data
export function usePlatformActivityTrend(filters: PlatformActivityFilters) {
  return useQuery({
    queryKey: queryKeys.admin.platformActivity(filters),
    queryFn: () => getPlatformActivityTrend(filters),
    staleTime: QUERY_STALE_TIME.ADMIN_STATS,
    meta: {
      silent: true,
    },
  });
}
