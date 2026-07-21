import "server-only";

import { dbAdmin } from "@/lib/db/server-only";

export class CourseReviewReportError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "CourseReviewReportError";
  }
}

export async function reportCourseReview(
  reviewId: string,
  reporterId: string,
): Promise<void> {
  const { error } = await dbAdmin.rpc("report_course_review", {
    p_review_id: reviewId,
    p_reporter_id: reporterId,
  });

  if (!error) return;

  if (error.code === "23505") {
    throw new CourseReviewReportError("سبق أن أبلغت عن هذا الرأي", 409);
  }
  if (error.message.includes("cannot_report_own_review")) {
    throw new CourseReviewReportError("لا يمكنك الإبلاغ عن رأيك", 400);
  }
  if (error.message.includes("review_not_available")) {
    throw new CourseReviewReportError("الرأي غير متاح أو تم التعامل معه", 404);
  }

  throw error;
}
