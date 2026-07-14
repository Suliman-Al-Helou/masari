import type { LucideIcon } from "lucide-react";

export type NavigationMatch = "exact" | "prefix";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match?: NavigationMatch;
};

export type NavigationGroup = {
  label?: string;
  items: readonly NavigationItem[];
};