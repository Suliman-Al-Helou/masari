// "use client";

// import { useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { ChevronRight, GraduationCap, LogOut, Shield, X } from "lucide-react";

// import {
//   ADMIN_NAV_GROUPS,
//   STUDENT_NAV_GROUPS,
// } from "@/lib/constants/navigation";
// import type { NavigationGroup, NavigationItem } from "@/types/navigation";
// import type { UserRole } from "@/types";

// interface SidebarProps {
//   variant?: UserRole;
//   isOpen: boolean;
//   onToggle: () => void;
//   onLogout: () => void;
//   userName: string | null;
//   userMajor?: string | null;
// }

// function isItemActive(pathname: string, item: NavigationItem): boolean {
//   if (item.match === "exact") {
//     return pathname === item.href;
//   }

//   return pathname === item.href || pathname.startsWith(`${item.href}/`);
// }

// export default function Sidebar({
//   variant = "student",
//   isOpen,
//   onToggle,
//   onLogout,
//   userName,
//   userMajor,
// }: SidebarProps) {
//   const pathname = usePathname();
//   const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

//   const navigationGroups: readonly NavigationGroup[] =
//     variant === "admin" ? ADMIN_NAV_GROUPS : STUDENT_NAV_GROUPS;

//   const isAdmin = variant === "admin";
//   const BrandIcon = isAdmin ? Shield : GraduationCap;

//   // إغلاق القائمة باستخدام Escape
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         onToggle();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isOpen, onToggle]);

//   // إدارة التركيز ومنع تمرير الصفحة خلف قائمة الموبايل
//   useEffect(() => {
//     if (!isOpen) return;

//     const isMobile = window.matchMedia("(max-width: 1023px)").matches;

//     if (!isMobile) return;

//     const previousActiveElement = document.activeElement as HTMLElement | null;

//     const previousOverflow = document.body.style.overflow;

//     document.body.style.overflow = "hidden";

//     mobileCloseButtonRef.current?.focus();

//     return () => {
//       document.body.style.overflow = previousOverflow;
//       previousActiveElement?.focus();
//     };
//   }, [isOpen]);

//   const handleNavigate = () => {
//     const isMobile = window.matchMedia("(max-width: 1023px)").matches;

//     if (isMobile && isOpen) {
//       onToggle();
//     }
//   };

//   return (
//     <>
//       {isOpen && (
//         <button
//           type="button"
//           tabIndex={-1}
//           aria-label="إغلاق القائمة الجانبية"
//           onClick={onToggle}
//           className="fixed inset-0 z-40 bg-black/40 lg:hidden"
//         />
//       )}

//       <aside
//         id="dashboard-sidebar"
//         aria-label={
//           isAdmin ? "القائمة الجانبية للإدارة" : "القائمة الجانبية للطالب"
//         }
//         className={`fixed right-0 top-0 z-50 flex h-dvh w-64 flex-col bg-sidebar-background text-white shadow-xl motion-safe:transition-[width,transform] motion-safe:duration-300 motion-safe:ease-in-out lg:translate-x-0 ${
//           isOpen ? "translate-x-0 lg:w-64" : "translate-x-full lg:w-20"
//         }`}
//       >
//         <div className="flex h-full min-h-0 flex-col p-4">
//           <header
//             className={`mb-8 flex mt- h-12 shrink-0 items-center ${
//               isOpen ? "justify-between" : "lg:justify-center"
//             }`}
//           >
//             <div className="flex min-w-0 items-center gap-3 overflow-hidden ">
//               <span
//                 className={`whitespace-nowrap text-xl font-bold motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                   isOpen ? "w-auto opacity-100" : "w-0 opacity-0 lg:hidden"
//                 }`}
//               >
//                 {userName && (
//                   <div
//                     className={`mb-3 flex items-center gap-3 rounded-xl p-3 ${
//                       !isOpen ? "lg:justify-center" : ""
//                     }`}
//                   >
//                     <div
//                       aria-hidden="true"
//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold"
//                     >
//                       {userName.trim().charAt(0)}
//                     </div>

//                     <div
//                       className={`min-w-0 overflow-hidden motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                         isOpen
//                           ? "w-auto opacity-100"
//                           : "w-0 opacity-0 lg:hidden"
//                       }`}
//                     >
//                       <p className="truncate text-sm font-semibold text-white">
//                         {userName}
//                       </p>

//                       {!isAdmin && userMajor && (
//                         <p className="mt-0.5 truncate text-xs text-white/60">
//                           {userMajor}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </span>
//             </div>

//             <button
//               ref={mobileCloseButtonRef}
//               type="button"
//               onClick={onToggle}
//               aria-label="إغلاق القائمة الجانبية"
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
//             >
//               <X aria-hidden="true" className="h-5 w-5" />
//             </button>

//             <button
//               type="button"
//               onClick={onToggle}
//               aria-label={
//                 isOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"
//               }
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               className={`hidden h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:flex ${
//                 isOpen ? "" : "rotate-180"
//               }`}
//             >
//               <ChevronRight aria-hidden="true" className="h-4 w-4" />
//             </button>
//           </header>

//           <nav
//             aria-label={isAdmin ? "تنقل لوحة الإدارة" : "التنقل الرئيسي"}
//             className="min-h-0 flex-1 space-y-5 overflow-y-auto"
//           >
//             {navigationGroups.map((group, groupIndex) => (
//               <div key={group.label ?? `navigation-group-${groupIndex}`}>
//                 {group.label && (
//                   <p
//                     className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-xs font-semibold text-white/50 motion-safe:transition-opacity ${
//                       isOpen ? "opacity-100" : "h-0 opacity-0"
//                     }`}
//                   >
//                     {group.label}
//                   </p>
//                 )}

//                 <div className="space-y-1">
//                   {group.items.map((item) => {
//                     const active = isItemActive(pathname, item);
//                     const Icon = item.icon;

//                     return (
//                       <Link
//                         key={item.href}
//                         href={item.href}
//                         onClick={handleNavigate}
//                         aria-current={active ? "page" : undefined}
//                         aria-label={!isOpen ? item.label : undefined}
//                         title={!isOpen ? item.label : undefined}
//                         className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
//                           active
//                             ? "bg-white/20 text-white shadow-sm"
//                             : "text-white/70 hover:bg-white/10 hover:text-white"
//                         } ${!isOpen ? "lg:justify-center" : ""}`}
//                       >
//                         <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />

//                         <span
//                           className={`overflow-hidden whitespace-nowrap motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                             isOpen
//                               ? "w-auto opacity-100"
//                               : "w-0 opacity-0 lg:hidden"
//                           }`}
//                         >
//                           {item.label}
//                         </span>
//                       </Link>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </nav>

//           <div className="mt-4 shrink-0 border-t border-white/10 pt-4">
//             <button
//               type="button"
//               onClick={onLogout}
//               aria-label={!isOpen ? "تسجيل الخروج" : undefined}
//               title={!isOpen ? "تسجيل الخروج" : undefined}
//               className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-red-800  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none ${
//                 !isOpen ? "lg:justify-center" : ""
//               }`}
//             >
//               <LogOut aria-hidden="true" className="h-5 w-5 shrink-0" />

//               <span
//                 className={`overflow-hidden whitespace-nowrap motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                   isOpen ? "w-auto opacity-100" : "w-0 opacity-0 lg:hidden"
//                 }`}
//               >
//                 تسجيل الخروج
//               </span>
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }

// "use client";

// import { useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   ChevronRight,
//   GraduationCap,
//   LogOut,
//   Shield,
//   X,
// } from "lucide-react";
// import {
//   LayoutGroup,
//   motion,
//   useReducedMotion,
// } from "motion/react";
// import type { Variants } from "motion/react";

// import {
//   ADMIN_NAV_GROUPS,
//   STUDENT_NAV_GROUPS,
// } from "@/lib/constants/navigation";
// import type {
//   NavigationGroup,
//   NavigationItem,
// } from "@/types/navigation";
// import type { UserRole } from "@/types";

// interface SidebarProps {
//   variant?: UserRole;
//   isOpen: boolean;
//   onToggle: () => void;
//   onLogout: () => void;
// }

// const ORBITAL_STARS = [
//   { top: "8%", left: "22%", size: 2, opacity: 0.45 },
//   { top: "14%", left: "72%", size: 1, opacity: 0.4 },
//   { top: "25%", left: "16%", size: 1, opacity: 0.32 },
//   { top: "34%", left: "81%", size: 2, opacity: 0.28 },
//   { top: "47%", left: "12%", size: 2, opacity: 0.38 },
//   { top: "57%", left: "68%", size: 1, opacity: 0.42 },
//   { top: "69%", left: "24%", size: 1, opacity: 0.3 },
//   { top: "78%", left: "76%", size: 2, opacity: 0.34 },
//   { top: "89%", left: "18%", size: 1, opacity: 0.38 },
// ] as const;

// const navigationItemVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     x: 8,
//   },
//   rest: {
//     opacity: 1,
//     x: 0,
//   },
//   hover: {
//     x: -3,
//     transition: {
//       duration: 0.18,
//       ease: "easeOut",
//     },
//   },
//   tap: {
//     scale: 0.98,
//     transition: {
//       duration: 0.1,
//       ease: "easeOut",
//     },
//   },
// };

