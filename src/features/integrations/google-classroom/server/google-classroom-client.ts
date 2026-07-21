import "server-only";

import { createGoogleOAuthClient } from "@/features/integrations/google-classroom/server/google-classroom-oauth";
import { dbAdmin } from "@/lib/db/server-only";
import {
  decryptGoogleToken,
  encryptGoogleToken,
} from "@/lib/integrations/google-classroom/token-crypto";

const CONNECTION_TABLE = "google_classroom_connections";

type GoogleClassroomConnectionRow = {
  access_token_encrypted: string | null;
  refresh_token_encrypted: string | null;
  token_type: string | null;
  granted_scopes: string | null;
  expires_at: string | null;
  is_active: boolean;
};

type StoredCredentials = {
  accessToken: string;
  refreshToken: string;
  expiryDate: number | undefined;
  tokenType: string | null;
  scopes: string | null;
};

export type GoogleClassroomClientErrorCode =
  | "NOT_CONNECTED"
  | "REAUTH_REQUIRED"
  | "CONNECTION_READ_FAILED"
  | "TOKEN_REFRESH_FAILED"
  | "CONNECTION_UPDATE_FAILED";

const ERROR_STATUS: Record<GoogleClassroomClientErrorCode, number> = {
  NOT_CONNECTED: 409,
  REAUTH_REQUIRED: 409,
  CONNECTION_READ_FAILED: 500,
  TOKEN_REFRESH_FAILED: 502,
  CONNECTION_UPDATE_FAILED: 500,
};

export class GoogleClassroomClientError extends Error {
  readonly code: GoogleClassroomClientErrorCode;
  readonly status: number;
  readonly originalError?: unknown;

  constructor(
    code: GoogleClassroomClientErrorCode,
    message: string,
    originalError?: unknown,
  ) {
    super(message);
    this.name = "GoogleClassroomClientError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    this.originalError = originalError;
  }
}

function parseExpiryDate(value: string | null): number | undefined {
  if (!value) return undefined;

  const expiryDate = Date.parse(value);

  return Number.isNaN(expiryDate) ? undefined : expiryDate;
}

function isInvalidGrantError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const value = error as {
    code?: unknown;
    message?: unknown;
    response?: {
      data?: {
        error?: unknown;
      };
    };
  };

  return (
    value.response?.data?.error === "invalid_grant" ||
    value.code === "invalid_grant" ||
    (typeof value.message === "string" &&
      value.message.includes("invalid_grant"))
  );
}

async function deactivateConnection(userId: string) {
  await dbAdmin
    .from(CONNECTION_TABLE)
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

async function getConnection(
  userId: string,
): Promise<GoogleClassroomConnectionRow> {
 const { data, error } = await dbAdmin
  .from("google_classroom_connections")
  .select(
    "access_token_encrypted,refresh_token_encrypted,expires_at,is_active,token_type,granted_scopes",
  )
  .eq("user_id", userId)
  .maybeSingle();

  if (error) {
    throw new GoogleClassroomClientError(
      "CONNECTION_READ_FAILED",
      "تعذر قراءة اتصال Google Classroom",
      error,
    );
  }

  if (!data || !data.is_active) {
    throw new GoogleClassroomClientError(
      "NOT_CONNECTED",
      "حساب Google Classroom غير مربوط",
    );
  }

  return data as GoogleClassroomConnectionRow;
}

function credentialsChanged(
  current: StoredCredentials,
  stored: StoredCredentials,
) {
  return (
    current.accessToken !== stored.accessToken ||
    current.refreshToken !== stored.refreshToken ||
    current.expiryDate !== stored.expiryDate ||
    current.tokenType !== stored.tokenType ||
    current.scopes !== stored.scopes
  );
}

// Create an authorized client and persist refreshed tokens.
export async function createAuthorizedGoogleClassroomClient(
  userId: string,
) {
  const connection = await getConnection(userId);

  if (
    !connection.access_token_encrypted ||
    !connection.refresh_token_encrypted
  ) {
    throw new GoogleClassroomClientError(
      "REAUTH_REQUIRED",
      "يجب إعادة ربط حساب Google Classroom",
    );
  }

  let accessToken: string;
  let refreshToken: string;

  try {
    accessToken = decryptGoogleToken(
      connection.access_token_encrypted,
    );
    refreshToken = decryptGoogleToken(
      connection.refresh_token_encrypted,
    );
  } catch (error) {
    throw new GoogleClassroomClientError(
      "REAUTH_REQUIRED",
      "تعذر قراءة رموز Google؛ أعد ربط الحساب",
      error,
    );
  }

  const oauthClient = createGoogleOAuthClient();
  let storedCredentials: StoredCredentials = {
    accessToken,
    refreshToken,
    expiryDate: parseExpiryDate(connection.expires_at),
    tokenType: connection.token_type,
    scopes: connection.granted_scopes,
  };

  oauthClient.setCredentials({
    access_token: storedCredentials.accessToken,
    refresh_token: storedCredentials.refreshToken,
    expiry_date: storedCredentials.expiryDate,
    token_type: storedCredentials.tokenType ?? undefined,
    scope: storedCredentials.scopes ?? undefined,
  });

  async function persistCredentials() {
    const currentCredentials: StoredCredentials = {
      accessToken:
        oauthClient.credentials.access_token ??
        storedCredentials.accessToken,
      refreshToken:
        oauthClient.credentials.refresh_token ??
        storedCredentials.refreshToken,
      expiryDate: oauthClient.credentials.expiry_date ?? undefined,
      tokenType:
        oauthClient.credentials.token_type ??
        storedCredentials.tokenType,
      scopes:
        oauthClient.credentials.scope ?? storedCredentials.scopes,
    };

    if (!credentialsChanged(currentCredentials, storedCredentials)) {
      return;
    }

    const { error } = await dbAdmin
      .from(CONNECTION_TABLE)
      .update({
        access_token_encrypted: encryptGoogleToken(
          currentCredentials.accessToken,
        ),
        refresh_token_encrypted: encryptGoogleToken(
          currentCredentials.refreshToken,
        ),
        token_type: currentCredentials.tokenType,
        granted_scopes: currentCredentials.scopes,
        expires_at: currentCredentials.expiryDate
          ? new Date(currentCredentials.expiryDate).toISOString()
          : null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      throw new GoogleClassroomClientError(
        "CONNECTION_UPDATE_FAILED",
        "تم تجديد الرمز لكن تعذر حفظه",
        error,
      );
    }

    storedCredentials = currentCredentials;
  }

  try {
    const accessTokenResult = await oauthClient.getAccessToken();

    if (!accessTokenResult.token) {
      throw new Error("Google returned an empty access token");
    }

    await persistCredentials();
  } catch (error) {
    if (error instanceof GoogleClassroomClientError) {
      throw error;
    }

    if (isInvalidGrantError(error)) {
      await deactivateConnection(userId);

      throw new GoogleClassroomClientError(
        "REAUTH_REQUIRED",
        "انتهت صلاحية ربط Google Classroom؛ أعد ربط الحساب",
        error,
      );
    }

    throw new GoogleClassroomClientError(
      "TOKEN_REFRESH_FAILED",
      "تعذر تجديد صلاحية Google Classroom",
      error,
    );
  }

  return {
    auth: oauthClient,
    persistCredentials,
  };
}