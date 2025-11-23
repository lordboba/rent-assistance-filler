// Firebase Admin SDK for server-side authentication
// Used to verify ID tokens in API routes

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;

function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Check for service account credentials
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId) {
    console.warn("Firebase Admin: No project ID configured");
    return null;
  }

  try {
    if (clientEmail && privateKey) {
      // Use service account credentials
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      // Use default credentials (for local development or Google Cloud)
      adminApp = initializeApp({
        projectId,
      });
    }
    return adminApp;
  } catch (error) {
    console.error("Firebase Admin initialization failed:", error);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  if (adminAuth) return adminAuth;

  const app = getAdminApp();
  if (!app) return null;

  try {
    adminAuth = getAuth(app);
    return adminAuth;
  } catch (error) {
    console.error("Firebase Admin Auth initialization failed:", error);
    return null;
  }
}

export interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

// Verify Firebase ID token from Authorization header
export async function verifyIdToken(authHeader: string | null): Promise<DecodedToken | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];
  if (!idToken) return null;

  const auth = getAdminAuth();
  if (!auth) {
    console.warn("Firebase Admin not configured - skipping token verification");
    return null;
  }

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      email_verified: decodedToken.email_verified,
      name: decodedToken.name,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Check if Firebase Admin is configured
export function isFirebaseAdminConfigured(): boolean {
  return !!getAdminApp();
}
