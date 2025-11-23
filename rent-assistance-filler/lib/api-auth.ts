// API route authentication helper
// Validates Firebase ID token and ensures user owns the requested resource

import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, DecodedToken, isFirebaseAdminConfigured } from "./firebase-admin";

export interface AuthResult {
  authenticated: boolean;
  user: DecodedToken | null;
  error?: string;
}

// Verify authentication from request headers
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");

  // If Firebase Admin is not configured, log warning but allow request
  // This enables local development without full Firebase setup
  if (!isFirebaseAdminConfigured()) {
    console.warn("API Auth: Firebase Admin not configured - auth checks disabled");
    return { authenticated: true, user: null };
  }

  const user = await verifyIdToken(authHeader);

  if (!user) {
    return {
      authenticated: false,
      user: null,
      error: "Invalid or missing authentication token",
    };
  }

  return { authenticated: true, user };
}

// Verify that the authenticated user matches the requested userId
export async function verifyUserOwnership(
  request: NextRequest,
  requestedUserId: string
): Promise<AuthResult> {
  const authResult = await verifyAuth(request);

  if (!authResult.authenticated) {
    return authResult;
  }

  // If no user info (Firebase Admin not configured), skip ownership check
  if (!authResult.user) {
    return authResult;
  }

  // Verify the authenticated user is requesting their own data
  if (authResult.user.uid !== requestedUserId) {
    return {
      authenticated: false,
      user: authResult.user,
      error: "You do not have permission to access this resource",
    };
  }

  return authResult;
}

// Helper to create unauthorized response
export function unauthorizedResponse(message?: string): NextResponse {
  return NextResponse.json(
    { error: message || "Unauthorized" },
    { status: 401 }
  );
}

// Helper to create forbidden response
export function forbiddenResponse(message?: string): NextResponse {
  return NextResponse.json(
    { error: message || "Forbidden - you do not have access to this resource" },
    { status: 403 }
  );
}
