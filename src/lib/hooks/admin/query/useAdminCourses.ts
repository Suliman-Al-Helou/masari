"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createAdminCourse,
  deleteAdminCourse,
  getAdminCourseReviewDetails,
  getAdminCourse,
  getAdminCoursesPage,
  moderateAdminCourseReview,
  restoreAdminCourse,
  updateAdminCourse,
  adminDeleteCourseReview,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";
import type {
  AdminCourseFilters,
  AdminCourseReviewStatus,
  CreateAdminCourseInput,
  UpdateAdminCourseInput,
} from "@/types/admin";

export function useAdminCourses(
  filters: AdminCourseFilters,
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: queryKeys.admin.courses(filters),
    queryFn: () => getAdminCoursesPage(filters),
    staleTime: QUERY_STALE_TIME.ADMIN_COURSES,
    placeholderData: (previous) => previous,
    meta: { silent: true },
    enabled: options.enabled ?? true,
  });
}

export function useAdminCourse(courseId: string | null) {
  return useQuery({
    queryKey: queryKeys.admin.course(courseId ?? ""),
    queryFn: () => getAdminCourse(courseId!),
    enabled: Boolean(courseId),
    staleTime: QUERY_STALE_TIME.ADMIN_COURSES,
    meta: { silent: true },
  });
}

export function useCreateAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAdminCourseInput) => createAdminCourse(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coursesAll() }),
    meta: { silent: true },
  });
}

export function useUpdateAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminCourseInput }) =>
      updateAdminCourse(id, input),
    onSuccess: (_course, variables) =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.coursesAll(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.course(variables.id),
        }),
      ]),
    meta: { silent: true },
  });
}

export function useDeleteAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminCourse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coursesAll() }),
    meta: { silent: true },
  });
}

export function useRestoreAdminCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restoreAdminCourse,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.coursesAll() }),
    meta: { silent: true },
  });
}

export function useAdminCourseReviewDetails(
  courseId: string | null,
  options: { sort?: "newest" | "highest"; status?: string } = {},
) {
  return useQuery({
    queryKey: queryKeys.admin.courseReviewDetails(courseId ?? "", options),
    queryFn: () => getAdminCourseReviewDetails(courseId!, options),
    enabled: Boolean(courseId),
    staleTime: QUERY_STALE_TIME.ADMIN_COURSE_REVIEWS,
    meta: { silent: true },
  });
}

export function useModerateAdminCourseReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: AdminCourseReviewStatus;
    }) => moderateAdminCourseReview(reviewId, status),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.courseReviewDetails(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.coursesAll(),
        }),
      ]),
    meta: { silent: true },
  });
}

export function usePermanentlyDeleteAdminCourseReview(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDeleteCourseReview,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.courseReviewDetails(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.admin.coursesAll(),
        }),
      ]),
    meta: { silent: true },
  });
}
