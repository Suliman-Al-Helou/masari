"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Atom,
  BookOpen,
  ChevronRight,
  GraduationCap,
  LogOut,
  NotebookPen,
  Shield,
} from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import type { Variants } from "motion/react";

import {
  ADMIN_NAV_GROUPS,
  STUDENT_NAV_GROUPS,
} from "@/lib/constants/navigation";
import type { NavigationGroup, NavigationItem } from "@/types/navigation";
import type { UserRole } from "@/types";

interface SidebarProps {
  variant?: UserRole;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
  userName: string | null;
  userMajor?: string | null;
}

const ACADEMIC_DECORATIONS = [
  {
    Icon: BookOpen,
    top: "18%",
    left: "12%",
    delay: 0.2,
    rotate: -8,
  },
  {
    Icon: Atom,
    top: "52%",
    left: "68%",
    delay: 1.1,
    rotate: 10,
  },
  {
    Icon: NotebookPen,
    top: "76%",
    left: "16%",
    delay: 1.8,
    rotate: -5,
  },
] as const;

// ترتيب عناصر قائمة الجوال.
const MOBILE_ORBIT_POSITIONS = [
  { x: -24, y: -296 },
  { x: -60, y: -244 },
  { x: -82, y: -190 },
  { x: -72, y: -136 },
  { x: -42, y: -84 },
] as const;

const MOBILE_ORBIT_RINGS = [150, 230, 310, 390] as const;

const MOBILE_ORBIT_PARTICLES = [
  { right: 72, bottom: 104, delay: 0.1 },
  { right: 111, bottom: 145, delay: 0.35 },
  { right: 119, bottom: 211, delay: 0.6 },
  { right: 82, bottom: 267, delay: 0.85 },
  { right: 48, bottom: 326, delay: 1.1 },
] as const;
const BORDER_ROTATION_DEGREES = 1080; // 3 rotations
const BORDER_ROTATION_DURATION = 1.8;
const NAVIGATION_DELAY = 500;

const navigationItemVariants: Variants = {
  closed: {
    opacity: 1,
    x: 0,
  },
  open: {
    opacity: 1,
    x: [6, 0],
  },
  hover: {
    x: -3,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut",
    },
  },
};

const navigationIconVariants: Variants = {
  closed: {
    scale: 1,
    y: 0,
  },
  open: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.06,
    y: -1,
    transition: {
      duration: 0.18,
      ease: "easeOut",
    },
  },
};

