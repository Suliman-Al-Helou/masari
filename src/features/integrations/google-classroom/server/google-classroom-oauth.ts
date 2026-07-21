import "server-only";

import { google } from "googleapis";

// Request only the permissions required by the feature.
const CLASSROOM_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.announcements.readonly",
  "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly",
] as const;

// Read a required server environment variable.
function requireServerEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing server environment variable: ${name}`);
  }

  return value;
}

// Create a server-only Google OAuth client.
export function createGoogleOAuthClient() {
  return new google.auth.OAuth2(
    requireServerEnv("GOOGLE_CLASSROOM_CLIENT_ID"),
    requireServerEnv("GOOGLE_CLASSROOM_CLIENT_SECRET"),
    requireServerEnv("GOOGLE_CLASSROOM_REDIRECT_URI"),
  );
}

// Generate the Google Classroom authorization URL.
export function createGoogleClassroomAuthUrl(state: string): string {
  const oauthClient = createGoogleOAuthClient();

  return oauthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: [...CLASSROOM_SCOPES],
    state,
  });
}