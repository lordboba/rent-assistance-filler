// Client-side helper for making authenticated API calls
// Automatically includes Firebase ID token in Authorization header

import { auth } from "./firebase";

export async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Failed to get auth token:", error);
    }
  }

  return headers;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  });
}
