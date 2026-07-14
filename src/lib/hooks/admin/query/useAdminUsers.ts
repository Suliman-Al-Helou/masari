import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, updateUserRole, deleteUser } from "@/lib/api/admin";
import { useToast } from "@/lib/context/ToastContext";

export function useAdminUsers(search: string) {
  return useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => getAllUsers({ search: search || undefined }),
    
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { Success } = useToast();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: "student" | "admin" }) =>
      updateUserRole(id, role),
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      Success(`تم تغيير الدور إلى ${role === "admin" ? "مشرف" : "طالب"}`);
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { Success ,Error } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    meta: { silent: true },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      Success("تم حذف المستخدم");
    },
    onError: () => {
      Error("فشل حذف المستخدم", "حاول مرة أخرى");
    },
    
  });
}
