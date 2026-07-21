// import { getCurrentUser } from "@/lib/auth/session";
// import { can } from "@/lib/auth/permissions";
// import type { Permission } from "@/lib/auth/permissions";

// export async function requirePermission(permission: Permission) {
//   const session = await getCurrentUser();

//   if (!session) {
//     return {
//       ok: false as const,
//       response: Response.json(
//         { success: false, error: "يجب تسجيل الدخول" },
//         { status: 401 },
//       ),
//     };
//   }

//   if (!can(session.role, permission)) {
//     return {
//       ok: false as const,
//       response: Response.json(
//         { success: false, error: "ليس لديك صلاحية" },
//         { status: 403 },
//       ),
//     };
//   }

//   return {
//     ok: true as const,
//     session,
//   };
// }
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import type { Permission } from "@/lib/auth/permissions";

export async function requirePermission(permission: Permission) {
  const session = await getCurrentUser();

  if (!session) {
    return {
      ok: false as const,
      response: Response.json(
        { success: false, error: "يجب تسجيل الدخول" },
        { status: 401 },
      ),
    };
  }

  const allowed = can(session.role, permission);

  console.log("[PERMISSION CHECK]", {
    role: session.role,
    permission,
    allowed,
  });

  if (!allowed) {
    return {
      ok: false as const,
      response: Response.json(
        { success: false, error: "ليس لديك صلاحية" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}