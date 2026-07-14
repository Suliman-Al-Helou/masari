import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/db/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run Proxy on application requests while skipping
     * Next.js internals and static image files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};