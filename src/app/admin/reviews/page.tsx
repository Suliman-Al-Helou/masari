// app/admin/reviews/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import {
  adminGetAllCourseReviews,
  adminGetAllDoctorReviews,
  adminDeleteCourseReview,
  adminDeleteDoctorReview,
} from "@/lib/api/admin";
import { useToast } from "@/lib/context/ToastContext";
import { success } from "zod";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill={i <= value ? "#f59e0b" : "none"}
          stroke={i <= value ? "#f59e0b" : "#d1d5db"}
          strokeWidth={1.5}
        >
          <path
            strokeLinejoin="round"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-[var(--color-border)] bg-opacity-60 animate-pulse"
            style={{ width: `${60 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function DeleteButton({
  onConfirm,
  loading,
}: {
  onConfirm: () => void;
  loading: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            onConfirm();
            setConfirming(false);
          }}
          disabled={loading}
          className="text-xs px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition font-medium"
        >
          {loading ? "..." : "تأكيد"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:bg-opacity-40 transition"
        >
          إلغاء
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
      title="حذف"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}

// ─── Filters bar ──────────────────────────────────────────────────────────────

interface FiltersProps {
  search: string;
  onSearch: (v: string) => void;
  university: string;
  onUniversity: (v: string) => void;
  universities: string[];
  total: number;
  filtered: number;
}

function FiltersBar({
  search,
  onSearch,
  university,
  onUniversity,
  universities,
  total,
  filtered,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="بحث بالاسم أو المادة..."
          className="w-full pr-9 pl-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30 transition"
        />
      </div>

      {/* University filter */}
      <select
        value={university}
        onChange={(e) => onUniversity(e.target.value)}
        className="py-2 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-30 transition min-w-[160px]"
      >
        <option value="">كل الجامعات</option>
        {universities.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>

      {/* Count badge */}
      <span className="text-xs text-[var(--color-text-secondary)] mr-auto">
        {filtered !== total ? `${filtered} من ${total}` : `${total} نتيجة`}
      </span>

      {/* Clear */}
      {(search || university) && (
        <button
          onClick={() => {
            onSearch("");
            onUniversity("");
          }}
          className="text-xs text-[var(--color-primary)] hover:underline"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}

// ─── Course Reviews Tab ───────────────────────────────────────────────────────

function CourseReviewsTab() {
  const { Success, Error } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [university, setUniversity] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-course-reviews"],
    queryFn: adminGetAllCourseReviews,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: adminDeleteCourseReview,
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-course-reviews"] });
      Success("تم حذف التقييم");
    },
    onError: () => Error("فشل الحذف، حاول مرة أخرى"),
    onSettled: () => setDeletingId(null),
  });

  const universities = useMemo(() => {
    const set = new Set(
      reviews.map((r) => r.profiles?.university).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.profiles?.full_name?.toLowerCase().includes(q) ||
        r.courses?.name?.toLowerCase().includes(q) ||
        (r.courses?.code?.toLowerCase().includes(q) ?? false) ||
        (r.comment?.toLowerCase().includes(q) ?? false);
      const matchUni = !university || r.profiles?.university === university;
      return matchSearch && matchUni;
    });
  }, [reviews, search, university]);

  return (
    <>
      <FiltersBar
        search={search}
        onSearch={setSearch}
        university={university}
        onUniversity={setUniversity}
        universities={universities}
        total={reviews.length}
        filtered={filtered.length}
      />

      <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  المادة
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  الكاتب
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  التقييم
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs hidden md:table-cell">
                  التعليق
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs hidden sm:table-cell">
                  التاريخ
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[var(--color-text-secondary)] text-sm"
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <tr
                    key={review.id}
                    className="bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    {/* المادة */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {review.courses?.name ?? "—"}
                      </div>
                      {review.courses?.code && (
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {review.courses.code}
                        </div>
                      )}
                    </td>

                    {/* الكاتب */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {review.profiles?.full_name ?? "—"}
                      </div>
                      {review.profiles?.university && (
                        <div className="text-xs text-[var(--color-text-secondary)] truncate max-w-[140px]">
                          {review.profiles.university}
                        </div>
                      )}
                    </td>

                    {/* التقييم */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Stars value={review.rating} />
                        <div className="flex gap-2 text-xs text-[var(--color-text-secondary)]">
                          <span title="عبء العمل">⚡{review.workload}/5</span>
                          <span title="الصعوبة">🎯{review.difficulty}/5</span>
                        </div>
                      </div>
                    </td>

                    {/* التعليق */}
                    <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                      {review.comment ? (
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {review.comment}
                        </p>
                      ) : (
                        <span className="text-xs text-[var(--color-border)]">
                          —
                        </span>
                      )}
                    </td>

                    {/* التاريخ */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </td>

                    {/* حذف */}
                    <td className="px-3 py-3">
                      <DeleteButton
                        onConfirm={() => mutation.mutate(review.id)}
                        loading={deletingId === review.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Doctor Reviews Tab ───────────────────────────────────────────────────────

function DoctorReviewsTab() {
  const { Success, Error } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [university, setUniversity] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-doctor-reviews"],
    queryFn: adminGetAllDoctorReviews,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: adminDeleteDoctorReview,
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-doctor-reviews"] });
      Success("تم حذف التقييم");
    },
    onError: () => Error("فشل الحذف، حاول مرة أخرى"),
    onSettled: () => setDeletingId(null),
  });

  const universities = useMemo(() => {
    const set = new Set(
      reviews.map((r) => r.profiles?.university).filter(Boolean) as string[],
    );
    return Array.from(set).sort();
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.profiles?.full_name?.toLowerCase().includes(q) ||
        r.doctors?.name?.toLowerCase().includes(q) ||
        r.courses?.name?.toLowerCase().includes(q) ||
        (r.comment?.toLowerCase().includes(q) ?? false);
      const matchUni = !university || r.profiles?.university === university;
      return matchSearch && matchUni;
    });
  }, [reviews, search, university]);

  return (
    <>
      <FiltersBar
        search={search}
        onSearch={setSearch}
        university={university}
        onUniversity={setUniversity}
        universities={universities}
        total={reviews.length}
        filtered={filtered.length}
      />

      <div className="rounded-2xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" dir="rtl">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  الدكتور
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs hidden sm:table-cell">
                  المادة
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  الكاتب
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs">
                  التقييم
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs hidden md:table-cell">
                  التعليق
                </th>
                <th className="px-4 py-3 text-right font-semibold text-[var(--color-text-secondary)] text-xs hidden sm:table-cell">
                  التاريخ
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-[var(--color-text-secondary)] text-sm"
                  >
                    لا توجد نتائج
                  </td>
                </tr>
              ) : (
                filtered.map((review) => (
                  <tr
                    key={review.id}
                    className="bg-[var(--color-bg)] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    {/* الدكتور */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {review.doctors?.name ?? "—"}
                      </div>
                      {review.doctors?.title && (
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {review.doctors.title}
                        </div>
                      )}
                    </td>

                    {/* المادة */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="text-[var(--color-text-primary)]">
                        {review.courses?.name ?? "—"}
                      </div>
                      {review.courses?.code && (
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          {review.courses.code}
                        </div>
                      )}
                    </td>

                    {/* الكاتب */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">
                        {review.profiles?.full_name ?? "—"}
                      </div>
                      {review.profiles?.university && (
                        <div className="text-xs text-[var(--color-text-secondary)] truncate max-w-[130px]">
                          {review.profiles.university}
                        </div>
                      )}
                    </td>

                    {/* التقييم */}
                    <td className="px-4 py-3">
                      <Stars value={review.rating} />
                      <span className="text-xs text-[var(--color-text-secondary)] mt-0.5 block tabular-nums">
                        {review.rating}/5
                      </span>
                    </td>

                    {/* التعليق */}
                    <td className="px-4 py-3 hidden md:table-cell max-w-[200px]">
                      {review.comment ? (
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                          {review.comment}
                        </p>
                      ) : (
                        <span className="text-xs text-[var(--color-border)]">
                          —
                        </span>
                      )}
                    </td>

                    {/* التاريخ */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
                        {formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </td>

                    {/* حذف */}
                    <td className="px-3 py-3">
                      <DeleteButton
                        onConfirm={() => mutation.mutate(review.id)}
                        loading={deletingId === review.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "courses" | "doctors";

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<Tab>("courses");

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
          إشراف التقييمات
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          مراجعة وحذف تقييمات المواد والدكاترة
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] w-fit mb-6">
        <button
          onClick={() => setTab("courses")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "courses"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          تقييمات المواد
        </button>
        <button
          onClick={() => setTab("doctors")}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${
            tab === "doctors"
              ? "bg-[var(--color-primary)] text-white shadow-sm"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          تقييمات الدكاترة
        </button>
      </div>

      {/* Content */}
      {tab === "courses" ? <CourseReviewsTab /> : <DoctorReviewsTab />}
    </div>
  );
}
