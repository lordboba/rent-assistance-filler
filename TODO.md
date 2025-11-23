# TODO

## Security - Sensitive Data Storage

### Current State

#### SSN & PII Storage
- [x] **Plain text storage** - SSN and all PII stored unencrypted in Redis (`lib/redis.ts`)
  - Fixed: Added AES-256-GCM encryption in `lib/encryption.ts`
- [x] **Misleading UI** - `app/profile/page.tsx:177-178` claims "Your SSN is encrypted and stored securely" but no encryption exists
  - Fixed: Updated text to accurately describe AES-256-GCM encryption

#### Document Storage
- [x] **Incomplete implementation** - Only file names stored, not actual files
  - Fixed: Documents now stored in IndexedDB (browser-local, never uploaded)
- [x] `app/api/documents/route.ts` is a placeholder with TODO comments
  - Fixed: Now only stores metadata, actual files stay in IndexedDB

#### API Authorization
- [x] **No server-side auth** - API routes accept any `userId` without ownership verification
  - Fixed: Added Firebase Admin token verification in `lib/api-auth.ts`

---

### Storage Strategy (Hybrid Approach) - IMPLEMENTED

**Goal:** Minimize cost, keep sensitive docs off servers, encrypt what we do store.

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Documents (DD-214, ID, VA letters) | **IndexedDB (browser)** | Never leaves device, zero cost |
| Extracted text from docs | **Redis (encrypted)** | Small data needed for form filling |
| SSN, DOB, other PII | **Redis (encrypted)** | Small strings, field-level encryption |

**Flow:**
1. User uploads document → stored in IndexedDB locally
2. Extract relevant fields (client-side or temp server processing)
3. Only extracted text stored in Redis (encrypted)
4. Original document stays on user's device only

---

### Implementation Tasks

#### 1. Browser Document Storage (IndexedDB)
- [x] Create `lib/indexeddb.ts` utility for document CRUD
- [x] Store uploaded files in IndexedDB instead of sending to server
- [x] Update `app/documents/page.tsx` to use IndexedDB

#### 2. Field-Level Encryption for PII
- [x] Add encryption helper using Node.js `crypto` module (`lib/encryption.ts`)
- [x] Encrypt SSN/sensitive fields before Redis storage
- [x] Update `lib/redis.ts` to encrypt on save, decrypt on read

#### 3. Basic API Auth
- [x] Validate Firebase ID token on API routes using `firebase-admin` (`lib/firebase-admin.ts`)
- [x] Ensure `userId` matches authenticated user (`lib/api-auth.ts`)

#### 4. Quick Fixes
- [x] Update or remove misleading "encrypted" claim in profile UI
- [x] Add `.env.local` to `.gitignore`

---

### Files Changed

| File | Changes |
|------|---------|
| `lib/indexeddb.ts` | New - browser document storage |
| `lib/encryption.ts` | New - AES-256-GCM field-level encryption |
| `lib/firebase-admin.ts` | New - Firebase Admin SDK for server auth |
| `lib/api-auth.ts` | New - API route authentication helper |
| `lib/redis.ts` | Added encrypt/decrypt for PII fields |
| `app/documents/page.tsx` | Uses IndexedDB instead of API upload |
| `app/profile/page.tsx` | Fixed misleading encryption claim |
| `app/api/profile/route.ts` | Added auth verification |
| `app/api/documents/route.ts` | Added auth verification |
| `app/api/forms/route.ts` | Added auth verification |
| `.gitignore` | Added `.env.local` |
| `.env.example` | Added new environment variables |
