"use client";

import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";

import { ROLE_STYLES } from "@/lib/constants/admin-constants";
import { buttonVariants } from "@/lib/motion";
import type { AdminProfile } from "@/types/admin";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
type UserRole = "student" | "admin";

interface UserRowProps {
  user: AdminProfile;
  isLast: boolean;
  onRoleChange: (role: UserRole) => void;
  onDelete: () => void;
  roleLoading: boolean;
  canChangeRole: boolean;
  canDelete: boolean;
}

export default function UserRow({
  user,
  isLast,
  onRoleChange,
  onDelete,
  roleLoading,
  canChangeRole,
  canDelete,
}: UserRowProps) {
  // Fallback name if the user has no full name.
  const displayName = user.full_name || "مستخدم بدون اسم";

  // Get the first two letters from the user's name.
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("");

  // Normalize role to avoid undefined/null values.
  const currentRole: UserRole = user.role === "admin" ? "admin" : "student";
  const nextRole: UserRole = currentRole === "admin" ? "student" : "admin";

  const joinedAgo = user.created_at
    ? formatDistanceToNow(new Date(user.created_at), {
        locale: ar,
        addSuffix: true,
      })
    : "—";

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {displayName}
        </p>

        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {[user.university, user.major, user.semester]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      <p className="hidden flex-shrink-0 text-xs text-muted-foreground sm:block">
        {joinedAgo}
      </p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {canChangeRole ? (
              <motion.button
                type="button"
                variants={buttonVariants}
                initial="initial"
                whileHover={roleLoading ? undefined : "hover"}
                whileTap={roleLoading ? undefined : "tap"}
                onClick={() => onRoleChange(nextRole)}
                disabled={roleLoading}
                aria-label={`تغيير دور المستخدم إلى ${
                  nextRole === "admin" ? "مشرف" : "طالب"
                }`}
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${
                  ROLE_STYLES[currentRole]
                }`}
              >
                {roleLoading ? (
                  <Loader2 />
                ) : currentRole === "admin" ? (
                  "مشرف"
                ) : (
                  "طالب"
                )}
              </motion.button>
            ) : (
              <span
                className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                  ROLE_STYLES[currentRole]
                }`}
              >
                {currentRole === "admin" ? "مشرف" : "طالب"}
              </span>
            )}
          </TooltipTrigger>

          <TooltipContent className="bg-primary text-primary-foreground border-primary">
            تغيير الدور إلى {nextRole === "admin" ? "مشرف" : "طالب"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {canDelete && (
        <motion.button
          type="button"
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          onClick={onDelete}
          className="flex-shrink-0 p-1 text-muted-foreground transition-colors hover:text-destructive"
          title="حذف المستخدم"
          aria-label={`حذف المستخدم ${displayName}`}
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </div>
  );
}
