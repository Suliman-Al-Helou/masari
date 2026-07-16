import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deleteUser,
  getAllUsers,
  restoreUser,
  updateUserDeletionNote,
  updateUserRole,
} from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { useToast } from "@/lib/context/ToastContext";
import type { AdminUsersStatus } from "@/types/admin";

function useRefreshUsers() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all() });
}

export function useAdminUsers(search: string, status: AdminUsersStatus) {
  return useQuery({
    queryKey: queryKeys.admin.users(search, status),
    queryFn: () => getAllUsers({ search: search || undefined, status }),
  });
}

export function useUpdateUserRole() {
  const refreshUsers = useRefreshUsers();
  const { Success, Error } = useToast();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "student" | "admin" }) =>
      updateUserRole(id, role),
    meta: { silent: true },
    onSuccess: async (_, { role }) => {
      await refreshUsers();
      Success(`تم تغيير الدور إلى ${role === "admin" ? "مشرف" : "طالب"}`);
    },
    onError: (error) => Error("تعذر تغيير الدور", error.message),
  });
}

export function useDeleteUser() {
  const refreshUsers = useRefreshUsers();
  const { Success, Error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    meta: { silent: true },
    onSuccess: async () => {
      await refreshUsers();
      Success("تم تعطيل حساب المستخدم");
    },
    onError: (error) => Error("فشل تعطيل المستخدم", error.message),
  });
}

export function useRestoreUser() {
  const refreshUsers = useRefreshUsers();
  const { Success, Error } = useToast();

  return useMutation({
    mutationFn: (id: string) => restoreUser(id),
    meta: { silent: true },
    onSuccess: async () => {
      await refreshUsers();
      Success("تمت استعادة حساب المستخدم");
    },
    onError: (error) => Error("فشلت استعادة المستخدم", error.message),
  });
}

export function useUpdateUserDeletionNote() {
  const refreshUsers = useRefreshUsers();
  const { Success, Error } = useToast();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      updateUserDeletionNote(id, note),
    meta: { silent: true },
    onSuccess: async () => {
      await refreshUsers();
      Success("تم حفظ سبب التعطيل");
    },
    onError: (error) => Error("تعذر حفظ الملاحظة", error.message),
  });
}
