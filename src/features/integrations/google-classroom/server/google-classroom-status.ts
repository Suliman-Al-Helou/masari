import "server-only";

import type {
  GoogleClassroomConnectionStatus,
  GoogleClassroomSyncStatus,
} from "@/features/integrations/google-classroom/types";
import { dbAdmin } from "@/lib/db/server-only";

const CONNECTION_TABLE = "google_classroom_connections";

type ConnectionRow = {
  is_active: boolean;
  connected_at: string | null;
  last_synced_at: string | null;
  last_sync_started_at: string | null;
  last_sync_status: string | null;
  last_sync_error: string | null;
};

function normalizeSyncStatus(
  value: string | null,
): GoogleClassroomSyncStatus | null {
  if (
    value === "running" ||
    value === "success" ||
    value === "error"
  ) {
    return value;
  }

  return null;
}

export async function getGoogleClassroomConnectionStatus(
  userId: string,
): Promise<GoogleClassroomConnectionStatus> {
  const { data, error } = await dbAdmin
    .from(CONNECTION_TABLE)
    .select(
      [
        "is_active",
        "connected_at",
        "last_synced_at",
        "last_sync_started_at",
        "last_sync_status",
        "last_sync_error",
      ].join(","),
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to read Classroom connection status: ${error.message}`,
    );
  }

  const connection = data as ConnectionRow | null;

  if (!connection || !connection.is_active) {
    return {
      connected: false,
      connectedAt: null,
      lastSyncedAt: null,
      lastSyncStartedAt: null,
      lastSyncStatus: null,
      lastSyncError: null,
    };
  }

  return {
    connected: true,
    connectedAt: connection.connected_at,
    lastSyncedAt: connection.last_synced_at,
    lastSyncStartedAt: connection.last_sync_started_at,
    lastSyncStatus: normalizeSyncStatus(
      connection.last_sync_status,
    ),
    lastSyncError: connection.last_sync_error,
  };
}