function isItemActive(pathname: string, item: NavigationItem): boolean {
  if (item.match === "exact") {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function Sidebar({
  variant = "student",
  isOpen,
  onToggle,
  onLogout,
  userName,
  userMajor,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const [rotationCycle, setRotationCycle] = useState(0);

  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const navigationGroups: readonly NavigationGroup[] =
    variant === "admin" ? ADMIN_NAV_GROUPS : STUDENT_NAV_GROUPS;

  const mobileNavigationItems = navigationGroups.flatMap(
    (group) => group.items,
  );

  const isAdmin = variant === "admin";
  const BrandIcon = isAdmin ? Shield : GraduationCap;

  // إغلاق القائمة باستخدام Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onToggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onToggle]);

  // منع تمرير الصفحة وإدارة التركيز على الجوال.
  useEffect(() => {
    if (!isOpen) return;

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (!isMobile) return;

    const previousActiveElement = document.activeElement as HTMLElement | null;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    mobileCloseButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;

      previousActiveElement?.focus();
    };
  }, [isOpen]);

  const handleNavigate = (
    event: MouseEvent<HTMLAnchorElement>,
    item: NavigationItem,
  ) => {
    event.preventDefault();

    if (pendingHref || isItemActive(pathname, item)) {
      return;
    }

    // يبدأ دوران حدود العنصر الحالي.
    setPendingHref(item.href);
    setRotationCycle((current) => current + 1);

    // يبدأ الانتقال بعد ظهور حركة التحميل.
    navigationTimerRef.current = setTimeout(() => {
      router.push(item.href);
    }, NAVIGATION_DELAY);
  };
  useEffect(() => {
    if (!pendingHref) return;

    const reachedTarget =
      pathname === pendingHref || pathname.startsWith(`${pendingHref}/`);

    if (!reachedTarget) return;

    completionTimerRef.current = setTimeout(() => {
      setPendingHref(null);

      const isMobile = window.matchMedia("(max-width: 1023px)").matches;

      if (isMobile && isOpen) {
        onToggle();
      }
    }, BORDER_ROTATION_DURATION * 1000);

    return () => {
      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, [pathname, pendingHref, isOpen, onToggle]);

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      if (completionTimerRef.current) {
        clearTimeout(completionTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label="إغلاق القائمة الجانبية"
            onClick={onToggle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
            }}
            className="fixed inset-0 z-40 bg-[#09070d]/70 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar الخاص بالجوال */}
      <nav
        id="dashboard-sidebar"
        aria-label={isAdmin ? "تنقل لوحة الإدارة" : "التنقل الرئيسي"}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] right-5 z-50 h-16 w-16 overflow-visible lg:hidden"
      >
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="mobile-orbit-menu"
              key="mobile-orbit-menu"
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.25,
              }}
              className="absolute inset-0"
            >
              {/* المدارات تتحرك مرة واحدة فقط عند الفتح */}
              {MOBILE_ORBIT_RINGS.map((size, index) => (
                <motion.span
                  key={size}
                  aria-hidden="true"
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          scale: 0.35,
                          rotate: index % 2 === 0 ? -12 : 12,
                        }
                  }
                  animate={{
                    opacity: 0.18 - index * 0.025,
                    scale: 1,
                    rotate: 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.55,
                  }}
                  transition={{
                    opacity: {
                      duration: shouldReduceMotion ? 0 : 0.28,
                      delay: index * 0.04,
                    },
                    scale: {
                      type: "spring",
                      stiffness: 180,
                      damping: 24,
                      delay: index * 0.035,
                    },
                    rotate: {
                      duration: shouldReduceMotion ? 0 : 0.35,
                      ease: "easeOut",
                    },
                  }}
                  className="pointer-events-none absolute rounded-full border border-dashed border-sidebar-orbit-line"
                  style={{
                    width: size,
                    height: size,
                    right: 32 - size / 2,
                    bottom: 32 - size / 2,
                  }}
                />
              ))}

              {/* الجزيئات تظهر مرة واحدة ولا تستمر بالحركة */}
              {MOBILE_ORBIT_RINGS.map((size, index) => (
                <motion.span
                  key={`${size}-${isOpen}`}
                  aria-hidden="true"
                  initial={{
                    opacity: 0,
                    scale: 0.35,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: 0.18 - index * 0.025,
                    scale: 1,
                    rotate: index % 2 === 0 ? 720 : -720,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.55,
                  }}
                  transition={{
                    opacity: {
                      duration: shouldReduceMotion ? 0 : 0.28,
                      delay: index * 0.04,
                    },
                    scale: {
                      type: "spring",
                      stiffness: 180,
                      damping: 24,
                      delay: index * 0.035,
                    },
                    rotate: {
                      duration: shouldReduceMotion ? 0 : 1.2,
                      delay: index * 0.04,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }}
                  className="pointer-events-none absolute rounded-full border border-dashed border-sidebar-orbit-line"
                  style={{
                    width: size,
                    height: size,
                    right: 32 - size / 2,
                    bottom: 32 - size / 2,
                  }}
                />
              ))}

              {mobileNavigationItems.map((item, index) => {
                const position =
                  MOBILE_ORBIT_POSITIONS[
                    Math.min(index, MOBILE_ORBIT_POSITIONS.length - 1)
                  ];

                const active = isItemActive(pathname, item);

                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            x: 0,
                            y: 0,
                            opacity: 0,
                            scale: 0.25,
                          }
                    }
                    animate={{
                      x: position.x,
                      y: position.y,
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0.25,
                      transition: {
                        delay:
                          (mobileNavigationItems.length - index - 1) * 0.025,
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 20,
                      mass: 0.72,
                      delay: index * (shouldReduceMotion ? 0 : 0.055),
                    }}
                    className="pointer-events-auto absolute bottom-2.5 right-2.5 h-11 w-11"
                  >
                    <Link
                      href={item.href}
                      onClick={(event) => handleNavigate(event, item)}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.label}
                      className={`group relative flex h-11 w-11 items-center justify-center rounded-full border outline-none transition-[border-color,background-color,color] focus-visible:ring-2 focus-visible:ring-sidebar-orbit-gold ${
                        active
                          ? "border-[#ffe8a0] bg-gradient-to-br from-[#ffe8a0] via-sidebar-orbit-gold to-[#d99b3f] text-[#2b1909] shadow-[0_0_0_5px_rgba(248,201,99,0.12),0_0_28px_rgba(248,201,99,0.75)]"
                          : "border-sidebar-orbit-line/55 bg-gradient-to-br from-[#6f4b98] via-sidebar-orbit-surface to-sidebar-orbit-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(139,92,246,0.08),0_0_22px_rgba(139,92,246,0.34)]"
                      }`}
                    >
                      {active && (
                        <>
                          <motion.span
                            key={`${pathname}-${rotationCycle}-mobile-solid`}
                            aria-hidden="true"
                            initial={{ rotate: 0 }}
                            animate={{
                              rotate:
                                rotationCycle > 0 && !shouldReduceMotion
                                  ? BORDER_ROTATION_DEGREES
                                  : 0,
                            }}
                            transition={{
                              duration: shouldReduceMotion
                                ? 0
                                : BORDER_ROTATION_DURATION,
                              ease: "easeInOut",
                            }}
                            className="absolute -inset-1 rounded-full border-2 border-transparent border-r-sidebar-orbit-gold/50 border-t-[#fff0b7]"
                          />

                          <motion.span
                            key={`${pathname}-${rotationCycle}-mobile-dotted`}
                            aria-hidden="true"
                            initial={{ rotate: 0 }}
                            animate={{
                              rotate:
                                rotationCycle > 0 && !shouldReduceMotion
                                  ? BORDER_ROTATION_DEGREES
                                  : 0,
                            }}
                            transition={{
                              duration: shouldReduceMotion
                                ? 0
                                : BORDER_ROTATION_DURATION,
                              ease: "easeInOut",
                            }}
                            className="absolute -inset-2 rounded-full border border-dashed border-sidebar-orbit-gold/60"
                          />
                        </>
                      )}

                      <span className="absolute inset-[3px] rounded-full border border-white/15" />

                      <Icon aria-hidden="true" className="relative h-5 w-5" />

                      <span className="pointer-events-none absolute right-[calc(100%+0.55rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-orbit-line/15 bg-[#170c22]/95 px-2 py-1 text-[9px] font-medium text-white/85 shadow-[0_6px_18px_rgba(4,2,8,0.38)]">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}

              <motion.button
                type="button"
                onClick={onLogout}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        opacity: 0,
                        scale: 0,
                      }
                }
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0,
                }}
                whileTap={{ scale: 0.92 }}
                aria-label="تسجيل الخروج"
                className="absolute bottom-[350px] right-0 flex h-11 w-11 items-center justify-center rounded-full border border-destructive/50 bg-destructive text-destructive-foreground shadow-lg"
              >
                <LogOut aria-hidden="true" className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* زر فتح وإغلاق قائمة الجوال */}
        <motion.button
          ref={mobileCloseButtonRef}
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
          aria-controls="mobile-orbit-menu"
          aria-expanded={isOpen}
          whileTap={{ scale: 0.92 }}
          animate={{
            scale: isOpen ? 1.04 : 1,
          }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 22,
          }}
          className="pointer-events-auto absolute inset-0 flex items-center justify-center rounded-full border-2 border-[#ffe9a8] bg-gradient-to-br from-[#fff0bc] via-sidebar-orbit-gold to-[#d99b3f] text-[#2b1909] shadow-[0_0_0_6px_rgba(248,201,99,0.12),0_0_0_12px_rgba(248,201,99,0.055),0_0_34px_rgba(248,201,99,0.72)] outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <motion.span
            aria-hidden="true"
            animate={{
              rotate: isOpen ? 360 : 0,
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute -inset-1.5 rounded-full border-2 border-transparent border-r-[#b87927] border-t-[#fff4cb]"
          />

          <span className="absolute inset-[4px] rounded-full border border-white/50" />

          <BrandIcon aria-hidden="true" className="relative h-7 w-7" />
        </motion.button>
      </nav>

      {/* Sidebar الخاص بالشاشات الكبيرة */}
      <aside
        id="dashboard-sidebar-desktop"
        aria-label={
          isAdmin ? "القائمة الجانبية للإدارة" : "القائمة الجانبية للطالب"
        }
        className={`fixed right-0 top-0 z-50 hidden h-dvh w-64 flex-col overflow-visible text-white transition-[width] ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
          shouldReduceMotion ? "duration-0" : "duration-300"
        } ${isOpen ? "lg:w-64" : "lg:w-20"}`}
      >
        {/* خلفية الحالة المغلقة */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isOpen ? 0 : 1,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
          }}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-l-[1.75rem] border-l border-sidebar-orbit-line/30 bg-gradient-to-b from-sidebar-orbit-deep via-sidebar-orbit-base to-[#0d0715] shadow-[-12px_0_35px_rgba(61,28,92,0.24)]"
        />

        {/* خلفية الحالة المفتوحة */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: isOpen ? 1 : 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.25,
          }}
          className="pointer-events-none absolute inset-0 rounded-l-[2rem] border-y border-l border-[#8658c2]/35 bg-[linear-gradient(180deg,#241235_0%,#160a24_48%,#0d0715_100%)] shadow-[-18px_0_35px_rgba(54,27,82,0.22)]"
        />

        {/* الزخارف تتحرك مرة واحدة عند فتح القائمة */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {isOpen && (
            <motion.div
              initial={
                shouldReduceMotion
                  ? false
                  : {
                      opacity: 0,
                      rotate: -8,
                      scale: 0.98,
                    }
              }
              animate={{
                opacity: 1,
                rotate: 0,
                scale: 1,
              }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.45,
                ease: "easeOut",
              }}
              className="absolute -right-24 top-[22%] h-72 w-72 rounded-full border border-sidebar-orbit-line/10"
            />
          )}

          <div className="absolute right-5 top-0 h-40 w-40 rounded-full bg-sidebar-orbit-line/5 blur-3xl" />

          {isOpen &&
            ACADEMIC_DECORATIONS.map(({ Icon, top, left, delay, rotate }) => (
              <motion.div
                key={top}
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        y: 6,
                        rotate,
                        opacity: 0,
                      }
                }
                animate={{
                  y: 0,
                  rotate,
                  opacity: 0.1,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.35,
                  delay: shouldReduceMotion ? 0 : delay * 0.12,
                  ease: "easeOut",
                }}
                className="absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-sidebar-orbit-line/15 bg-sidebar-orbit-line/5 text-sidebar-orbit-line"
                style={{ top, left }}
              >
                <Icon className="h-5 w-5" />
              </motion.div>
            ))}
        </div>

        <div className="relative z-10 flex h-full min-h-0 flex-col p-4">
          <header
            className={`mb-7 flex h-14 shrink-0 items-center gap-2 ${
              isOpen ? "justify-between" : "lg:justify-center"
            }`}
          >
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="sidebar-brand"
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          x: 12,
                          scale: 0.94,
                        }
                  }
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    x: 8,
                    scale: 0.94,
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex min-w-0 items-center gap-3 overflow-hidden"
                >
                  <motion.div
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                            scale: 1.05,
                            rotate: -3,
                          }
                    }
                    whileTap={{
                      scale: 0.96,
                    }}
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sidebar-orbit-line/45 bg-gradient-to-br from-sidebar-orbit-line/30 via-sidebar-orbit-surface to-sidebar-orbit-base shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_10px_28px_rgba(62,30,92,0.45)]"
                  >
                    <span className="absolute inset-[3px] rounded-full border border-white/10" />

                    <BrandIcon
                      aria-hidden="true"
                      className="relative h-5 w-5 text-white"
                    />
                  </motion.div>

                  {userName && (
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-[20px] font-semibold text-white">
                        {userName}
                      </p>

                      {!isAdmin && userMajor && (
                        <p className="mt-0.5 truncate text-xs text-white/60">
                          {userMajor}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={onToggle}
              aria-label={
                isOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"
              }
              aria-controls="dashboard-sidebar-desktop"
              aria-expanded={isOpen}
              whileHover={shouldReduceMotion ? undefined : { scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              className={`relative hidden items-center justify-center rounded-full border border-sidebar-orbit-line/55 bg-sidebar-orbit-surface/85 text-sidebar-orbit-line shadow-[0_0_0_3px_rgba(139,92,246,0.08),0_0_18px_rgba(139,92,246,0.22)] transition-[width,height,color,background-color,border-color] hover:border-sidebar-orbit-gold/55 hover:bg-sidebar-orbit-gold/10 hover:text-sidebar-orbit-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:flex ${
                isOpen ? "h-9 w-9" : "h-12 w-12"
              }`}
            >
              <motion.span
                aria-hidden="true"
                animate={{
                  rotate: isOpen ? 0 : 180,
                }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.25,
                  ease: "easeOut",
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.span>
            </motion.button>
          </header>

          <LayoutGroup id={`sidebar-navigation-${variant}`}>
            <nav
              aria-label={isAdmin ? "تنقل لوحة الإدارة" : "التنقل الرئيسي"}
              className="relative min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden pe-0.5"
            >
              {/* الخط العمودي */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-2 top-2 z-0 w-px bg-gradient-to-b from-transparent via-sidebar-orbit-line/55 to-transparent shadow-[0_0_10px_rgba(167,139,250,0.52)] transition-[right] ${
                  shouldReduceMotion ? "duration-0" : "duration-200"
                } ${isOpen ? "right-8" : "right-1/2"}`}
              />

              {navigationGroups.map((group, groupIndex) => (
                <div
                  key={group.label ?? `navigation-group-${groupIndex}`}
                  className="relative z-10"
                >
                  {group.label && (
                    <p
                      className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-orbit-muted/65 transition-[height,opacity] ${
                        shouldReduceMotion ? "duration-0" : "duration-200"
                      } ${isOpen ? "h-auto opacity-100" : "h-0 opacity-0"}`}
                    >
                      {group.label}
                    </p>
                  )}

                  <div className="space-y-1.5">
                    {group.items.map((item, itemIndex) => {
                      const active = isItemActive(pathname, item);

                      const Icon = item.icon;

                      return (
                        <motion.div
                          key={item.href}
                          variants={navigationItemVariants}
                          initial={false}
                          animate={isOpen ? "open" : "closed"}
                          whileHover="hover"
                          whileTap="tap"
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.25,
                            delay: shouldReduceMotion
                              ? 0
                              : groupIndex * 0.04 + itemIndex * 0.025,
                            ease: "easeOut",
                          }}
                          className="group relative"
                        >
                          <Link
                            href={item.href}
                            onClick={(event) => handleNavigate(event, item)}
                            aria-current={active ? "page" : undefined}
                            aria-label={!isOpen ? item.label : undefined}
                            title={!isOpen ? item.label : undefined}
                            className={`relative flex min-h-14 items-center gap-3 rounded-2xl px-2 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line ${
                              active
                                ? "text-sidebar-orbit-gold"
                                : "text-white/70 hover:text-white"
                            } ${!isOpen ? "lg:justify-center" : ""}`}
                          >
                            {active && (
                              <motion.span
                                layoutId={`sidebar-active-orbit-${variant}`}
                                aria-hidden="true"
                                transition={{
                                  duration: shouldReduceMotion ? 0 : 0.2,
                                  ease: "easeOut",
                                }}
                                className="absolute inset-0 rounded-2xl border border-sidebar-orbit-gold/25 bg-gradient-to-l from-sidebar-orbit-gold/10 via-sidebar-orbit-gold/5 to-transparent"
                              />
                            )}

                            {/* الخط بين الأيقونة والمسار */}
                            <span
                              aria-hidden="true"
                              className={`absolute right-[3.2rem] top-1/2 h-px -translate-y-1/2 transition-[width,background-color,opacity] duration-200 ${
                                !isOpen
                                  ? "w-0 opacity-0"
                                  : active
                                    ? "w-5 bg-sidebar-orbit-gold/80 opacity-100"
                                    : "w-3 bg-sidebar-orbit-line/30 opacity-60 group-hover:w-5 group-hover:bg-sidebar-orbit-line/70 group-hover:opacity-100"
                              }`}
                            />

                            <motion.span
                              variants={navigationIconVariants}
                              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-[border-color,color,background-color] duration-200 ${
                                active
                                  ? "border-sidebar-orbit-gold/80 text-[#2c1908] shadow-[0_0_0_4px_rgba(248,201,99,0.10),0_0_24px_rgba(248,201,99,0.38)]"
                                  : "border-sidebar-orbit-line/35 bg-gradient-to-br from-sidebar-orbit-line/25 via-sidebar-orbit-surface/90 to-sidebar-orbit-base text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(27,12,45,0.35)] group-hover:border-sidebar-orbit-line/70 group-hover:text-white"
                              }`}
                            >
                              {active && (
                                <>
                                  <motion.span
                                    layoutId={`sidebar-active-icon-fill-${variant}`}
                                    aria-hidden="true"
                                    transition={{
                                      duration: shouldReduceMotion ? 0 : 0.2,
                                      ease: "easeOut",
                                    }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffe9a9] via-sidebar-orbit-gold to-[#d99b3f]"
                                  />

                                  {/* حدود ثابتة بدون دوران دائم */}
                                  {/* Solid border */}
                                  <motion.span
                                    key={`${pathname}-desktop-solid`}
                                    aria-hidden="true"
                                    initial={{ rotate: 0 }}
                                    animate={{
                                      rotate: shouldReduceMotion ? 0 : 1080,
                                    }}
                                    transition={{
                                      duration: shouldReduceMotion ? 0 : 2.2,
                                      ease: "linear",
                                    }}
                                    className="absolute -inset-1 rounded-full border-2 border-transparent border-r-sidebar-orbit-gold/35 border-t-[#fff0b7]"
                                  />

                                  {/* Dotted border */}
                                  <motion.span
                                    key={`${pathname}-desktop-dotted`}
                                    aria-hidden="true"
                                    initial={{ rotate: 0 }}
                                    animate={{
                                      rotate: shouldReduceMotion ? 0 : 1080,
                                    }}
                                    transition={{
                                      duration: shouldReduceMotion ? 0 : 2.2,
                                      ease: "linear",
                                    }}
                                    className="absolute -inset-2 rounded-full border border-dashed border-sidebar-orbit-gold/55"
                                  />
                                </>
                              )}

                              <span className="absolute inset-[3px] rounded-full border border-white/10" />

                              <Icon
                                aria-hidden="true"
                                className="relative z-10 h-5 w-5"
                              />
                            </motion.span>

                            <span
                              className={`relative z-10 overflow-hidden whitespace-nowrap text-[13px] transition-[opacity,color] ${
                                shouldReduceMotion
                                  ? "duration-0"
                                  : "duration-200"
                              } ${
                                isOpen ? "opacity-100" : "opacity-0 lg:hidden"
                              } ${
                                active
                                  ? "font-semibold text-sidebar-orbit-gold"
                                  : "text-white/75 group-hover:text-white"
                              }`}
                            >
                              {item.label}
                            </span>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </LayoutGroup>

          {/* تسجيل الخروج */}
          <div className="relative mt-4 shrink-0 overflow-hidden rounded-[1.35rem] border border-sidebar-orbit-line/20 bg-sidebar-orbit-surface/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(8,3,14,0.28)]">
            <div
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-orbit-gold/45 to-transparent"
            />

            <motion.button
              type="button"
              onClick={onLogout}
              aria-label={!isOpen ? "تسجيل الخروج" : undefined}
              title={!isOpen ? "تسجيل الخروج" : undefined}
              whileHover={shouldReduceMotion ? undefined : { x: -2 }}
              whileTap={{
                scale: 0.98,
              }}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line ${
                !isOpen ? "lg:justify-center" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-colors group-hover:border-sidebar-orbit-gold/35 group-hover:bg-sidebar-orbit-gold/10 group-hover:text-sidebar-orbit-gold">
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </span>

              <span
                className={`overflow-hidden whitespace-nowrap transition-opacity ${
                  shouldReduceMotion ? "duration-0" : "duration-200"
                } ${isOpen ? "opacity-100" : "opacity-0 lg:hidden"}`}
              >
                تسجيل الخروج
              </span>
            </motion.button>
          </div>
        </div>
      </aside>
    </>
  );
}