// const navigationIconVariants: Variants = {
//   rest: {
//     scale: 1,
//     y: 0,
//   },
//   hover: {
//     scale: 1.06,
//     y: -1,
//     transition: {
//       duration: 0.18,
//       ease: "easeOut",
//     },
//   },
// };

// function isItemActive(
//   pathname: string,
//   item: NavigationItem,
// ): boolean {
//   if (item.match === "exact") {
//     return pathname === item.href;
//   }

//   return (
//     pathname === item.href ||
//     pathname.startsWith(`${item.href}/`)
//   );
// }

// export default function Sidebar({
//   variant = "student",
//   isOpen,
//   onToggle,
//   onLogout,
// }: SidebarProps) {
//   const pathname = usePathname();
//   const shouldReduceMotion = useReducedMotion();
//   const mobileCloseButtonRef =
//     useRef<HTMLButtonElement>(null);

//   const navigationGroups: readonly NavigationGroup[] =
//     variant === "admin"
//       ? ADMIN_NAV_GROUPS
//       : STUDENT_NAV_GROUPS;

//   const isAdmin = variant === "admin";
//   const BrandIcon = isAdmin ? Shield : GraduationCap;
//   const sidebarTitle = isAdmin
//     ? "لوحة الإدارة"
//     : "مساري";

