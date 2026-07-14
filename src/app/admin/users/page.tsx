"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";
import UsersPageClient from "@/components/admin/users/UsersPageClient";

import type { AdminProfile } from "@/types/admin";
import {
  useAdminUsers,
  useDeleteUser,
  useUpdateUserRole,
} from "@/lib/hooks/admin/query/useAdminUsers";

// import DeleteConfirmDialog from "@/components/admin/users/DeleteConfirmDialog";
// import RoleFilterTabs from "@/components/admin/users/RoleFilterTabs";
// import UserRow from "@/components/admin/users/UserRow";
// import UsersTableSkeleton from "@/components/admin/users/components/UsersTableSkeleton";


// type RoleFilter = "all" | "admin" | "student";
// type UserRole = "student" | "admin";

export default function AdminUsersPage() {
//   const queryClient = useQueryClient();

//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
//   const [toDelete, setToDelete] = useState<AdminProfile | null>(null);

//   const { data: users = [], isLoading } = useAdminUsers(search);
//   const roleMutation = useUpdateUserRole();
//   const deleteMutation = useDeleteUser();

//   // Filter users locally by role.
//   const filteredUsers = useMemo(() => {
//     return users.filter((user) =>
//       roleFilter === "all" ? true : user.role === roleFilter,
//     );
//   }, [users, roleFilter]);

//   // Update user role then refresh users list.
//   const handleRoleChange = (id: string, role: UserRole) => {
//     roleMutation.mutate(
//       { id, role },
//       {
//         onSuccess: () => {
//           queryClient.invalidateQueries({
//             queryKey: ["admin-users"],
//           });
//         },
//       },
//     );
//   };

//   // Delete selected user then refresh users list.
//   const handleDelete = () => {
//     if (!toDelete) return;

//     deleteMutation.mutate(toDelete.id, {
//       onSuccess: () => {
//         setToDelete(null);

//         queryClient.invalidateQueries({
//           queryKey: ["admin-users"],
//         });
//       },
//     });
//   };

  return (
   <UsersPageClient/>
  );
}