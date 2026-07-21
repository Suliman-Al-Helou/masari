import { api } from "@/lib/api/fetcher";
import type { AdminCourse } from "@/types/admin";

type CourseCatalogFilters = {
  university?: string;
  major?: string;
  semester?: string;
  year?: string;
};

export async function getCourseCatalog(
  filters: CourseCatalogFilters,
): Promise<AdminCourse[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const query = params.toString();
  return api.get<AdminCourse[]>(`/api/course-catalog${query ? `?${query}` : ""}`);
}