//   // إغلاق القائمة باستخدام Escape
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         onToggle();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener(
//         "keydown",
//         handleKeyDown,
//       );
//     };
//   }, [isOpen, onToggle]);

//   // إدارة التركيز ومنع تمرير الصفحة خلف قائمة الموبايل
//   useEffect(() => {
//     if (!isOpen) return;

//     const isMobile = window.matchMedia(
//       "(max-width: 1023px)",
//     ).matches;

//     if (!isMobile) return;

//     const previousActiveElement =
//       document.activeElement as HTMLElement | null;

//     const previousOverflow =
//       document.body.style.overflow;

//     document.body.style.overflow = "hidden";

//     mobileCloseButtonRef.current?.focus();

//     return () => {
//       document.body.style.overflow = previousOverflow;
//       previousActiveElement?.focus();
//     };
//   }, [isOpen]);

//   const handleNavigate = () => {
//     const isMobile = window.matchMedia(
//       "(max-width: 1023px)",
//     ).matches;

//     if (isMobile && isOpen) {
//       onToggle();
//     }
//   };

//   return (
//     <>
//       {isOpen && (
//         <button
//           type="button"
//           tabIndex={-1}
//           aria-label="إغلاق القائمة الجانبية"
//           onClick={onToggle}
//           className="fixed inset-0 z-40 bg-[#09070d]/70 backdrop-blur-[2px] lg:hidden"
//         />
//       )}

//       <aside
//         id="dashboard-sidebar"
//         aria-label={
//           isAdmin
//             ? "القائمة الجانبية للإدارة"
//             : "القائمة الجانبية للطالب"
//         }
//         className={`fixed right-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-visible text-white motion-safe:transition-[width,transform] motion-safe:duration-300 motion-safe:ease-in-out lg:translate-x-0 ${
//           isOpen
//             ? "translate-x-0 lg:w-64"
//             : "translate-x-full lg:w-20"
//         }`}
//       >
//         {/* الخلفية المستطيلة تظهر فقط عند طي القائمة حتى لا تمتد الموجة فوق المحتوى */}
//         <motion.div
//           aria-hidden="true"
//           initial={false}
//           animate={{ opacity: isOpen ? 0 : 1 }}
//           transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
//           className="pointer-events-none absolute inset-0 overflow-hidden rounded-l-[1.75rem] border-l border-sidebar-orbit-line/30 bg-gradient-to-b from-sidebar-orbit-deep via-sidebar-orbit-base to-[#0d0715] shadow-[-12px_0_35px_rgba(61,28,92,0.24)]"
//         />

//         {/* موجة SVG معكوسة لتناسب وجود القائمة في يمين واجهة RTL */}
//         <motion.svg
//           aria-hidden="true"
//           viewBox="0 0 320 1000"
//           preserveAspectRatio="none"
//           initial={false}
//           animate={{ opacity: isOpen ? 1 : 0 }}
//           transition={{ duration: shouldReduceMotion ? 0 : 0.28 }}
//           className="pointer-events-none absolute inset-y-0 -left-12 right-0 h-full w-[calc(100%+3rem)] overflow-visible drop-shadow-[-18px_0_35px_rgba(54,27,82,0.22)]"
//         >
//           <defs>
//             <linearGradient
//               id={`sidebar-wave-${variant}`}
//               x1="0"
//               y1="0"
//               x2="1"
//               y2="1"
//             >
//               <stop offset="0%" stopColor="#241235" />
//               <stop offset="48%" stopColor="#160a24" />
//               <stop offset="100%" stopColor="#0d0715" />
//             </linearGradient>

//             <filter
//               id={`sidebar-wave-glow-${variant}`}
//               x="-80%"
//               y="-10%"
//               width="220%"
//               height="120%"
//             >
//               <feGaussianBlur stdDeviation="6" />
//             </filter>
//           </defs>

//           <path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000 L 320 1000 L 320 0 Z"
//             fill={`url(#sidebar-wave-${variant})`}
//           />

//           <motion.path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
//             fill="none"
//             stroke="#9f74dd"
//             strokeWidth="9"
//             filter={`url(#sidebar-wave-glow-${variant})`}
//             animate={
//               shouldReduceMotion
//                 ? { opacity: 0.34 }
//                 : { opacity: [0.24, 0.5, 0.24] }
//             }
//             transition={{
//               duration: 4,
//               ease: "easeInOut",
//               repeat: shouldReduceMotion ? 0 : Infinity,
//             }}
//           />

//           <path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
//             fill="none"
//             stroke="#8658c2"
//             strokeWidth="2"
//             opacity="0.86"
//           />
//         </motion.svg>

//         {/* نجوم ومدارات زخرفية لا تشارك في التفاعل */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 overflow-hidden"
//         >
//           <div className="absolute -right-24 top-[22%] h-72 w-72 rounded-full border border-sidebar-orbit-line/10" />
//           <div className="absolute -left-20 top-[48%] h-52 w-52 rounded-full border border-dashed border-sidebar-orbit-line/10" />
//           <div className="absolute right-5 top-0 h-40 w-40 rounded-full bg-sidebar-orbit-line/5 blur-3xl" />

//           {ORBITAL_STARS.map((star, index) => (
//             <span
//               key={index}
//               className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(196,181,253,0.75)]"
//               style={{
//                 top: star.top,
//                 left: star.left,
//                 width: star.size,
//                 height: star.size,
//                 opacity: star.opacity,
//               }}
//             />
//           ))}
//         </div>

//         <div className="relative z-10 flex h-full min-h-0 flex-col p-4">
//           <header
//             className={`mb-7 flex h-14 shrink-0 items-center ${
//               isOpen
//                 ? "justify-between"
//                 : "lg:justify-center"
//             }`}
//           >
//             <div className="flex min-w-0 items-center gap-3 overflow-hidden">
//               <motion.div
//                 whileHover={
//                   shouldReduceMotion
//                     ? undefined
//                     : { scale: 1.06, rotate: -3 }
//                 }
//                 whileTap={
//                   shouldReduceMotion
//                     ? undefined
//                     : { scale: 0.96 }
//                 }
//                 className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sidebar-orbit-line/45 bg-gradient-to-br from-sidebar-orbit-line/30 via-sidebar-orbit-surface to-sidebar-orbit-base shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_10px_28px_rgba(62,30,92,0.45)]"
//               >
//                 <span className="absolute inset-[3px] rounded-full border border-white/10" />
//                 <BrandIcon
//                   aria-hidden="true"
//                   className="relative h-5 w-5 text-white"
//                 />
//               </motion.div>

//               <span
//                 className={`whitespace-nowrap bg-gradient-to-l from-white via-[#e9dcff] to-sidebar-orbit-line bg-clip-text text-xl font-bold text-transparent motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                   isOpen
//                     ? "w-auto opacity-100"
//                     : "w-0 opacity-0 lg:hidden"
//                 }`}
//               >
//                 {sidebarTitle}
//               </span>
//             </div>

//             <button
//               ref={mobileCloseButtonRef}
//               type="button"
//               onClick={onToggle}
//               aria-label="إغلاق القائمة الجانبية"
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:border-sidebar-orbit-line/40 hover:bg-sidebar-orbit-line/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:hidden"
//             >
//               <X
//                 aria-hidden="true"
//                 className="h-5 w-5"
//               />
//             </button>

//             <button
//               type="button"
//               onClick={onToggle}
//               aria-label={
//                 isOpen
//                   ? "طي القائمة الجانبية"
//                   : "توسيع القائمة الجانبية"
//               }
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               className={`hidden h-9 w-9 items-center justify-center rounded-full border border-sidebar-orbit-line/25 bg-sidebar-orbit-surface/70 text-sidebar-orbit-line backdrop-blur-md transition-[color,background-color,border-color,transform] hover:border-sidebar-orbit-gold/45 hover:bg-sidebar-orbit-gold/10 hover:text-sidebar-orbit-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:flex ${
//                 isOpen ? "" : "rotate-180"
//               }`}
//             >
//               <ChevronRight
//                 aria-hidden="true"
//                 className="h-4 w-4"
//               />
//             </button>
//           </header>

//           <LayoutGroup id={`sidebar-navigation-${variant}`}>
//             <nav
//               aria-label={
//                 isAdmin
//                   ? "تنقل لوحة الإدارة"
//                   : "التنقل الرئيسي"
//               }
//               className="relative min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden pe-0.5"
//             >
//               {/* المسار الرأسي الذي يربط دوائر التنقل */}
//               <div
//                 aria-hidden="true"
//                 className={`pointer-events-none absolute bottom-2 top-2 z-0 w-px bg-gradient-to-b from-transparent via-sidebar-orbit-line/55 to-transparent shadow-[0_0_10px_rgba(167,139,250,0.52)] motion-safe:transition-[right] motion-safe:duration-300 ${
//                   isOpen ? "right-8" : "right-1/2"
//                 }`}
//               />

//               {navigationGroups.map(
//                 (group, groupIndex) => (
//                   <div
//                     key={
//                       group.label ??
//                       `navigation-group-${groupIndex}`
//                     }
//                     className="relative z-10"
//                   >
//                     {group.label && (
//                       <p
//                         className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-orbit-muted/65 motion-safe:transition-[height,opacity] ${
//                           isOpen
//                             ? "h-auto opacity-100"
//                             : "h-0 opacity-0"
//                         }`}
//                       >
//                         {group.label}
//                       </p>
//                     )}

//                     <div className="space-y-1.5">
//                       {group.items.map((item, itemIndex) => {
//                         const active = isItemActive(
//                           pathname,
//                           item,
//                         );
//                         const Icon = item.icon;

//                         return (
//                           <motion.div
//                             key={item.href}
//                             variants={navigationItemVariants}
//                             initial={
//                               shouldReduceMotion
//                                 ? false
//                                 : "hidden"
//                             }
//                             animate="rest"
//                             whileHover={
//                               shouldReduceMotion
//                                 ? undefined
//                                 : "hover"
//                             }
//                             whileTap={
//                               shouldReduceMotion
//                                 ? undefined
//                                 : "tap"
//                             }
//                             transition={{
//                               duration: 0.28,
//                               delay: shouldReduceMotion
//                                 ? 0
//                                 : groupIndex * 0.05 +
//                                   itemIndex * 0.04,
//                               ease: "easeOut",
//                             }}
//                             className="group relative"
//                           >
//                             <Link
//                               href={item.href}
//                               onClick={handleNavigate}
//                               aria-current={
//                                 active ? "page" : undefined
//                               }
//                               aria-label={
//                                 !isOpen
//                                   ? item.label
//                                   : undefined
//                               }
//                               title={
//                                 !isOpen
//                                   ? item.label
//                                   : undefined
//                               }
//                               className={`relative flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl px-2 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line motion-reduce:transition-none ${
//                                 active
//                                   ? "text-sidebar-orbit-gold"
//                                   : "text-white/70 hover:text-white"
//                               } ${
//                                 !isOpen
//                                   ? "lg:justify-center"
//                                   : ""
//                               }`}
//                             >
//                               {active && (
//                                 <motion.span
//                                   layoutId={`sidebar-active-orbit-${variant}`}
//                                   aria-hidden="true"
//                                   transition={{
//                                     type: "spring",
//                                     stiffness: 380,
//                                     damping: 30,
//                                   }}
//                                   className="absolute inset-0 rounded-2xl border border-sidebar-orbit-gold/25 bg-gradient-to-l from-sidebar-orbit-gold/10 via-sidebar-orbit-gold/5 to-transparent"
//                                 />
//                               )}

//                               {/* خط أفقي صغير يصل المدار بالدائرة */}
//                               <span
//                                 aria-hidden="true"
//                                 className={`absolute right-[3.2rem] top-1/2 h-px -translate-y-1/2 transition-[width,background-color,opacity] duration-200 ${
//                                   active
//                                     ? "w-5 bg-sidebar-orbit-gold/80 opacity-100"
//                                     : "w-3 bg-sidebar-orbit-line/30 opacity-60 group-hover:w-5 group-hover:bg-sidebar-orbit-line/70 group-hover:opacity-100"
//                                 }`}
//                               />

//                               <motion.span
//                                 variants={navigationIconVariants}
//                                 className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-[border-color,color,background-color,box-shadow] duration-200 ${
//                                   active
//                                     ? "border-sidebar-orbit-gold/80 bg-gradient-to-br from-[#ffe59a] via-sidebar-orbit-gold to-[#d99b3f] text-[#2c1908] shadow-[0_0_0_4px_rgba(248,201,99,0.10),0_0_24px_rgba(248,201,99,0.38)]"
//                                     : "border-sidebar-orbit-line/35 bg-gradient-to-br from-sidebar-orbit-line/25 via-sidebar-orbit-surface/90 to-sidebar-orbit-base text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(27,12,45,0.35)] group-hover:border-sidebar-orbit-line/70 group-hover:text-white group-hover:shadow-[0_0_0_3px_rgba(139,92,246,0.09),0_0_22px_rgba(139,92,246,0.28)]"
//                                 }`}
//                               >
//                                 <span className="absolute inset-[3px] rounded-full border border-white/10" />

//                                 {active && (
//                                   <motion.span
//                                     aria-hidden="true"
//                                     animate={
//                                       shouldReduceMotion
//                                         ? { opacity: 0.32 }
//                                         : {
//                                             opacity: [0.22, 0.5, 0.22],
//                                             scale: [1, 1.12, 1],
//                                           }
//                                     }
//                                     transition={{
//                                       duration: 2.8,
//                                       ease: "easeInOut",
//                                       repeat: shouldReduceMotion
//                                         ? 0
//                                         : Infinity,
//                                     }}
//                                     className="absolute -inset-2 rounded-full border border-dashed border-sidebar-orbit-gold/55"
//                                   />
//                                 )}

//                                 <Icon
//                                   aria-hidden="true"
//                                   className="relative h-5 w-5"
//                                 />
//                               </motion.span>

//                               <span
//                                 className={`relative z-10 overflow-hidden whitespace-nowrap text-[13px] motion-safe:transition-[width,opacity,color] motion-safe:duration-300 ${
//                                   isOpen
//                                     ? "w-auto opacity-100"
//                                     : "w-0 opacity-0 lg:hidden"
//                                 } ${
//                                   active
//                                     ? "font-semibold text-sidebar-orbit-gold"
//                                     : "text-white/75 group-hover:text-white"
//                                 }`}
//                               >
//                                 {item.label}
//                               </span>
//                             </Link>
//                           </motion.div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ),
//               )}
//             </nav>
//           </LayoutGroup>

//           {/* Glass card سفلية؛ أبقينا وظيفة تسجيل الخروج نفسها دون تعديل */}
//           <div className="relative mt-4 shrink-0 overflow-hidden rounded-[1.35rem] border border-sidebar-orbit-line/20 bg-sidebar-orbit-surface/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(8,3,14,0.28)] backdrop-blur-xl">
//             <div
//               aria-hidden="true"
//               className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-orbit-gold/45 to-transparent"
//             />

//             <motion.button
//               type="button"
//               onClick={onLogout}
//               aria-label={
//                 !isOpen
//                   ? "تسجيل الخروج"
//                   : undefined
//               }
//               title={
//                 !isOpen
//                   ? "تسجيل الخروج"
//                   : undefined
//               }
//               whileHover={
//                 shouldReduceMotion
//                   ? undefined
//                   : { x: -2 }
//               }
//               whileTap={
//                 shouldReduceMotion
//                   ? undefined
//                   : { scale: 0.98 }
//               }
//               className={`group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line motion-reduce:transition-none ${
//                 !isOpen
//                   ? "lg:justify-center"
//                   : ""
//               }`}
//             >
//               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-colors group-hover:border-sidebar-orbit-gold/35 group-hover:bg-sidebar-orbit-gold/10 group-hover:text-sidebar-orbit-gold">
//                 <LogOut
//                   aria-hidden="true"
//                   className="h-4 w-4"
//                 />
//               </span>

//               <span
//                 className={`overflow-hidden whitespace-nowrap motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
//                   isOpen
//                     ? "w-auto opacity-100"
//                     : "w-0 opacity-0 lg:hidden"
//                 }`}
//               >
//                 تسجيل الخروج
//               </span>
//             </motion.button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }

// "use client";

// import { useEffect, useRef } from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   Atom,
//   BookOpen,
//   ChevronRight,
//   GraduationCap,
//   LogOut,
//   NotebookPen,
//   Shield,
//   X,
// } from "lucide-react";
// import {
//   AnimatePresence,
//   LayoutGroup,
//   motion,
//   useReducedMotion,
// } from "motion/react";
// import type { Variants } from "motion/react";

// import {
//   ADMIN_NAV_GROUPS,
//   STUDENT_NAV_GROUPS,
// } from "@/lib/constants/navigation";
// import type { NavigationGroup, NavigationItem } from "@/types/navigation";
// import type { UserRole } from "@/types";

// interface SidebarProps {
//   variant?: UserRole;
//   isOpen: boolean;
//   onToggle: () => void;
//   onLogout: () => void;
// }

// const ORBITAL_STARS = [
//   { top: "8%", left: "22%", size: 2, opacity: 0.45 },
//   { top: "14%", left: "72%", size: 1, opacity: 0.4 },
//   { top: "25%", left: "16%", size: 1, opacity: 0.32 },
//   { top: "34%", left: "81%", size: 2, opacity: 0.28 },
//   { top: "47%", left: "12%", size: 2, opacity: 0.38 },
//   { top: "57%", left: "68%", size: 1, opacity: 0.42 },
//   { top: "69%", left: "24%", size: 1, opacity: 0.3 },
//   { top: "78%", left: "76%", size: 2, opacity: 0.34 },
//   { top: "89%", left: "18%", size: 1, opacity: 0.38 },
// ] as const;

// const ACADEMIC_DECORATIONS = [
//   {
//     Icon: BookOpen,
//     top: "18%",
//     left: "12%",
//     delay: 0.2,
//     rotate: -8,
//   },
//   {
//     Icon: Atom,
//     top: "52%",
//     left: "68%",
//     delay: 1.1,
//     rotate: 10,
//   },
//   {
//     Icon: NotebookPen,
//     top: "76%",
//     left: "16%",
//     delay: 1.8,
//     rotate: -5,
//   },
// ] as const;

// const navigationItemVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     x: 8,
//   },
//   rest: {
//     opacity: 1,
//     x: 0,
//   },
//   hover: {
//     x: -3,
//     transition: {
//       duration: 0.18,
//       ease: "easeOut",
//     },
//   },
//   tap: {
//     scale: 0.98,
//     transition: {
//       duration: 0.1,
//       ease: "easeOut",
//     },
//   },
// };

// const navigationIconVariants: Variants = {
//   rest: {
//     scale: 1,
//     y: 0,
//   },
//   hover: {
//     scale: 1.06,
//     y: -1,
//     transition: {
//       duration: 0.18,
//       ease: "easeOut",
//     },
//   },
// };

// function isItemActive(pathname: string, item: NavigationItem): boolean {
//   if (item.match === "exact") {
//     return pathname === item.href;
//   }

//   return pathname === item.href || pathname.startsWith(`${item.href}/`);
// }

// export default function Sidebar({
//   variant = "student",
//   isOpen,
//   onToggle,
//   onLogout,
// }: SidebarProps) {
//   const pathname = usePathname();
//   const shouldReduceMotion = useReducedMotion();
//   const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

//   const navigationGroups: readonly NavigationGroup[] =
//     variant === "admin" ? ADMIN_NAV_GROUPS : STUDENT_NAV_GROUPS;

//   const isAdmin = variant === "admin";
//   const BrandIcon = isAdmin ? Shield : GraduationCap;
//   const sidebarTitle = isAdmin ? "لوحة الإدارة" : "مساري";

//   // إغلاق القائمة باستخدام Escape
//   useEffect(() => {
//     if (!isOpen) return;

//     const handleKeyDown = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         onToggle();
//       }
//     };

//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isOpen, onToggle]);

//   // إدارة التركيز ومنع تمرير الصفحة خلف قائمة الموبايل
//   useEffect(() => {
//     if (!isOpen) return;

//     const isMobile = window.matchMedia("(max-width: 1023px)").matches;

//     if (!isMobile) return;

//     const previousActiveElement = document.activeElement as HTMLElement | null;

//     const previousOverflow = document.body.style.overflow;

//     document.body.style.overflow = "hidden";

//     mobileCloseButtonRef.current?.focus();

//     return () => {
//       document.body.style.overflow = previousOverflow;
//       previousActiveElement?.focus();
//     };
//   }, [isOpen]);

//   const handleNavigate = () => {
//     const isMobile = window.matchMedia("(max-width: 1023px)").matches;

//     if (isMobile && isOpen) {
//       onToggle();
//     }
//   };

//   return (
//     <>
//       <AnimatePresence>
//         {isOpen && (
//           <motion.button
//             type="button"
//             tabIndex={-1}
//             aria-label="إغلاق القائمة الجانبية"
//             onClick={onToggle}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{
//               duration: shouldReduceMotion ? 0.12 : 0.24,
//             }}
//             className="fixed inset-0 z-40 bg-[#09070d]/70 backdrop-blur-[2px] lg:hidden"
//           />
//         )}
//       </AnimatePresence>

//       <aside
//         id="dashboard-sidebar"
//         aria-label={
//           isAdmin ? "القائمة الجانبية للإدارة" : "القائمة الجانبية للطالب"
//         }
//         className={`fixed right-0 top-0 z-50 flex h-dvh w-64 flex-col overflow-visible text-white transition-[width,transform] ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0 ${
//           shouldReduceMotion ? "duration-[350ms]" : "duration-500"
//         } ${isOpen ? "translate-x-0 lg:w-64" : "translate-x-full lg:w-20"}`}
//       >
//         {/* الخلفية المستطيلة تظهر فقط عند طي القائمة حتى لا تمتد الموجة فوق المحتوى */}
//         <motion.div
//           aria-hidden="true"
//           initial={false}
//           animate={{ opacity: isOpen ? 0 : 1 }}
//           transition={{ duration: shouldReduceMotion ? 0.24 : 0.32 }}
//           className="pointer-events-none absolute inset-0 overflow-hidden rounded-l-[1.75rem] border-l border-sidebar-orbit-line/30 bg-gradient-to-b from-sidebar-orbit-deep via-sidebar-orbit-base to-[#0d0715] shadow-[-12px_0_35px_rgba(61,28,92,0.24)]"
//         />

//         {/* موجة SVG معكوسة لتناسب وجود القائمة في يمين واجهة RTL */}
//         <motion.svg
//           aria-hidden="true"
//           viewBox="0 0 320 1000"
//           preserveAspectRatio="none"
//           initial={false}
//           animate={{ opacity: isOpen ? 1 : 0 }}
//           transition={{ duration: shouldReduceMotion ? 0.3 : 0.4 }}
//           className="pointer-events-none absolute inset-y-0 -left-12 right-0 h-full w-[calc(100%+3rem)] overflow-visible drop-shadow-[-18px_0_35px_rgba(54,27,82,0.22)]"
//         >
//           <defs>
//             <linearGradient
//               id={`sidebar-wave-${variant}`}
//               x1="0"
//               y1="0"
//               x2="1"
//               y2="1"
//             >
//               <stop offset="0%" stopColor="#241235" />
//               <stop offset="48%" stopColor="#160a24" />
//               <stop offset="100%" stopColor="#0d0715" />
//             </linearGradient>

//             <filter
//               id={`sidebar-wave-glow-${variant}`}
//               x="-80%"
//               y="-10%"
//               width="220%"
//               height="120%"
//             >
//               <feGaussianBlur stdDeviation="6" />
//             </filter>
//           </defs>

//           <path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000 L 320 1000 L 320 0 Z"
//             fill={`url(#sidebar-wave-${variant})`}
//           />

//           <motion.path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
//             fill="none"
//             stroke="#9f74dd"
//             strokeWidth="9"
//             filter={`url(#sidebar-wave-glow-${variant})`}
//             initial={{ pathLength: 0, opacity: 0 }}
//             animate={
//               isOpen
//                 ? {
//                     pathLength: 1,
//                     opacity: shouldReduceMotion
//                       ? [0.26, 0.38, 0.26]
//                       : [0.24, 0.52, 0.24],
//                   }
//                 : { pathLength: 0, opacity: 0 }
//             }
//             transition={{
//               pathLength: {
//                 duration: shouldReduceMotion ? 0.55 : 0.95,
//                 ease: [0.22, 1, 0.36, 1],
//               },
//               opacity: {
//                 duration: shouldReduceMotion ? 6 : 4,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//               },
//             }}
//           />

//           <motion.path
//             d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
//             fill="none"
//             stroke="#8658c2"
//             strokeWidth="2"
//             initial={{ pathLength: 0, opacity: 0 }}
//             animate={{
//               pathLength: isOpen ? 1 : 0,
//               opacity: isOpen ? 0.86 : 0,
//             }}
//             transition={{
//               pathLength: {
//                 duration: shouldReduceMotion ? 0.45 : 0.82,
//                 ease: [0.22, 1, 0.36, 1],
//               },
//               opacity: {
//                 duration: shouldReduceMotion ? 0.22 : 0.28,
//               },
//             }}
//           />
//         </motion.svg>

//         {/* نجوم ومدارات زخرفية لا تشارك في التفاعل */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 overflow-hidden"
//         >
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{
//               duration: shouldReduceMotion ? 70 : 34,
//               ease: "linear",
//               repeat: Infinity,
//             }}
//             className="absolute -right-24 top-[22%] h-72 w-72 rounded-full border border-sidebar-orbit-line/10"
//           />
//           <motion.div
//             animate={{ rotate: -360 }}
//             transition={{
//               duration: shouldReduceMotion ? 62 : 28,
//               ease: "linear",
//               repeat: Infinity,
//             }}
//             className="absolute -left-20 top-[48%] h-52 w-52 rounded-full border border-dashed border-sidebar-orbit-line/10"
//           />
//           <div className="absolute right-5 top-0 h-40 w-40 rounded-full bg-sidebar-orbit-line/5 blur-3xl" />

//           {ORBITAL_STARS.map((star, index) => (
//             <motion.span
//               key={index}
//               animate={
//                 shouldReduceMotion
//                   ? {
//                       y: [0, -1.5, 0],
//                       scale: [1, 1.16, 1],
//                       opacity: [
//                         star.opacity * 0.7,
//                         star.opacity,
//                         star.opacity * 0.7,
//                       ],
//                     }
//                   : {
//                       y: [0, -3 - (index % 3), 0],
//                       scale: [1, 1.45, 1],
//                       opacity: [
//                         star.opacity * 0.55,
//                         star.opacity,
//                         star.opacity * 0.55,
//                       ],
//                     }
//               }
//               transition={{
//                 duration: (shouldReduceMotion ? 5.5 : 2.8) + (index % 4) * 0.7,
//                 delay: index * 0.18,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//               }}
//               className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(196,181,253,0.75)]"
//               style={{
//                 top: star.top,
//                 left: star.left,
//                 width: star.size,
//                 height: star.size,
//               }}
//             />
//           ))}

//           {ACADEMIC_DECORATIONS.map(({ Icon, top, left, delay, rotate }) => (
//             <motion.div
//               key={top}
//               initial={false}
//               animate={
//                 shouldReduceMotion
//                   ? {
//                       y: [0, -2.5, 0],
//                       rotate: [rotate, rotate + 1.5, rotate],
//                       opacity: isOpen
//                         ? [0.07, 0.11, 0.07]
//                         : [0.025, 0.045, 0.025],
//                     }
//                   : {
//                       y: [0, -7, 0],
//                       rotate: [rotate, rotate + 4, rotate],
//                       opacity: isOpen
//                         ? [0.06, 0.14, 0.06]
//                         : [0.025, 0.055, 0.025],
//                     }
//               }
//               transition={{
//                 duration: shouldReduceMotion ? 10 : 6.5,
//                 delay,
//                 ease: "easeInOut",
//                 repeat: Infinity,
//               }}
//               className="absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-sidebar-orbit-line/15 bg-sidebar-orbit-line/5 text-sidebar-orbit-line"
//               style={{ top, left }}
//             >
//               <Icon className="h-5 w-5" />
//             </motion.div>
//           ))}
//         </div>

//         <div className="relative z-10 flex h-full min-h-0 flex-col p-4">
//           <header
//             className={`mb-7 flex h-14 shrink-0 items-center gap-2 ${
//               isOpen ? "justify-between" : "lg:justify-center"
//             }`}
//           >
//             <AnimatePresence initial={false} mode="popLayout">
//               {isOpen && (
//                 <motion.div
//                   key="sidebar-brand"
//                   layout
//                   initial={{ opacity: 0, x: 12, scale: 0.94 }}
//                   animate={{ opacity: 1, x: 0, scale: 1 }}
//                   exit={{ opacity: 0, x: 8, scale: 0.94 }}
//                   transition={{
//                     duration: shouldReduceMotion ? 0.24 : 0.32,
//                     ease: [0.22, 1, 0.36, 1],
//                   }}
//                   className="flex min-w-0 items-center gap-3 overflow-hidden"
//                 >
//                   <motion.div
//                     whileHover={{
//                       scale: shouldReduceMotion ? 1.025 : 1.06,
//                       rotate: shouldReduceMotion ? -1 : -3,
//                     }}
//                     whileTap={{ scale: shouldReduceMotion ? 0.985 : 0.96 }}
//                     className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sidebar-orbit-line/45 bg-gradient-to-br from-sidebar-orbit-line/30 via-sidebar-orbit-surface to-sidebar-orbit-base shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_10px_28px_rgba(62,30,92,0.45)]"
//                   >
//                     <span className="absolute inset-[3px] rounded-full border border-white/10" />
//                     <BrandIcon
//                       aria-hidden="true"
//                       className="relative h-5 w-5 text-white"
//                     />
//                   </motion.div>

//                   <span className="whitespace-nowrap bg-gradient-to-l from-white via-[#e9dcff] to-sidebar-orbit-line bg-clip-text text-xl font-bold text-transparent">
//                     {sidebarTitle}
//                   </span>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <button
//               ref={mobileCloseButtonRef}
//               type="button"
//               onClick={onToggle}
//               aria-label="إغلاق القائمة الجانبية"
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 backdrop-blur-sm transition-colors hover:border-sidebar-orbit-line/40 hover:bg-sidebar-orbit-line/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:hidden"
//             >
//               <X aria-hidden="true" className="h-5 w-5" />
//             </button>

//             <motion.button
//               type="button"
//               onClick={onToggle}
//               layout
//               aria-label={
//                 isOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"
//               }
//               aria-controls="dashboard-sidebar"
//               aria-expanded={isOpen}
//               transition={{
//                 layout: {
//                   duration: shouldReduceMotion ? 0.26 : 0.34,
//                   ease: [0.22, 1, 0.36, 1],
//                 },
//               }}
//               whileHover={{ scale: shouldReduceMotion ? 1.035 : 1.08 }}
//               whileTap={{ scale: 0.94 }}
//               className={`relative hidden items-center justify-center rounded-full border border-sidebar-orbit-line/55 bg-sidebar-orbit-surface/85 text-sidebar-orbit-line shadow-[0_0_0_3px_rgba(139,92,246,0.08),0_0_18px_rgba(139,92,246,0.22)] backdrop-blur-md transition-[width,height,color,background-color,border-color] hover:border-sidebar-orbit-gold/55 hover:bg-sidebar-orbit-gold/10 hover:text-sidebar-orbit-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:flex ${
//                 isOpen ? "h-9 w-9" : "h-12 w-12"
//               }`}
//             >
//               <motion.span
//                 aria-hidden="true"
//                 animate={{ rotate: isOpen ? 0 : 180 }}
//                 transition={{
//                   duration: shouldReduceMotion ? 0.24 : 0.3,
//                   ease: "easeOut",
//                 }}
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </motion.span>
//             </motion.button>
//           </header>

//           <LayoutGroup id={`sidebar-navigation-${variant}`}>
//             <nav
//               aria-label={isAdmin ? "تنقل لوحة الإدارة" : "التنقل الرئيسي"}
//               className="relative min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden pe-0.5"
//             >
//               {/* المسار الرأسي الذي يربط دوائر التنقل */}
//               <div
//                 aria-hidden="true"
//                 className={`pointer-events-none absolute bottom-2 top-2 z-0 w-px bg-gradient-to-b from-transparent via-sidebar-orbit-line/55 to-transparent shadow-[0_0_10px_rgba(167,139,250,0.52)] transition-[right] ${
//                   shouldReduceMotion ? "duration-[350ms]" : "duration-500"
//                 } ${isOpen ? "right-8" : "right-1/2"}`}
//               />

//               {navigationGroups.map((group, groupIndex) => (
//                 <div
//                   key={group.label ?? `navigation-group-${groupIndex}`}
//                   className="relative z-10"
//                 >
//                   {group.label && (
//                     <p
//                       className={`mb-2 overflow-hidden whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-sidebar-orbit-muted/65 transition-[height,opacity] ${
//                         shouldReduceMotion ? "duration-[240ms]" : "duration-300"
//                       } ${isOpen ? "h-auto opacity-100" : "h-0 opacity-0"}`}
//                     >
//                       {group.label}
//                     </p>
//                   )}

//                   <div className="space-y-1.5">
//                     {group.items.map((item, itemIndex) => {
//                       const active = isItemActive(pathname, item);
//                       const Icon = item.icon;

//                       return (
//                         <motion.div
//                           key={item.href}
//                           variants={navigationItemVariants}
//                           initial="hidden"
//                           animate="rest"
//                           whileHover="hover"
//                           whileTap="tap"
//                           transition={{
//                             duration: 0.28,
//                             delay: shouldReduceMotion
//                               ? 0
//                               : groupIndex * 0.05 + itemIndex * 0.04,
//                             ease: "easeOut",
//                           }}
//                           className="group relative"
//                         >
//                           <Link
//                             href={item.href}
//                             onClick={handleNavigate}
//                             aria-current={active ? "page" : undefined}
//                             aria-label={!isOpen ? item.label : undefined}
//                             title={!isOpen ? item.label : undefined}
//                             className={`relative flex min-h-14 items-center gap-3 rounded-2xl px-2 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line ${
//                               active
//                                 ? "text-sidebar-orbit-gold"
//                                 : "text-white/70 hover:text-white"
//                             } ${!isOpen ? "lg:justify-center" : ""}`}
//                           >
//                             {active && (
//                               <>
//                                 <motion.span
//                                   layoutId={`sidebar-active-orbit-${variant}`}
//                                   aria-hidden="true"
//                                   transition={{
//                                     type: "spring",
//                                     stiffness: 310,
//                                     damping: 32,
//                                     mass: 0.72,
//                                   }}
//                                   className="absolute inset-0 rounded-2xl border border-sidebar-orbit-gold/25 bg-gradient-to-l from-sidebar-orbit-gold/10 via-sidebar-orbit-gold/5 to-transparent"
//                                 />

//                               </>
//                             )}

//                             {/* خط أفقي صغير يصل المدار بالدائرة */}
//                             <span
//                               aria-hidden="true"
//                               className={`absolute right-[3.2rem] top-1/2 h-px -translate-y-1/2 transition-[width,background-color,opacity] duration-200 ${
//                                 !isOpen
//                                   ? "w-0 opacity-0"
//                                   : active
//                                     ? "w-5 bg-sidebar-orbit-gold/80 opacity-100"
//                                     : "w-3 bg-sidebar-orbit-line/30 opacity-60 group-hover:w-5 group-hover:bg-sidebar-orbit-line/70 group-hover:opacity-100"
//                               }`}
//                             />

//                             <motion.span
//                               variants={navigationIconVariants}
//                               className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-[border-color,color,background-color,box-shadow] duration-200 ${
//                                 active
//                                   ? "border-sidebar-orbit-gold/80 text-[#2c1908] shadow-[0_0_0_4px_rgba(248,201,99,0.10),0_0_24px_rgba(248,201,99,0.38)]"
//                                   : "border-sidebar-orbit-line/35 bg-gradient-to-br from-sidebar-orbit-line/25 via-sidebar-orbit-surface/90 to-sidebar-orbit-base text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(27,12,45,0.35)] group-hover:border-sidebar-orbit-line/70 group-hover:text-white group-hover:shadow-[0_0_0_3px_rgba(139,92,246,0.09),0_0_22px_rgba(139,92,246,0.28)]"
//                               }`}
//                             >
//                               {active && (
//                                 <>
//                                   {/* الخلفية الذهبية نفسها تنتقل بين الأيقونات */}
//                                   <motion.span
//                                     layoutId={`sidebar-active-icon-fill-${variant}`}
//                                     aria-hidden="true"
//                                     transition={{
//                                       type: "spring",
//                                       stiffness: shouldReduceMotion ? 300 : 240,
//                                       damping: shouldReduceMotion ? 30 : 26,
//                                       mass: 0.65,
//                                     }}
//                                     className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffe9a9] via-sidebar-orbit-gold to-[#d99b3f]"
//                                   />

//                                   {/* Border متدرج يدور حول العنصر النشط */}
//                                   <motion.span
//                                     aria-hidden="true"
//                                     animate={
//                                       shouldReduceMotion
//                                         ? { rotate: 360, opacity: 0.8 }
//                                         : { rotate: 360, opacity: 1 }
//                                     }
//                                     transition={{
//                                       duration: shouldReduceMotion ? 8 : 3.4,
//                                       ease: "linear",
//                                       repeat: Infinity,
//                                     }}
//                                     className="absolute -inset-1 rounded-full border-2 border-transparent border-r-sidebar-orbit-gold/35 border-t-[#fff0b7]"
//                                   />

//                                   <motion.span
//                                     aria-hidden="true"
//                                     animate={
//                                       shouldReduceMotion
//                                         ? {
//                                             rotate: -360,
//                                             opacity: [0.24, 0.36, 0.24],
//                                             scale: [1, 1.035, 1],
//                                           }
//                                         : {
//                                             rotate: -360,
//                                             opacity: [0.22, 0.52, 0.22],
//                                             scale: [1, 1.1, 1],
//                                           }
//                                     }
//                                     transition={{
//                                       duration: shouldReduceMotion ? 10 : 5.2,
//                                       ease: "linear",
//                                       repeat: Infinity,
//                                     }}
//                                     className="absolute -inset-2 rounded-full border border-dashed border-sidebar-orbit-gold/55"
//                                   />
//                                 </>
//                               )}

//                               <span className="absolute inset-[3px] rounded-full border border-white/10" />

//                               <Icon
//                                 aria-hidden="true"
//                                 className="relative z-10 h-5 w-5"
//                               />
//                             </motion.span>

//                             <span
//                               className={`relative z-10 overflow-hidden whitespace-nowrap text-[13px] transition-[width,opacity,color] ${
//                                 shouldReduceMotion
//                                   ? "duration-150"
//                                   : "duration-300"
//                               } ${
//                                 isOpen
//                                   ? "w-auto opacity-100"
//                                   : "w-0 opacity-0 lg:hidden"
//                               } ${
//                                 active
//                                   ? "font-semibold text-sidebar-orbit-gold"
//                                   : "text-white/75 group-hover:text-white"
//                               }`}
//                             >
//                               {item.label}
//                             </span>
//                           </Link>
//                         </motion.div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ))}
//             </nav>
//           </LayoutGroup>

//           {/* Glass card سفلية؛ أبقينا وظيفة تسجيل الخروج نفسها دون تعديل */}
//           <div className="relative mt-4 shrink-0 overflow-hidden rounded-[1.35rem] border border-sidebar-orbit-line/20 bg-sidebar-orbit-surface/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(8,3,14,0.28)] backdrop-blur-xl">
//             <div
//               aria-hidden="true"
//               className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-orbit-gold/45 to-transparent"
//             />

//             <motion.button
//               type="button"
//               onClick={onLogout}
//               aria-label={!isOpen ? "تسجيل الخروج" : undefined}
//               title={!isOpen ? "تسجيل الخروج" : undefined}
//               whileHover={{ x: shouldReduceMotion ? -1 : -2 }}
//               whileTap={{ scale: shouldReduceMotion ? 0.99 : 0.98 }}
//               className={`group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line ${
//                 !isOpen ? "lg:justify-center" : ""
//               }`}
//             >
//               <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-colors group-hover:border-sidebar-orbit-gold/35 group-hover:bg-sidebar-orbit-gold/10 group-hover:text-sidebar-orbit-gold">
//                 <LogOut aria-hidden="true" className="h-4 w-4" />
//               </span>

//               <span
//                 className={`overflow-hidden whitespace-nowrap transition-[width,opacity] ${
//                   shouldReduceMotion ? "duration-150" : "duration-300"
//                 } ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0 lg:hidden"}`}
//               >
//                 تسجيل الخروج
//               </span>
//             </motion.button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const ORBITAL_STARS = [
  { top: "8%", left: "22%", size: 2, opacity: 0.45 },
  { top: "14%", left: "72%", size: 1, opacity: 0.4 },
  { top: "25%", left: "16%", size: 1, opacity: 0.32 },
  { top: "34%", left: "81%", size: 2, opacity: 0.28 },
  { top: "47%", left: "12%", size: 2, opacity: 0.38 },
  { top: "57%", left: "68%", size: 1, opacity: 0.42 },
  { top: "69%", left: "24%", size: 1, opacity: 0.3 },
  { top: "78%", left: "76%", size: 2, opacity: 0.34 },
  { top: "89%", left: "18%", size: 1, opacity: 0.38 },
] as const;

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

// ترتيب العناصر على قوس القائمة العائمة في شاشة الجوال.
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

const navigationItemVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 8,
  },
  rest: {
    opacity: 1,
    x: 0,
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
  rest: {
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
  const shouldReduceMotion = useReducedMotion();
  const mobileCloseButtonRef = useRef<HTMLButtonElement>(null);

  const navigationGroups: readonly NavigationGroup[] =
    variant === "admin" ? ADMIN_NAV_GROUPS : STUDENT_NAV_GROUPS;
  const mobileNavigationItems = navigationGroups.flatMap(
    (group) => group.items,
  );

  const isAdmin = variant === "admin";
  const BrandIcon = isAdmin ? Shield : GraduationCap;

  // إغلاق القائمة باستخدام Escape
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

  // إدارة التركيز ومنع تمرير الصفحة خلف قائمة الموبايل
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

  const handleNavigate = () => {
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;

    if (isMobile && isOpen) {
      onToggle();
    }
  };

  const enableDecorations = isOpen && !shouldReduceMotion;
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
              duration: shouldReduceMotion ? 0.12 : 0.24,
            }}
            className="fixed inset-0 z-40 bg-[#09070d]/70 backdrop-blur-[2px] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile: قائمة مدارية عائمة تخرج من الزر الذهبي بدل اللوحة الكاملة. */}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.18 : 0.3 }}
              className="absolute inset-0"
            >
              {/* المدارات تنطلق من مركز زر الفتح. */}
              {MOBILE_ORBIT_RINGS.map((size, index) => (
                <motion.span
                  key={size}
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0.35 }}
                  animate={{
                    opacity: 0.18 - index * 0.025,
                    scale: 1,
                    rotate: index % 2 === 0 ? 360 : -360,
                  }}
                  exit={{ opacity: 0, scale: 0.55 }}
                  transition={{
                    opacity: { duration: 0.28, delay: index * 0.04 },
                    scale: {
                      type: "spring",
                      stiffness: shouldReduceMotion ? 250 : 180,
                      damping: 24,
                      delay: index * 0.035,
                    },
                    rotate: {
                      duration: shouldReduceMotion ? 46 : 28 + index * 5,
                      repeat: Infinity,
                      ease: "linear",
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

              {MOBILE_ORBIT_PARTICLES.map((particle, index) => (
                <motion.span
                  key={`${particle.right}-${particle.bottom}`}
                  aria-hidden="true"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.2, 0.95, 0.2],
                    scale: [0.7, 1.45, 0.7],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: shouldReduceMotion ? 3.8 : 2.2,
                    delay: particle.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-sidebar-orbit-line shadow-[0_0_10px_rgba(196,181,253,0.95)]"
                  style={{
                    right: particle.right,
                    bottom: particle.bottom,
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
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.25 }}
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
                      stiffness: shouldReduceMotion ? 300 : 220,
                      damping: shouldReduceMotion ? 28 : 20,
                      mass: 0.72,
                      delay: index * (shouldReduceMotion ? 0.025 : 0.055),
                    }}
                    className="pointer-events-auto absolute bottom-2.5 right-2.5 h-11 w-11"
                  >
                    <Link
                      href={item.href}
                      onClick={handleNavigate}
                      aria-current={active ? "page" : undefined}
                      aria-label={item.label}
                      className={`group relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl outline-none transition-[border-color,background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-sidebar-orbit-gold ${
                        active
                          ? "border-[#ffe8a0] bg-gradient-to-br from-[#ffe8a0] via-sidebar-orbit-gold to-[#d99b3f] text-[#2b1909] shadow-[0_0_0_5px_rgba(248,201,99,0.12),0_0_28px_rgba(248,201,99,0.75)]"
                          : "border-sidebar-orbit-line/55 bg-gradient-to-br from-[#6f4b98] via-sidebar-orbit-surface to-sidebar-orbit-base text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_0_0_4px_rgba(139,92,246,0.08),0_0_22px_rgba(139,92,246,0.34)]"
                      }`}
                    >
                      {active && (
                        <motion.span
                          aria-hidden="true"
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: shouldReduceMotion ? 8 : 3.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="absolute -inset-1.5 rounded-full border-2 border-transparent border-r-sidebar-orbit-gold/35 border-t-[#fff1bd]"
                        />
                      )}

                      <span className="absolute inset-[3px] rounded-full border border-white/15" />
                      <Icon aria-hidden="true" className="relative h-5 w-5" />

                      <span className="pointer-events-none absolute right-[calc(100%+0.55rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md border border-sidebar-orbit-line/15 bg-[#170c22]/90 px-2 py-1 text-[9px] font-medium text-white/85 shadow-[0_6px_18px_rgba(4,2,8,0.38)] backdrop-blur-md">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* الزر الرئيسي يبقى ظاهرًا دائمًا ويفتح/يغلق المدار. */}
        <motion.button
          ref={mobileCloseButtonRef}
          type="button"
          onClick={onToggle}
          aria-label={isOpen ? "إغلاق قائمة التنقل" : "فتح قائمة التنقل"}
          aria-controls="mobile-orbit-menu"
          aria-expanded={isOpen}
          whileTap={{ scale: 0.92 }}
          animate={{ scale: isOpen ? 1.04 : 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="pointer-events-auto absolute inset-0 flex items-center justify-center rounded-full border-2 border-[#ffe9a8] bg-gradient-to-br from-[#fff0bc] via-sidebar-orbit-gold to-[#d99b3f] text-[#2b1909] shadow-[0_0_0_6px_rgba(248,201,99,0.12),0_0_0_12px_rgba(248,201,99,0.055),0_0_34px_rgba(248,201,99,0.72)] outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: isOpen ? 360 : 0 }}
            transition={{
              duration: shouldReduceMotion ? 1.1 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute -inset-1.5 rounded-full border-2 border-transparent border-r-[#b87927] border-t-[#fff4cb]"
          />
          <span className="absolute inset-[4px] rounded-full border border-white/50" />
          <BrandIcon aria-hidden="true" className="relative h-7 w-7" />
        </motion.button>
      </nav>

      <aside
        id="dashboard-sidebar-desktop"
        aria-label={
          isAdmin ? "القائمة الجانبية للإدارة" : "القائمة الجانبية للطالب"
        }
        className={`fixed right-0 top-0 z-50 hidden h-dvh w-64 flex-col overflow-visible text-white transition-[width] ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex ${
          shouldReduceMotion ? "duration-[350ms]" : "duration-500"
        } ${isOpen ? "lg:w-64" : "lg:w-20"}`}
      >
        {/* الخلفية المستطيلة تظهر فقط عند طي القائمة حتى لا تمتد الموجة فوق المحتوى */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: shouldReduceMotion ? 0.24 : 0.32 }}
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-l-[1.75rem] border-l border-sidebar-orbit-line/30 bg-gradient-to-b from-sidebar-orbit-deep via-sidebar-orbit-base to-[#0d0715] shadow-[-12px_0_35px_rgba(61,28,92,0.24)]"
        />

        {/* موجة SVG معكوسة لتناسب وجود القائمة في يمين واجهة RTL */}
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 320 1000"
          preserveAspectRatio="none"
          initial={false}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: shouldReduceMotion ? 0.3 : 0.4 }}
          className="pointer-events-none absolute inset-y-0 -left-12 right-0 h-full w-[calc(100%+3rem)] overflow-visible drop-shadow-[-18px_0_35px_rgba(54,27,82,0.22)]"
        >
          <defs>
            <linearGradient
              id={`sidebar-wave-${variant}`}
              x1="0"
              y1="0"
              x2="1"
              y2="1"
            >
              <stop offset="0%" stopColor="#241235" />
              <stop offset="48%" stopColor="#160a24" />
              <stop offset="100%" stopColor="#0d0715" />
            </linearGradient>

            <filter
              id={`sidebar-wave-glow-${variant}`}
              x="-80%"
              y="-10%"
              width="220%"
              height="120%"
            >
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <path
            d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000 L 320 1000 L 320 0 Z"
            fill={`url(#sidebar-wave-${variant})`}
          />

          <motion.path
            d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
            fill="none"
            stroke="#9f74dd"
            strokeWidth="9"
            filter={`url(#sidebar-wave-glow-${variant})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              isOpen
                ? {
                    pathLength: 1,
                    opacity: shouldReduceMotion
                      ? [0.26, 0.38, 0.26]
                      : [0.24, 0.52, 0.24],
                  }
                : { pathLength: 0, opacity: 0 }
            }
            transition={{
              pathLength: {
                duration: shouldReduceMotion ? 0.55 : 0.95,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: shouldReduceMotion ? 6 : 4,
                ease: "easeInOut",
                repeat: Infinity,
              },
            }}
          />

          <motion.path
            d="M 54 0 C 8 128 78 245 35 382 C 6 482 76 592 40 720 C 14 820 72 910 48 1000"
            fill="none"
            stroke="#8658c2"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: isOpen ? 1 : 0,
              opacity: isOpen ? 0.86 : 0,
            }}
            transition={{
              pathLength: {
                duration: shouldReduceMotion ? 0.45 : 0.82,
                ease: [0.22, 1, 0.36, 1],
              },
              opacity: {
                duration: shouldReduceMotion ? 0.22 : 0.28,
              },
            }}
          />
        </motion.svg>

        {/* نجوم ومدارات زخرفية لا تشارك في التفاعل */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <motion.div
           animate={shouldReduceMotion ? undefined : { rotate: 360 }}
transition={
  shouldReduceMotion
    ? undefined
    : {
        duration: 34,
        repeat: Infinity,
        ease: "linear",
      }
}
            className="absolute -right-24 top-[22%] h-72 w-72 rounded-full border border-sidebar-orbit-line/10"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{
              duration: shouldReduceMotion ? 62 : 28,
              ease: "linear",
              repeat: Infinity,
            }}
            className="absolute -left-20 top-[48%] h-52 w-52 rounded-full border border-dashed border-sidebar-orbit-line/10"
          />
          <div className="absolute right-5 top-0 h-40 w-40 rounded-full bg-sidebar-orbit-line/5 blur-3xl" />
          {enableDecorations && (
            <>
              {ORBITAL_STARS.map((star, index) => (
                <motion.span
                  key={index}
                  animate={
                    shouldReduceMotion
                      ? {
                          y: [0, -1.5, 0],
                          scale: [1, 1.16, 1],
                          opacity: [
                            star.opacity * 0.7,
                            star.opacity,
                            star.opacity * 0.7,
                          ],
                        }
                      : {
                          y: [0, -3 - (index % 3), 0],
                          scale: [1, 1.45, 1],
                          opacity: [
                            star.opacity * 0.55,
                            star.opacity,
                            star.opacity * 0.55,
                          ],
                        }
                  }
                  transition={{
                    duration:
                      (shouldReduceMotion ? 5.5 : 2.8) + (index % 4) * 0.7,
                    delay: index * 0.18,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(196,181,253,0.75)]"
                  style={{
                    top: star.top,
                    left: star.left,
                    width: star.size,
                    height: star.size,
                  }}
                />
              ))}

              {ACADEMIC_DECORATIONS.map(
                ({ Icon, top, left, delay, rotate }) => (
                  <motion.div
                    key={top}
                    initial={false}
                    animate={
                      shouldReduceMotion
                        ? {
                            y: [0, -2.5, 0],
                            rotate: [rotate, rotate + 1.5, rotate],
                            opacity: isOpen
                              ? [0.07, 0.11, 0.07]
                              : [0.025, 0.045, 0.025],
                          }
                        : {
                            y: [0, -7, 0],
                            rotate: [rotate, rotate + 4, rotate],
                            opacity: isOpen
                              ? [0.06, 0.14, 0.06]
                              : [0.025, 0.055, 0.025],
                          }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 10 : 6.5,
                      delay,
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                    className="absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-sidebar-orbit-line/15 bg-sidebar-orbit-line/5 text-sidebar-orbit-line"
                    style={{ top, left }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.div>
                ),
              )}
            </>
          )}
        </div>
        <div className="relative z-10 flex h-full min-h-0 flex-col p-4">
          <header
            className={`mb-7 flex h-14 shrink-0 items-center gap-2 ${
              isOpen ? "justify-between" : "lg:justify-center"
            }`}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {isOpen && (
                <motion.div
                  key="sidebar-brand"
                  layout
                  initial={{ opacity: 0, x: 12, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.94 }}
                  transition={{
                    duration: shouldReduceMotion ? 0.24 : 0.32,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex min-w-0 items-center gap-3 overflow-hidden"
                >
                  <motion.div
                    whileHover={{
                      scale: shouldReduceMotion ? 1.025 : 1.06,
                      rotate: shouldReduceMotion ? -1 : -3,
                    }}
                    whileTap={{ scale: shouldReduceMotion ? 0.985 : 0.96 }}
                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sidebar-orbit-line/45 bg-gradient-to-br from-sidebar-orbit-line/30 via-sidebar-orbit-surface to-sidebar-orbit-base shadow-[0_0_0_4px_rgba(139,92,246,0.08),0_10px_28px_rgba(62,30,92,0.45)]"
                  >
                    <span className="absolute inset-[3px] rounded-full border border-white/10" />
                    <BrandIcon
                      aria-hidden="true"
                      className="relative h-5 w-5 text-white"
                    />
                  </motion.div>

                  <span className="whitespace-nowrap bg-gradient-to-l from-white via-[#e9dcff] to-sidebar-orbit-line bg-clip-text text-xl font-bold text-transparent">
                    {userName && (
                      <div
                        className={`flex items-center  rounded-xl  ${
                          !isOpen ? "lg:justify-center" : ""
                        }`}
                      >
                        <div
                          className={`min-w-0 overflow-hidden motion-safe:transition-[width,opacity] motion-safe:duration-300 ${
                            isOpen
                              ? "w-auto opacity-100"
                              : "w-0 opacity-0 lg:hidden"
                          }`}
                        >
                          <p className="truncate text-[20px] font-semibold text-white">
                            {userName}
                          </p>

                          {!isAdmin && userMajor && (
                            <p className="mt-0.5 truncate text-xs text-white/60">
                              {userMajor}
                            </p>
                          )}
                        </div>
                      </div>
                    )}{" "}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={onToggle}
              layout
              aria-label={
                isOpen ? "طي القائمة الجانبية" : "توسيع القائمة الجانبية"
              }
              aria-controls="dashboard-sidebar-desktop"
              aria-expanded={isOpen}
              transition={{
                layout: {
                  duration: shouldReduceMotion ? 0.26 : 0.34,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              whileHover={{ scale: shouldReduceMotion ? 1.035 : 1.08 }}
              whileTap={{ scale: 0.94 }}
              className={`relative hidden items-center justify-center rounded-full border border-sidebar-orbit-line/55 bg-sidebar-orbit-surface/85 text-sidebar-orbit-line shadow-[0_0_0_3px_rgba(139,92,246,0.08),0_0_18px_rgba(139,92,246,0.22)] backdrop-blur-md transition-[width,height,color,background-color,border-color] hover:border-sidebar-orbit-gold/55 hover:bg-sidebar-orbit-gold/10 hover:text-sidebar-orbit-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line lg:flex ${
                isOpen ? "h-9 w-9" : "h-12 w-12"
              }`}
            >
              <motion.span
                aria-hidden="true"
                animate={{ rotate: isOpen ? 0 : 180 }}
                transition={{
                  duration: shouldReduceMotion ? 0.24 : 0.3,
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
              {/* المسار الرأسي الذي يربط دوائر التنقل */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute bottom-2 top-2 z-0 w-px bg-gradient-to-b from-transparent via-sidebar-orbit-line/55 to-transparent shadow-[0_0_10px_rgba(167,139,250,0.52)] transition-[right] ${
                  shouldReduceMotion ? "duration-[350ms]" : "duration-500"
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
                        shouldReduceMotion ? "duration-[240ms]" : "duration-300"
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
                          initial="hidden"
                          animate="rest"
                          whileHover="hover"
                          whileTap="tap"
                          transition={{
                            duration: 0.28,
                            delay: shouldReduceMotion
                              ? 0
                              : groupIndex * 0.05 + itemIndex * 0.04,
                            ease: "easeOut",
                          }}
                          className="group relative"
                        >
                          <Link
                            href={item.href}
                            onClick={handleNavigate}
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
                              <>
                                <motion.span
                                  layoutId={`sidebar-active-orbit-${variant}`}
                                  aria-hidden="true"
                                  transition={{
                                    type: "spring",
                                    stiffness: 310,
                                    damping: 32,
                                    mass: 0.72,
                                  }}
                                  className="absolute inset-0 rounded-2xl border border-sidebar-orbit-gold/25 bg-gradient-to-l from-sidebar-orbit-gold/10 via-sidebar-orbit-gold/5 to-transparent"
                                />
                              </>
                            )}

                            {/* خط أفقي صغير يصل المدار بالدائرة */}
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
                              className={`relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-[border-color,color,background-color,box-shadow] duration-200 ${
                                active
                                  ? "border-sidebar-orbit-gold/80 text-[#2c1908] shadow-[0_0_0_4px_rgba(248,201,99,0.10),0_0_24px_rgba(248,201,99,0.38)]"
                                  : "border-sidebar-orbit-line/35 bg-gradient-to-br from-sidebar-orbit-line/25 via-sidebar-orbit-surface/90 to-sidebar-orbit-base text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(27,12,45,0.35)] group-hover:border-sidebar-orbit-line/70 group-hover:text-white group-hover:shadow-[0_0_0_3px_rgba(139,92,246,0.09),0_0_22px_rgba(139,92,246,0.28)]"
                              }`}
                            >
                              {active && (
                                <>
                                  {/* الخلفية الذهبية نفسها تنتقل بين الأيقونات */}
                                  <motion.span
                                    layoutId={`sidebar-active-icon-fill-${variant}`}
                                    aria-hidden="true"
                                    transition={{
                                      type: "spring",
                                      stiffness: shouldReduceMotion ? 300 : 240,
                                      damping: shouldReduceMotion ? 30 : 26,
                                      mass: 0.65,
                                    }}
                                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[#ffe9a9] via-sidebar-orbit-gold to-[#d99b3f]"
                                  />

                                  {/* Border متدرج يدور حول العنصر النشط */}
                                  <motion.span
                                    aria-hidden="true"
                                    animate={
                                      shouldReduceMotion
                                        ? { rotate: 360, opacity: 0.8 }
                                        : { rotate: 360, opacity: 1 }
                                    }
                                    transition={{
                                      duration: shouldReduceMotion ? 8 : 3.4,
                                      ease: "linear",
                                      repeat: Infinity,
                                    }}
                                    className="absolute -inset-1 rounded-full border-2 border-transparent border-r-sidebar-orbit-gold/35 border-t-[#fff0b7]"
                                  />

                                  <motion.span
                                    aria-hidden="true"
                                    animate={
                                      shouldReduceMotion
                                        ? {
                                            rotate: -360,
                                            opacity: [0.24, 0.36, 0.24],
                                            scale: [1, 1.035, 1],
                                          }
                                        : {
                                            rotate: -360,
                                            opacity: [0.22, 0.52, 0.22],
                                            scale: [1, 1.1, 1],
                                          }
                                    }
                                    transition={{
                                      duration: shouldReduceMotion ? 10 : 5.2,
                                      ease: "linear",
                                      repeat: Infinity,
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
                              className={`relative z-10 overflow-hidden whitespace-nowrap text-[13px] transition-[width,opacity,color] ${
                                shouldReduceMotion
                                  ? "duration-150"
                                  : "duration-300"
                              } ${
                                isOpen
                                  ? "w-auto opacity-100"
                                  : "w-0 opacity-0 lg:hidden"
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

          {/* Glass card سفلية؛ أبقينا وظيفة تسجيل الخروج نفسها دون تعديل */}
          <div className="relative mt-4 shrink-0 overflow-hidden rounded-[1.35rem] border border-sidebar-orbit-line/20 bg-sidebar-orbit-surface/45 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_30px_rgba(8,3,14,0.28)] backdrop-blur-xl">
            <div
              aria-hidden="true"
              className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-sidebar-orbit-gold/45 to-transparent"
            />

            <motion.button
              type="button"
              onClick={onLogout}
              aria-label={!isOpen ? "تسجيل الخروج" : undefined}
              title={!isOpen ? "تسجيل الخروج" : undefined}
              whileHover={{ x: shouldReduceMotion ? -1 : -2 }}
              whileTap={{ scale: shouldReduceMotion ? 0.99 : 0.98 }}
              className={`group flex min-h-11 w-full items-center gap-3 rounded-2xl px-2 py-2 text-sm font-medium text-white/65 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-orbit-line ${
                !isOpen ? "lg:justify-center" : ""
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/65 transition-colors group-hover:border-sidebar-orbit-gold/35 group-hover:bg-sidebar-orbit-gold/10 group-hover:text-sidebar-orbit-gold">
                <LogOut aria-hidden="true" className="h-4 w-4" />
              </span>

              <span
                className={`overflow-hidden whitespace-nowrap transition-[width,opacity] ${
                  shouldReduceMotion ? "duration-150" : "duration-300"
                } ${isOpen ? "w-auto opacity-100" : "w-0 opacity-0 lg:hidden"}`}
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
