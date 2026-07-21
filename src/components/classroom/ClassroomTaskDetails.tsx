"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
} from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import type {
  LocalClassroomTask,
  LocalClassroomTaskStatus,
} from "@/features/integrations/google-classroom/types";
import { useGoogleClassroomTask } from "@/lib/hooks/integrations/useGoogleClassroom";

const STATUS_META = {
  upcoming: {
    label: "قادمة",
    Icon: CalendarClock,
    badgeClass:
      "border-info/20 bg-info/10 text-info",
    iconClass: "bg-info/10 text-info",
  },
  overdue: {
    label: "متأخرة",
    Icon: AlertCircle,
    badgeClass:
      "border-destructive/20 bg-destructive/10 text-destructive",
    iconClass:
      "bg-destructive/10 text-destructive",
  },
  submitted: {
    label: "مسلّمة",
    Icon: CheckCircle2,
    badgeClass:
      "border-success/20 bg-success/10 text-success",
    iconClass: "bg-success/10 text-success",
  },
  returned: {
    label: "تم التصحيح",
    Icon: GraduationCap,
    badgeClass:
      "border-primary/20 bg-primary/10 text-primary",
    iconClass: "bg-primary/10 text-primary",
  },
  no_due_date: {
    label: "بلا موعد",
    Icon: Clock3,
    badgeClass:
      "border-border bg-muted text-muted-foreground",
    iconClass: "bg-muted text-muted-foreground",
  },
} satisfies Record<
  LocalClassroomTaskStatus,
  {
    label: string;
    Icon: typeof Clock3;
    badgeClass: string;
    iconClass: string;
  }
>;

const SUBMISSION_STATE_LABELS: Record<
  string,
  string
> = {
  CREATED: "لم يتم التسليم",
  NEW: "لم يتم التسليم",
  TURNED_IN: "تم التسليم",
  RETURNED: "تم التصحيح والإرجاع",
  RECLAIMED_BY_STUDENT: "تم سحب التسليم",
};

const WORK_TYPE_LABELS: Record<
  string,
  string
> = {
  ASSIGNMENT: "واجب",
  SHORT_ANSWER_QUESTION: "سؤال قصير",
  MULTIPLE_CHOICE_QUESTION: "اختيار من متعدد",
};

function formatDate(
  value: string | null,
  emptyLabel: string,
): string {
  if (!value) {
    return emptyLabel;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return emptyLabel;
  }

  return new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
  }).format(date);
}

function getSubmissionStateLabel(
  state: string | null | undefined,
): string {
  if (!state) {
    return "لا توجد حالة تسليم";
  }

  return SUBMISSION_STATE_LABELS[state] ?? state;
}

function getWorkTypeLabel(
  workType: string | null,
): string {
  if (!workType) {
    return "مهمة";
  }

  return WORK_TYPE_LABELS[workType] ?? workType;
}

function DetailSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6"
      aria-label="جارٍ تحميل تفاصيل المهمة"
      aria-busy="true"
    >
      <div className="h-6 w-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-64 animate-pulse rounded-3xl border border-border/50 bg-card" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card"
          />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-3xl border border-border/50 bg-card" />
    </div>
  );
}

