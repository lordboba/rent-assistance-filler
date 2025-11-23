# TODO

## Security - Sensitive Data Storage

### Current State

#### SSN & PII Storage
- [ ] **Plain text storage** - SSN and all PII stored unencrypted in Redis (`lib/redis.ts`)
- [ ] **Misleading UI** - `app/profile/page.tsx:177-178` claims "Your SSN is encrypted and stored securely" but no encryption exists

#### Document Storage
- [ ] **Incomplete implementation** - Only file names stored, not actual files
- [ ] `app/api/documents/route.ts` is a placeholder with TODO comments

#### API Authorization
- [ ] **No server-side auth** - API routes accept any `userId` without ownership verification

---

### Storage Strategy (Hybrid Approach)

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
- [ ] Create `lib/indexeddb.ts` utility for document CRUD
- [ ] Store uploaded files in IndexedDB instead of sending to server
- [ ] Update `app/documents/page.tsx` to use IndexedDB

#### 2. Field-Level Encryption for PII
- [ ] Add encryption helper using Node.js `crypto` module
- [ ] Encrypt SSN/sensitive fields before Redis storage
- [ ] Update `lib/redis.ts` to encrypt on save, decrypt on read

#### 3. Basic API Auth (nice-to-have for hackathon)
- [ ] Validate Firebase ID token on API routes using `firebase-admin`
- [ ] Ensure `userId` matches authenticated user

#### 4. Quick Fixes
- [ ] Update or remove misleading "encrypted" claim in profile UI
- [ ] Add `.env.local` to `.gitignore`

---

### Files to Change

| File | Changes |
|------|---------|
| `lib/indexeddb.ts` | New - browser document storage |
| `lib/redis.ts` | Add encrypt/decrypt for PII fields |
| `app/documents/page.tsx` | Use IndexedDB instead of API upload |
| `app/profile/page.tsx` | Fix misleading encryption claim |
| `.gitignore` | Add `.env.local` |
