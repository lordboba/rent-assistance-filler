# TODO

## Security - Sensitive Data Storage

### Current State (CRITICAL ISSUES)

#### SSN & PII Storage
- [ ] **Plain text storage** - SSN and all PII stored unencrypted in Redis (`lib/redis.ts`)
- [ ] **Misleading UI** - `app/profile/page.tsx:177-178` claims "Your SSN is encrypted and stored securely" but no encryption exists

#### Document Storage
- [ ] **Incomplete implementation** - Only file names stored, not actual files
- [ ] `app/api/documents/route.ts` is a placeholder with TODO comments

#### API Authorization
- [ ] **No server-side auth** - API routes accept any `userId` without ownership verification
- [ ] `/api/profile`, `/api/documents`, `/api/forms` all vulnerable to unauthorized access

#### Credentials Management
- [ ] Redis credentials hardcoded in `.env.local`
- [ ] Credentials potentially committed to git

---

### Recommended Security Implementations

#### 1. Field-Level Encryption for SSN
- [ ] Implement AES-256-GCM encryption using Node.js `crypto` module
- [ ] Store encryption keys in secure secrets manager (not in code)
- [ ] Encrypt SSN before storing in Redis, decrypt on retrieval
- [ ] Consider storing only last 4 digits if full SSN not required

#### 2. Server-Side Authentication
- [ ] Validate Firebase ID tokens on all API routes
- [ ] Use `firebase-admin` SDK (already installed) to verify tokens
- [ ] Ensure `userId` in request matches authenticated user's UID
- [ ] Return 401/403 for unauthorized requests

#### 3. Document Storage
- [ ] Implement actual file upload to Firebase Storage
- [ ] Use signed URLs with expiration for document access
- [ ] Enable Firebase Storage security rules
- [ ] Consider client-side encryption before upload

#### 4. Secrets Management
- [ ] Move Redis URL to platform secrets (Vercel env vars)
- [ ] Remove `.env.local` from git / add to `.gitignore`
- [ ] Rotate any exposed credentials
- [ ] Use separate credentials for dev/staging/prod

#### 5. Additional Security Measures
- [ ] Add rate limiting to API routes
- [ ] Implement audit logging for sensitive data access
- [ ] Set TTL/data retention policy on Redis keys
- [ ] Strengthen password requirements (currently 6 char minimum)
- [ ] Add input validation/sanitization on all form fields

---

### Files Requiring Changes

| File | Changes Needed |
|------|----------------|
| `lib/redis.ts` | Add encryption/decryption functions |
| `app/api/profile/route.ts` | Add auth verification |
| `app/api/documents/route.ts` | Add auth + implement actual upload |
| `app/api/forms/route.ts` | Add auth verification |
| `contexts/AuthContext.tsx` | Export token for API calls |
| `app/profile/page.tsx` | Update or remove misleading encryption claim |
| `.gitignore` | Add `.env.local` if not present |