function SummaryItem({
  Icon,
  label,
  value,
}: {
  Icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-bold leading-6 text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SubmissionSection({
  task,
}: {
  task: LocalClassroomTask;
}) {
  const assignedGrade =
    task.submission?.assignedGrade;
  const draftGrade = task.submission?.draftGrade;

  return (
    <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
          <CheckCircle2
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div>
          <h2 className="text-lg font-black text-foreground">
            حالة التسليم
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            الحالة المحفوظة من Google Classroom
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">
            الحالة
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {getSubmissionStateLabel(
              task.submission?.state,
            )}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">
            وقت التسليم
          </p>
          <p
            className={`mt-1 text-sm font-bold ${
              task.submission?.late
                ? "text-destructive"
                : "text-foreground"
            }`}
          >
            {task.submission?.late
              ? "تم التسليم متأخرًا"
              : "ليس متأخرًا"}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">
            الدرجة المعتمدة
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {assignedGrade !== null &&
            assignedGrade !== undefined
              ? assignedGrade
              : "لم تُرصد بعد"}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="text-xs text-muted-foreground">
            الدرجة الأولية
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {draftGrade !== null &&
            draftGrade !== undefined
              ? draftGrade
              : "غير متوفرة"}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ClassroomTaskDetails({
  taskId,
}: {
  taskId: string;
}) {
  const taskQuery = useGoogleClassroomTask(taskId);

  if (taskQuery.isPending) {
    return <DetailSkeleton />;
  }

  if (taskQuery.isError) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <Link
          href="/classroom"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          العودة إلى مهام Classroom
        </Link>

        <AsyncErrorState
          title="تعذر تحميل تفاصيل المهمة"
          description={
            taskQuery.error instanceof Error
              ? taskQuery.error.message
              : "أعد المحاولة بعد التحقق من الاتصال."
          }
          onRetry={() => taskQuery.refetch()}
          isRetrying={taskQuery.isFetching}
          className="rounded-3xl border border-border/50 bg-card p-8"
        />
      </div>
    );
  }

  const task = taskQuery.data;
  const status = STATUS_META[task.status];
  const StatusIcon = status.Icon;

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-6xl space-y-6"
    >
      <Link
        href="/classroom"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        العودة إلى مهام Classroom
      </Link>

      <header className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-5 shadow-sm sm:p-7">
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-accent blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${status.iconClass}`}
            >
              <StatusIcon
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.badgeClass}`}
                >
                  {status.label}
                </span>

                <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                  {getWorkTypeLabel(task.workType)}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black leading-tight text-foreground sm:text-3xl">
                {task.title}
              </h1>

              <p className="mt-2 text-sm font-bold text-primary">
                {task.course.name}
              </p>

              {task.course.section ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  الشعبة: {task.course.section}
                </p>
              ) : null}
            </div>
          </div>

          {task.alternateLink ? (
            <a
              href={task.alternateLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              فتح في Google Classroom
              <ExternalLink
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryItem
          Icon={CalendarClock}
          label="موعد التسليم"
          value={formatDate(
            task.dueAt,
            "لا يوجد موعد تسليم",
          )}
        />

        <SummaryItem
          Icon={CircleGauge}
          label="العلامة الكلية"
          value={
            task.maxPoints !== null
              ? `${task.maxPoints} درجة`
              : "غير محددة"
          }
        />

        <SummaryItem
          Icon={Clock3}
          label="آخر مزامنة"
          value={formatDate(
            task.lastSyncedAt,
            "غير معروف",
          )}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <div>
              <h2 className="text-lg font-black text-foreground">
                تعليمات المهمة
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                الوصف الكامل المرسل من المدرّس
              </p>
            </div>
          </div>

          {task.description ? (
            <div className="mt-5 whitespace-pre-wrap break-words rounded-2xl bg-muted/40 p-4 text-sm leading-8 text-foreground sm:p-5">
              {task.description}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              لا توجد تعليمات إضافية لهذه المهمة.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </div>
              <h2 className="font-black text-foreground">
                المقرر
              </h2>
            </div>

            <p className="mt-4 text-sm font-bold leading-6 text-foreground">
              {task.course.name}
            </p>

            {task.course.section ? (
              <p className="mt-1 text-xs text-muted-foreground">
                الشعبة: {task.course.section}
              </p>
            ) : null}

            {task.course.alternateLink ? (
              <a
                href={task.course.alternateLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                فتح المقرر
                <ExternalLink
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </a>
            ) : null}
          </section>

          <section className="rounded-3xl border border-info/20 bg-info/10 p-5 text-info">
            <div className="flex items-start gap-3">
              <Info
                className="mt-0.5 h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-sm font-black">
                  آلية التسليم
                </h2>
                <p className="mt-1 text-xs leading-6 opacity-85">
                  عرض التفاصيل يتم داخل مساري، أما رفع الملفات والتسليم النهائي فيتم عبر Google Classroom.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <SubmissionSection task={task} />
    </section>
  );
}