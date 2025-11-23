// Field-level encryption for PII stored in Redis
// Uses AES-256-GCM for authenticated encryption

import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is required");
  }
  // Derive a 32-byte key from the provided key using SHA-256
  return crypto.createHash("sha256").update(key).digest();
}

export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData (all hex encoded)
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(":")) return ciphertext;

  const key = getEncryptionKey();
  const parts = ciphertext.split(":");

  if (parts.length !== 3) {
    // Not encrypted, return as-is (for backwards compatibility with existing data)
    return ciphertext;
  }

  const [ivHex, authTagHex, encryptedData] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// List of fields that should be encrypted
export const SENSITIVE_FIELDS = ["ssn", "dateOfBirth"] as const;

export type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

export function isSensitiveField(field: string): field is SensitiveField {
  return SENSITIVE_FIELDS.includes(field as SensitiveField);
}

// Encrypt sensitive fields in an object
export function encryptSensitiveFields<T extends Record<string, unknown>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (field in result && typeof result[field] === "string" && result[field]) {
      (result as Record<string, unknown>)[field] = encrypt(result[field] as string);
    }
  }

  return result;
}

// Decrypt sensitive fields in an object
export function decryptSensitiveFields<T extends Record<string, unknown>>(data: T): T {
  if (!data || typeof data !== "object") return data;

  const result = { ...data };

  for (const field of SENSITIVE_FIELDS) {
    if (field in result && typeof result[field] === "string" && result[field]) {
      (result as Record<string, unknown>)[field] = decrypt(result[field] as string);
    }
  }

  return result;
}

// Check if encryption is properly configured
export function isEncryptionConfigured(): boolean {
  return !!process.env.ENCRYPTION_KEY;
}

// Mask SSN for display (show last 4 digits only)
export function maskSSN(ssn: string): string {
  if (!ssn || ssn.length < 4) return "***-**-****";
  const last4 = ssn.replace(/\D/g, "").slice(-4);
  return `***-**-${last4}`;
}
