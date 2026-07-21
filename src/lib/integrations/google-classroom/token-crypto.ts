import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import { env } from "@/config/env";

const ALGORITHM = "aes-256-gcm";
const TOKEN_VERSION = "v1";
const IV_LENGTH = 12;

function getEncryptionKey() {
  return Buffer.from(
    env.GOOGLE_TOKEN_ENCRYPTION_KEY,
    "hex",
  );
}

export function encryptGoogleToken(token: string) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(
    ALGORITHM,
    getEncryptionKey(),
    iv,
  );

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    iv.toString("base64url"),
    authTag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptGoogleToken(payload: string) {
  const [version, ivValue, authTagValue, encryptedValue] =
    payload.split(".");

  if (
    version !== TOKEN_VERSION ||
    !ivValue ||
    !authTagValue ||
    !encryptedValue
  ) {
    throw new Error("Invalid encrypted Google token");
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivValue, "base64url"),
  );

  decipher.setAuthTag(
    Buffer.from(authTagValue, "base64url"),
  );

  return Buffer.concat([
    decipher.update(
      Buffer.from(encryptedValue, "base64url"),
    ),
    decipher.final(),
  ]).toString("utf8");
}