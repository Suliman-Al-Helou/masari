"use client";

import Link from "next/link";
import {
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock3,
  ExternalLink,
  Inbox,
  Link2,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import { ConnectGoogleClassroomButton } from "@/components/profile/ConnectGoogleClassroomButton";
import type {
  LocalClassroomTask,
  LocalClassroomTasksData,
  LocalClassroomTaskStatus,
} from "@/features/integrations/google-classroom/types";
import {
  useGoogleClassroomStatus,
  useGoogleClassroomTasks,
  useSyncGoogleClassroom,
} from "@/lib/hooks/integrations/useGoogleClassroom";
import { useToast } from "@/lib/context/ToastContext";

type TaskFilter =
  | "attention"
  | "all"
  | LocalClassroomTaskStatus;

const STATUS_META = {
  upcoming: {
    label: "قادمة",
    Icon: CalendarClock,
    badgeClass: "bg-info/10 text-info border-info/20",
    iconClass: "bg-info/10 text-info",
  },
  overdue: {
    label: "متأخرة",
    Icon: AlertCircle,
    badgeClass:
      "bg-destructive/10 text-destructive border-destructive/20",
    iconClass: "bg-destructive/10 text-destructive",
  },
  submitted: {
    label: "مسلّمة",
    Icon: CheckCircle2,
    badgeClass:
      "bg-success/10 text-success border-success/20",
    iconClass: "bg-success/10 text-success",
  },
  returned: {
    label: "تم التصحيح",
    Icon: BookOpenCheck,
    badgeClass:
      "bg-primary/10 text-primary border-primary/20",
    iconClass: "bg-primary/10 text-primary",
  },
  no_due_date: {
    label: "بلا موعد",
    Icon: Clock3,
    badgeClass:
      "bg-muted text-muted-foreground border-border",
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

const FILTERS: Array<{
  value: TaskFilter;
  label: string;
}> = [
  {
    value: "attention",
    label: "تحتاج متابعة",
  },
  {
    value: "upcoming",
    label: "قادمة",
  },
  {
    value: "overdue",
    label: "متأخرة",
  },
  {
    value: "submitted",
    label: "مسلّمة",
  },
  {
    value: "no_due_date",
    label: "بلا موعد",
  },
  {
    value: "all",
    label: "الكل",
  },
];

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
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
  }).format(date);
}

function getFilterCount(
  data: LocalClassroomTasksData,
  filter: TaskFilter,
): number {
  switch (filter) {
    case "attention":
      return (
        data.summary.upcoming +
        data.summary.overdue +
        data.summary.noDueDate
      );

    case "all":
      return data.summary.total;

    case "upcoming":
      return data.summary.upcoming;

    case "overdue":
      return data.summary.overdue;

    case "submitted":
      return data.summary.submitted;

    case "returned":
      return data.summary.returned;

    case "no_due_date":
      return data.summary.noDueDate;
  }
}

function matchesFilter(
  task: LocalClassroomTask,
  filter: TaskFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "attention") {
    return (
      task.status === "upcoming" ||
      task.status === "overdue" ||
      task.status === "no_due_date"
    );
  }

  return task.status === filter;
}

function ClassroomPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6"
      aria-label="جارٍ تحميل Google Classroom"
      aria-busy="true"
    >
      <div className="h-48 animate-pulse rounded-3xl border border-border/50 bg-card" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card"
          />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-border/50 bg-card"
          />
        ))}
      </div>
    </div>
  );
}

function ClassroomTasksSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border/50 bg-card"
          />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-border/50 bg-card"
          />
        ))}
      </div>
    </div>
  );
}

