"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import type { AdminProfile } from "@/types/admin";
import {
  useAdminUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "@/lib/hooks/admin/query/useAdminUsers";

import DeleteConfirmDialog from "@/components/admin/users/DeleteConfirmDialog";
import RoleFilterTabs from "@/components/admin/users/RoleFilterTabs";
import UserRow from "@/components/admin/users/UserRow";
import UsersTableSkeleton from "@/components/admin/users/components/UsersTableSkeleton";

type RoleFilter = "all" | "admin" | "student";
type UserRole = "student" | "admin";

export default function UsersPageClient() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [toDelete, setToDelete] = useState<AdminProfile | null>(null);

  const { data: users = [], isLoading } = useAdminUsers(search);
  const roleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  // Filter users by selected role.
  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      roleFilter === "all" ? true : user.role === roleFilter,
    );
  }, [users, roleFilter]);

  // Update user role and refresh users list.
  const handleRoleChange = (id: string, role: UserRole) => {
    roleMutation.mutate(
      { id, role },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["admin-users"],
          });
        },
      },
    );
  };

  // Delete selected user.
  const handleDelete = () => {
    if (!toDelete) return;

    deleteMutation.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null);

        queryClient.invalidateQueries({
          queryKey: ["admin-users"],
        });
      },
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">المستخدمون</h1>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {filteredUsers.length} مستخدم
          </p>
        </div>

        <RoleFilterTabs value={roleFilter} onChange={setRoleFilter} />
      </div>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="ابحث باسم المستخدم..."
        aria-label="البحث باسم المستخدم"
        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {isLoading ? (
          <UsersTableSkeleton />
        ) : filteredUsers.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            لا يوجد مستخدمون
          </p>
        ) : (
          <div>
            {filteredUsers.map((user, index) => {
              const isRoleLoading =
                roleMutation.isPending && roleMutation.variables?.id === user.id;

              return (
                <UserRow
                  key={user.id}
                  user={user}
                  isLast={index === filteredUsers.length - 1}
                  onRoleChange={(role) => handleRoleChange(user.id, role)}
                  onDelete={() => setToDelete(user)}
                  roleLoading={isRoleLoading}
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
      </AnimatePresence>
    </div>
  );
}