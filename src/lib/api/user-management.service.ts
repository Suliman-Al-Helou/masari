import "server-only";

import { dbAdmin } from "@/lib/db/server-only";
import type { AdminProfile, AdminUsersStatus } from "@/types/admin";

export class UserManagementError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "UserManagementError";
  }
}

interface GetUsersParams {
  search?: string;
  status?: AdminUsersStatus;
}

async function getManagedUser(userId: string) {
  const { data, error } = await dbAdmin
    .from("profiles")
    .select("id, role, deleted_at, is_super_admin")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new UserManagementError("المستخدم غير موجود", 404);
  }

  return data;
}

// Verifies the actor before using the service-role client.
async function requireSuperAdminActor(actorUserId: string) {
  const actor = await getManagedUser(actorUserId);

  if (actor.role !== "admin" || !actor.is_super_admin || actor.deleted_at) {
    throw new UserManagementError("هذه العملية متاحة للأدمن الأساسي فقط", 403);
  }

  return actor;
}

// Returns active or disabled users.
export async function getAllUsers(
  actorUserId: string,
  params: GetUsersParams = {},
): Promise<AdminProfile[]> {
  const actor = await getManagedUser(actorUserId);

  if (actor.role !== "admin" || actor.deleted_at) {
    throw new UserManagementError("ليس لديك صلاحية", 403);
  }

  const status = params.status ?? "active";

  if (status === "deleted" && !actor.is_super_admin) {
    throw new UserManagementError(
      "المستخدمون المحذوفون متاحون للأدمن الأساسي فقط",
      403,
    );
  }

  let query = dbAdmin
    .from("profiles")
    .select(
      "id, full_name, university, major, semester, role, onboarded, show_in_network, created_at, deleted_at, deletion_note, is_super_admin",
    )
    .order(status === "deleted" ? "deleted_at" : "created_at", {
      ascending: false,
    });

  query =
    status === "deleted"
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null);

  if (params.search) {
    query = query.ilike("full_name", `%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data ?? []) as AdminProfile[];
}

// Changes another user's role.
export async function updateManagedUserRole(
  actorUserId: string,
  targetUserId: string,
  role: "student" | "admin",
): Promise<void> {
  await requireSuperAdminActor(actorUserId);

  if (actorUserId === targetUserId) {
    throw new UserManagementError("لا يمكنك تغيير دور حسابك الخاص", 400);
  }

  const target = await getManagedUser(targetUserId);

  if (target.is_super_admin) {
    throw new UserManagementError("لا يمكن تغيير دور الأدمن الأساسي", 400);
  }

  if (target.deleted_at) {
    throw new UserManagementError("استعد الحساب قبل تغيير دوره", 409);
  }

  const { data, error } = await dbAdmin
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new UserManagementError("المستخدم غير موجود أو حسابه معطل", 404);
  }
}

// Disables Auth access and keeps the profile.
export async function disableManagedUser(
  actorUserId: string,
  targetUserId: string,
): Promise<void> {
  await requireSuperAdminActor(actorUserId);

  if (actorUserId === targetUserId) {
    throw new UserManagementError("لا يمكنك تعطيل حسابك الخاص", 400);
  }

  const target = await getManagedUser(targetUserId);

  if (target.is_super_admin) {
    throw new UserManagementError("لا يمكن تعطيل حساب الأدمن الأساسي", 400);
  }

  if (target.deleted_at) {
    throw new UserManagementError("الحساب معطل بالفعل", 409);
  }

  const { error: authError } = await dbAdmin.auth.admin.updateUserById(
    targetUserId,
    {
      ban_duration: "876000h",
    },
  );

  if (authError) throw authError;

  const { data, error: profileError } = await dbAdmin
    .from("profiles")
    .update({
      deleted_at: new Date().toISOString(),
      deletion_note: null,
    })
    .eq("id", targetUserId)
    .is("deleted_at", null)
    .select("id")
    .maybeSingle();

  if (profileError || !data) {
    // Undo the Auth ban when the profile update fails.
    await dbAdmin.auth.admin.updateUserById(targetUserId, {
      ban_duration: "none",
    });

    if (profileError) throw profileError;

    throw new UserManagementError("المستخدم غير موجود أو حسابه معطل", 404);
  }
}

// Restores Auth access and the profile.
export async function restoreManagedUser(
  actorUserId: string,
  targetUserId: string,
): Promise<void> {
  await requireSuperAdminActor(actorUserId);

  const target = await getManagedUser(targetUserId);

  if (!target.deleted_at) {
    throw new UserManagementError("الحساب غير معطل", 409);
  }

  const { error: authError } = await dbAdmin.auth.admin.updateUserById(
    targetUserId,
    {
      ban_duration: "none",
    },
  );

  if (authError) throw authError;

  const { data, error: profileError } = await dbAdmin
    .from("profiles")
    .update({
      deleted_at: null,
      deletion_note: null,
    })
    .eq("id", targetUserId)
    .not("deleted_at", "is", null)
    .select("id")
    .maybeSingle();

  if (profileError || !data) {
    // Restore the Auth ban when the profile update fails.
    await dbAdmin.auth.admin.updateUserById(targetUserId, {
      ban_duration: "876000h",
    });

    if (profileError) throw profileError;

    throw new UserManagementError(
      "المستخدم غير موجود أو الحساب مستعاد بالفعل",
      404,
    );
  }
}

// Saves or clears the disable reason.
export async function updateManagedUserDeletionNote(
  actorUserId: string,
  targetUserId: string,
  note: string,
): Promise<void> {
  await requireSuperAdminActor(actorUserId);

  if (note.length > 500) {
    throw new UserManagementError("الملاحظة يجب ألا تتجاوز 500 حرف", 400);
  }

  const target = await getManagedUser(targetUserId);

  if (!target.deleted_at) {
    throw new UserManagementError("يمكن إضافة الملاحظة للحساب المعطل فقط", 409);
  }

  const { data, error } = await dbAdmin
    .from("profiles")
    .update({
      deletion_note: note.trim() || null,
    })
    .eq("id", targetUserId)
    .not("deleted_at", "is", null)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new UserManagementError("المستخدم غير موجود أو الحساب غير معطل", 404);
  }
}