function ClassroomSummaryCards({
  data,
}: {
  data: LocalClassroomTasksData;
}) {
  const cards = [
    {
      label: "كل المهام",
      value: data.summary.total,
      Icon: ClipboardList,
      className: "bg-primary/10 text-primary",
    },
    {
      label: "قادمة",
      value: data.summary.upcoming,
      Icon: CalendarClock,
      className: "bg-info/10 text-info",
    },
    {
      label: "متأخرة",
      value: data.summary.overdue,
      Icon: AlertCircle,
      className: "bg-destructive/10 text-destructive",
    },
    {
      label: "مسلّمة",
      value: data.summary.submitted,
      Icon: CheckCircle2,
      className: "bg-success/10 text-success",
    },
    {
      label: "بلا موعد",
      value: data.summary.noDueDate,
      Icon: Clock3,
      className: "bg-muted text-muted-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map(({ label, value, Icon, className }) => (
        <div
          key={label}
          className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${className}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>

          <p className="mt-4 text-2xl font-black text-foreground">
            {value}
          </p>

          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function ClassroomTaskCard({
  task,
}: {
  task: LocalClassroomTask;
}) {
  const status = STATUS_META[task.status];
  const StatusIcon = status.Icon;

  return (
    <article className="group rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${status.iconClass}`}
        >
          <StatusIcon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-primary">
                {task.course.name}
              </p>

              <h2 className="mt-1 text-base font-bold leading-7 text-foreground sm:text-lg">
                {task.title}
              </h2>
            </div>

            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.badgeClass}`}
            >
              {status.label}
            </span>
          </div>

          {task.description ? (
            <p className="mt-3 line-clamp-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(
                task.dueAt,
                "لا يوجد موعد تسليم",
              )}
            </span>

            {task.maxPoints !== null ? (
              <span className="inline-flex items-center gap-1.5">
                <BookOpenCheck
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                العلامة: {task.maxPoints}
              </span>
            ) : null}

            {task.submission?.late ? (
              <span className="font-bold text-destructive">
                تسليم متأخر
              </span>
            ) : null}

            {task.submission?.assignedGrade !== null &&
            task.submission?.assignedGrade !== undefined ? (
              <span className="font-bold text-success">
                درجتك: {task.submission.assignedGrade}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] text-muted-foreground">
          المصدر: Google Classroom
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/classroom/tasks/${task.id}`}
            aria-label={`عرض تفاصيل مهمة ${task.title}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
          >
            عرض التفاصيل
            <ChevronLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>

          {task.alternateLink ? (
            <a
              href={task.alternateLink}
              target="_blank"
              rel="noreferrer"
              aria-label={`فتح مهمة ${task.title} في Google Classroom`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-foreground transition hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              Classroom
              <ExternalLink
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function DisconnectedState() {
  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-6 shadow-sm sm:p-10">
        <div
          aria-hidden="true"
          className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-accent blur-3xl"
        />

        <div className="relative mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Link2 className="h-8 w-8" aria-hidden="true" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-foreground sm:text-3xl">
            اربط Google Classroom بمساري
          </h1>

          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
            بعد الربط ستظهر المقررات والواجبات وحالة التسليم داخل لوحة المتعلم، مع بقاء التسليم النهائي عبر Google Classroom.
          </p>

          <div className="mt-6 w-full max-w-sm">
            <ConnectGoogleClassroomButton />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClassroomTasksView() {
  const [activeFilter, setActiveFilter] =
    useState<TaskFilter>("attention");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { Success, Error: ErrorToast } = useToast();

  const statusQuery = useGoogleClassroomStatus();
  const status = statusQuery.data;
  const isConnected = status?.connected === true;

  const tasksQuery =
    useGoogleClassroomTasks(isConnected);
  const syncMutation = useSyncGoogleClassroom();

  const data = tasksQuery.data;

  const visibleTasks = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = deferredSearch
      .trim()
      .toLocaleLowerCase("ar");

    return data.tasks.filter((task) => {
      if (!matchesFilter(task, activeFilter)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        task.title,
        task.course.name,
        task.description ?? "",
      ].some((value) =>
        value
          .toLocaleLowerCase("ar")
          .includes(normalizedSearch),
      );
    });
  }, [data, deferredSearch, activeFilter]);

  async function handleSync() {
    try {
      const result = await syncMutation.mutateAsync();

      Success(
        "تم تحديث Google Classroom",
        `تمت مزامنة ${result.tasksSynced} مهمة من ${result.coursesSynced} مقررًا`,
      );
    } catch (error) {
      ErrorToast(
        "تعذرت المزامنة",
        error instanceof Error
          ? error.message
          : "حاول مرة أخرى",
      );
    }
  }

  if (statusQuery.isPending) {
    return <ClassroomPageSkeleton />;
  }

  if (statusQuery.isError) {
    return (
      <AsyncErrorState
        title="تعذر قراءة حالة Google Classroom"
        description="تحقق من الاتصال ثم أعد المحاولة."
        onRetry={() => statusQuery.refetch()}
        isRetrying={statusQuery.isFetching}
        className="rounded-3xl border border-border/50 bg-card"
      />
    );
  }

  if (!status?.connected) {
    return <DisconnectedState />;
  }

  const isSyncing =
    syncMutation.isPending ||
    status.lastSyncStatus === "running";

  return (
    <section
      dir="rtl"
      className="mx-auto w-full max-w-7xl space-y-6"
    >
      <header className="relative overflow-hidden rounded-3xl border border-primary/15 bg-card p-5 shadow-sm sm:p-7">
        <div
          aria-hidden="true"
          className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-accent blur-3xl"
        />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <BookOpenCheck
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-foreground sm:text-3xl">
                  Google Classroom
                </h1>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  متصل
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                متابعة مهامك الجامعية وحالة التسليم من مكان واحد.
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                آخر مزامنة: {formatDate(
                  status.lastSyncedAt,
                  "لم تتم المزامنة بعد",
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleSync()}
            disabled={isSyncing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
          >
            {isSyncing ? (
              <LoaderCircle
                className="h-4 w-4 animate-spin motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {isSyncing
              ? "جارٍ التحديث..."
              : "تحديث البيانات"}
          </button>
        </div>
      </header>

      {status.lastSyncStatus === "error" ? (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-bold">
              فشلت آخر عملية مزامنة
            </p>
            <p className="mt-1 text-xs leading-5 opacity-80">
              {status.lastSyncError ??
                "اضغط تحديث البيانات لإعادة المحاولة."}
            </p>
          </div>
        </div>
      ) : null}

      {tasksQuery.isPending ? (
        <ClassroomTasksSkeleton />
      ) : null}

      {tasksQuery.isError ? (
        <AsyncErrorState
          title="تعذر تحميل مهام Google Classroom"
          description="البيانات محفوظة في Supabase، أعد المحاولة لقراءتها."
          onRetry={() => tasksQuery.refetch()}
          isRetrying={tasksQuery.isFetching}
          className="rounded-3xl border border-border/50 bg-card"
        />
      ) : null}

      {data ? (
        <>
          <ClassroomSummaryCards data={data} />

          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div
                className="flex gap-2 overflow-x-auto pb-1"
                aria-label="تصفية مهام Classroom"
              >
                {FILTERS.map((filter) => {
                  const isActive =
                    activeFilter === filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() =>
                        setActiveFilter(filter.value)
                      }
                      aria-pressed={isActive}
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition motion-reduce:transition-none ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {filter.label}
                      <span
                        className={
                          isActive
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        }
                      >
                        {getFilterCount(data, filter.value)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="relative block w-full xl:max-w-sm">
                <span className="sr-only">
                  البحث في المهام
                </span>
                <Search
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث عن مهمة أو مقرر..."
                  className="h-11 w-full rounded-xl border border-border bg-background pr-10 pl-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 motion-reduce:transition-none"
                />
              </label>
            </div>
          </div>

          {visibleTasks.length > 0 ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleTasks.map((task) => (
                <ClassroomTaskCard
                  key={task.id}
                  task={task}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Inbox className="h-7 w-7" aria-hidden="true" />
              </div>

              <h2 className="mt-4 font-bold text-foreground">
                لا توجد مهام مطابقة
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                غيّر التصنيف أو عبارة البحث لعرض نتائج أخرى.
              </p>

              <button
                type="button"
                onClick={() => {
                  setActiveFilter("attention");
                  setSearch("");
                }}
                className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline"
              >
                إعادة ضبط الفلاتر
                <ChevronLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}