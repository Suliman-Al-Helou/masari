import { supabase } from "@/lib/db/client";

// ══════════════════════════════════════════════
// Types
// ══════════════════════════════════════════════

export type Doctor = {
  id: string;
  name: string;
  university: string;
  major: string;
  created_at: string;
  title?: string | null;
  avatar_url?: string | null;

  course_code?: string | null;
  course_name?: string | null;
};

export type CourseReview = {
  id: string;
  user_id: string;
  course_code: string;
  university: string;
  rating_overall: number;
  rating_difficulty: number;
  rating_workload: number;
  would_retake: boolean;
  review: string | null;
  tips: string | null;
  semester_taken: string | null;
  created_at: string;
  // join
  profiles?: { full_name: string; avatar_url?: string | null } | null;
};

export type DoctorReview = {
  id: string;
  user_id: string;
  doctor_id: string;
  course_code: string;
  rating_overall: number;
  rating_clarity: number;
  rating_fairness: number;
  would_retake: boolean;
  review: string | null;
  created_at: string;
  // join
  profiles?: { full_name: string; avatar_url?: string | null } | null;
  doctors?: { name: string } | null;
};

export type CourseReviewStats = {
  total: number;
  avg_rating: number;
  avg_difficulty: number;
  avg_workload: number;
  retake_percent: number;
  distribution: Record<number, number>;
};

export type DoctorReviewStats = {
  count: number;
  avg_overall: number;
  avg_clarity: number;
  avg_fairness: number;
  retake_percent: number;
};

// ══════════════════════════════════════════════
// Doctors
// ══════════════════════════════════════════════

export async function getDoctors(
  options: {
    university?: string;
    major?: string;
  } = {},
): Promise<Doctor[]> {
  let query = supabase
    .from("doctors")
    .select("*")
    .order("name", { ascending: true });

  if (options.university) query = query.eq("university", options.university);
  if (options.major) query = query.eq("major", options.major);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Doctor[];
}
export async function getDoctorsByCourse(
  courseCode: string,
  university: string,
): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from("doctors")
    .select("*")
    .eq("course_code", courseCode)
    .eq("university", university)
    .order("name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Doctor[];
}


// ══════════════════════════════════════════════
// Course Reviews
// ══════════════════════════════════════════════

export async function getCourseReviews(
  courseCode: string,
): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from("course_reviews")
    .select("*, profiles(full_name)")
    .eq("course_code", courseCode)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CourseReview[];
}

export async function getCourseReviewStats(
  courseCode: string,
): Promise<CourseReviewStats> {
  const { data, error } = await supabase
    .from("course_reviews")
    .select("rating_overall, rating_difficulty, rating_workload, would_retake")
    .eq("course_code", courseCode);

  if (error) throw error;
  const rows = data ?? [];

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach((r) => {
    const star = Math.round(r.rating_overall);
    if (star >= 1 && star <= 5) {
      distribution[star]++;
    }
  });

  if (rows.length === 0) {
    return {
      total: 0,
      avg_rating: 0,
      avg_difficulty: 0,
      avg_workload: 0,
      retake_percent: 0,
      distribution,
    };
  }

  const avg = (
    key: "rating_overall" | "rating_difficulty" | "rating_workload",
  ) =>
    Math.round(
      (rows.reduce((s, r) => s + (r[key] as number), 0) / rows.length) * 10,
    ) / 10;

  return {
    total: rows.length,
    avg_rating: avg("rating_overall"),
    avg_difficulty: avg("rating_difficulty"),
    avg_workload: avg("rating_workload"),
    retake_percent: Math.round(
      (rows.filter((r) => r.would_retake).length / rows.length) * 100,
    ),
    distribution,
  };
}

export async function addCourseReview(review: {
  user_id: string;
  course_code: string;
  university: string;
  rating_overall: number;
  rating_difficulty: number;
  rating_workload: number;
  would_retake: boolean;
  review?: string;
  tips?: string;
  semester_taken?: string;
}): Promise<CourseReview> {
  const { data, error } = await supabase
    .from("course_reviews")
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data as CourseReview;
}

export async function deleteCourseReview(id: string): Promise<void> {
  const { error } = await supabase.from("course_reviews").delete().eq("id", id);
  if (error) throw error;
}

// هل قيّم الطالب هذه المادة مسبقاً؟
export async function getUserCourseReview(
  userId: string,
  courseCode: string,
): Promise<CourseReview | null> {
  const { data } = await supabase
    .from("course_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("course_code", courseCode)
    .maybeSingle();
  return data as CourseReview | null;
}

// ══════════════════════════════════════════════
// Doctor Reviews
// ══════════════════════════════════════════════

export async function getDoctorReviews(
  doctorId: string,
  courseCode?: string,
): Promise<DoctorReview[]> {
  let query = supabase
    .from("doctor_reviews")
    .select("*, profiles(full_name), doctors(name)")
    .eq("doctor_id", doctorId);

  if (courseCode) {
    query = query.eq("course_code", courseCode);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DoctorReview[];
}

export async function getDoctorReviewStats(
  doctorId: string,
): Promise<DoctorReviewStats> {
  const { data, error } = await supabase
    .from("doctor_reviews")
    .select("rating_overall, rating_clarity, rating_fairness, would_retake")
    .eq("doctor_id", doctorId);

  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0)
    return {
      count: 0,
      avg_overall: 0,
      avg_clarity: 0,
      avg_fairness: 0,
      retake_percent: 0,
    };

  const avg = (key: keyof (typeof rows)[0]) =>
    Math.round(
      (rows.reduce((s, r) => s + (r[key] as number), 0) / rows.length) * 10,
    ) / 10;

  return {
    count: rows.length,
    avg_overall: avg("rating_overall"),
    avg_clarity: avg("rating_clarity"),
    avg_fairness: avg("rating_fairness"),
    retake_percent: Math.round(
      (rows.filter((r) => r.would_retake).length / rows.length) * 100,
    ),
  };
}

export async function addDoctorReview(review: {
  user_id: string;
  doctor_id: string;
  course_code: string;
  rating_overall: number;
  rating_clarity: number;
  rating_fairness: number;
  would_retake: boolean;
  review?: string;
}): Promise<DoctorReview> {
  const { data, error } = await supabase
    .from("doctor_reviews")
    .insert(review)
    .select()
    .single();
  if (error) throw error;
  return data as DoctorReview;
}

export async function deleteDoctorReview(id: string): Promise<void> {
  const { error } = await supabase.from("doctor_reviews").delete().eq("id", id);
  if (error) throw error;
}

// هل قيّم الطالب هذا الدكتور في هذه المادة مسبقاً؟
export async function getUserDoctorReview(
  userId: string,
  doctorId: string,
  courseCode: string,
): Promise<DoctorReview | null> {
  const { data } = await supabase
    .from("doctor_reviews")
    .select("*")
    .eq("user_id", userId)
    .eq("doctor_id", doctorId)
    .eq("course_code", courseCode)
    .maybeSingle();
  return data as DoctorReview | null;
}

// ══════════════════════════════════════════════
// Admin — كل التقييمات للإشراف
// ══════════════════════════════════════════════

export async function getAllCourseReviews(): Promise<CourseReview[]> {
  const { data, error } = await supabase
    .from("course_reviews")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CourseReview[];
}

export async function getAllDoctorReviews(): Promise<DoctorReview[]> {
  const { data, error } = await supabase
    .from("doctor_reviews")
    .select("*, profiles(full_name), doctors(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DoctorReview[];
}
