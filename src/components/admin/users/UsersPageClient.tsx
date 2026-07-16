"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";

import DeleteConfirmDialog from "@/components/admin/users/DeleteConfirmDialog";
import DeletedUserRow from "@/components/admin/users/DeletedUserRow";
import RestoreConfirmDialog from "@/components/admin/users/RestoreConfirmDialog";
import RoleFilterTabs from "@/components/admin/users/RoleFilterTabs";
import UserRow from "@/components/admin/users/UserRow";
import UserStatusTabs from "@/components/admin/users/UserStatusTabs";
import UsersTableSkeleton from "@/components/admin/users/components/UsersTableSkeleton";
import {
  useAdminUsers,
  useDeleteUser,
  useRestoreUser,
  useUpdateUserDeletionNote,
  useUpdateUserRole,
} from "@/lib/hooks/admin/query/useAdminUsers";
import type { AdminProfile, AdminUsersStatus } from "@/types/admin";

type RoleFilter = "all" | "admin" | "student";
type UserRole = "student" | "admin";

interface UsersPageClientProps {
  currentAdminId: string;
  isSuperAdmin: boolean;
}

export default function UsersPageClient({
  currentAdminId,
  isSuperAdmin,
}: UsersPageClientProps) {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [status, setStatus] = useState<AdminUsersStatus>("active");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [toDelete, setToDelete] = useState<AdminProfile | null>(null);
  const [toRestore, setToRestore] = useState<AdminProfile | null>(null);

  const { data: users = [], isLoading, isError } = useAdminUsers(
    deferredSearch,
    status,
  );
  const roleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();
  const restoreMutation = useRestoreUser();
  const noteMutation = useUpdateUserDeletionNote();

  const visibleUsers = useMemo(() => {
    if (status === "deleted" || roleFilter === "all") return users;
    return users.filter((user) => user.role === roleFilter);
  }, [roleFilter, status, users]);

  const handleRoleChange = (id: string, role: UserRole) => {
    roleMutation.mutate({ id, role });
  };

  const handleDelete = () => {
    if (!toDelete) return;
    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => setToDelete(null),
    });
  };

  const handleRestore = () => {
    if (!toRestore) return;
    restoreMutation.mutate(toRestore.id, {
      onSuccess: () => setToRestore(null),
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex  justify-between w-full">
          <div>
            <h1 className="text-xl font-semibold text-foreground">المستخدمون</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {visibleUsers.length} مستخدم
            </p>
          </div>
          {!isSuperAdmin && (
            <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              يمكنك عرض المستخدمين فقط. تغيير الأدوار وتعطيل الحسابات متاح للأدمن الأساسي.
            </p>
          )}
        </div>

        {isSuperAdmin && (
          <UserStatusTabs
            value={status}
            onChange={(nextStatus) => {
              setStatus(nextStatus);
              setRoleFilter("all");
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث باسم المستخدم..."
          aria-label="البحث باسم المستخدم"
          className="min-w-64 flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
        />

        {status === "active" && (
          <RoleFilterTabs value={roleFilter} onChange={setRoleFilter} />
        )}
      </div>

     

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <UsersTableSkeleton />
        ) : isError ? (
          <p role="alert" className="py-12 text-center text-sm text-destructive">
            تعذر تحميل المستخدمين. حاول مرة أخرى.
          </p>
        ) : visibleUsers.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {status === "deleted" ? "لا توجد حسابات معطلة" : "لا يوجد مستخدمون"}
          </p>
        ) : status === "deleted" ? (
          <div>
            {visibleUsers.map((user, index) => (
              <DeletedUserRow
                key={user.id}
                user={user}
                isLast={index === visibleUsers.length - 1}
                restoreLoading={
                  restoreMutation.isPending && restoreMutation.variables === user.id
                }
                noteLoading={
                  noteMutation.isPending && noteMutation.variables?.id === user.id
                }
                onRestore={() => setToRestore(user)}
                onSaveNote={(note) => noteMutation.mutate({ id: user.id, note })}
              />
            ))}
          </div>
        ) : (
          <div>
            {visibleUsers.map((user, index) => {
              const isCurrentUser = user.id === currentAdminId;
              const protectedAccount = isCurrentUser || user.is_super_admin;

              return (
                <UserRow
                  key={user.id}
                  user={user}
                  isLast={index === visibleUsers.length - 1}
                  onRoleChange={(role) => handleRoleChange(user.id, role)}
                  onDelete={() => setToDelete(user)}
                  roleLoading={
                    roleMutation.isPending && roleMutation.variables?.id === user.id
                  }
                  canChangeRole={isSuperAdmin && !protectedAccount}
                  canDelete={isSuperAdmin && !protectedAccount}
                />
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {toDelete && (
          <DeleteConfirmDialog
            user={toDelete}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
            loading={deleteMutation.isPending}
          />
        )}
        {toRestore && (
          <RestoreConfirmDialog
            user={toRestore}
            onConfirm={handleRestore}
            onCancel={() => setToRestore(null)}
            loading={restoreMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
