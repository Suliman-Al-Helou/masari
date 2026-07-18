"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  List,
  PanelLeftClose,
  PanelRightClose,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/lib/utils";
import type { AdminDoctor } from "@/types/admin";

import { DoctorDetailsPanel } from "@/components/admin/doctors/DoctorDetailsPanel";
import { DoctorSpecialtyIcon } from "./DoctorSpecialtyIcon";

interface DoctorsMasterDetailProps {
  doctors: AdminDoctor[];
  initialDoctorId: string;
  initialCourseCode?: string | null;
  onBack: () => void;
}

export function DoctorsMasterDetail({
  doctors,
  initialDoctorId,
  initialCourseCode,
  onBack,
}: DoctorsMasterDetailProps) {
  const shouldReduceMotion = useReducedMotion();

  const [selectedDoctorId, setSelectedDoctorId] =
    useState(initialDoctorId);

  const [selectedCourseCode, setSelectedCourseCode] = useState<
    string | null
  >(initialCourseCode ?? null);

  const [showDoctors, setShowDoctors] = useState(true);
  const [showDetails, setShowDetails] = useState(true);

  const selectedDoctor = useMemo(
    () =>
      doctors.find((doctor) => doctor.id === selectedDoctorId) ??
      doctors[0],
    [doctors, selectedDoctorId],
  );
const transition = shouldReduceMotion
  ? {
      duration: 0.01,
    }
  : {
      type: "spring" as const,
      stiffness: 190,
      damping: 24,
      mass: 0.9,
    };

  const selectDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedCourseCode(null);
    setShowDetails(true);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
          العودة إلى الجدول
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-pressed={showDoctors}
            onClick={() => {
              if (showDoctors && !showDetails) return;
              setShowDoctors((current) => !current);
            }}
            disabled={showDoctors && !showDetails}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showDoctors ? (
              <PanelRightClose
                aria-hidden="true"
                className="h-4 w-4"
              />
            ) : (
              <List aria-hidden="true" className="h-4 w-4" />
            )}

            {showDoctors ? "إخفاء الدكاترة" : "إظهار الدكاترة"}
          </button>

          <button
            type="button"
            aria-pressed={showDetails}
            onClick={() => {
              if (showDetails && !showDoctors) return;
              setShowDetails((current) => !current);
            }}
            disabled={showDetails && !showDoctors}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PanelLeftClose
              aria-hidden="true"
              className="h-4 w-4"
            />

            {showDetails ? "إخفاء التفاصيل" : "إظهار التفاصيل"}
          </button>
        </div>
      </header>

      <motion.div
        layout
        transition={transition}
        className="flex min-h-[650px] flex-col gap-4 xl:flex-row"
      >
        <AnimatePresence initial={false}>
          {showDoctors && (
            <motion.aside
              key="doctors-list"
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={transition}
              aria-label="قائمة الدكاترة"
              className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card h-200",
                showDetails
                  ? "w-full shrink-0 xl:w-[340px]"
                  : "w-full flex-1",
              )}
            >
              <div className="border-b border-border px-4 py-4">
                <h2 className="text-base font-bold text-foreground">
                  الدكاترة
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  {doctors.length} دكتور
                </p>
              </div>

              <div className="max-h-[720px] divide-y divide-border overflow-y-auto">
                {doctors.map((doctor) => {
                  const selected = doctor.id === selectedDoctor?.id;

                  return (
                    <button
                      key={doctor.id}
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      onClick={() => selectDoctor(doctor.id)}
                      className={cn(
                        "grid min-h-20 w-full items-center gap-3 px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        showDetails
                          ? "grid-cols-[auto_minmax(0,1fr)_auto]"
                          : "grid-cols-[auto_minmax(0,1fr)_minmax(180px,1fr)_auto]",
                        selected
                          ? "bg-primary/10"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <DoctorSpecialtyIcon major={doctor.major} />

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {doctor.name}
                        </span>

                        {showDetails && (
                          <span className="mt-1 block truncate text-xs text-muted-foreground">
                            {doctor.major}
                          </span>
                        )}
                      </span>

                      {!showDetails && (
                        <span className="hidden truncate text-xs text-muted-foreground sm:block">
                          {doctor.major} · {doctor.university}
                        </span>
                      )}

                      <span className="text-xs text-muted-foreground">
                        {doctor.courses.length} مواد
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false}>
          {showDetails && selectedDoctor && (
            <motion.section
              key="doctor-details"
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transition}
              aria-label={`تفاصيل ${selectedDoctor.name}`}
              className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <DoctorDetailsPanel
                doctorId={selectedDoctor.id}
                courseCode={selectedCourseCode}
                onCourseChange={setSelectedCourseCode}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    );
}