import { createClient } from "redis";

type RedisClient = ReturnType<typeof createClient>;

let redis: RedisClient | null = null;

const getRedisClient = async (): Promise<RedisClient | null> => {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn("REDIS_URL not configured - using mock storage");
    return null;
  }

  redis = createClient({ url: redisUrl });
  redis.on("error", (err) => console.error("Redis Client Error", err));
  await redis.connect();
  return redis;
};

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  ssn?: string;
  veteranStatus: {
    branch: string;
    serviceStart: string;
    serviceEnd: string;
    dischargeType: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  documents: {
    dd214?: string;
    vaBenefitsLetter?: string;
    governmentId?: string;
  };
  extractedData?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface FormProgress {
  id: string;
  userId: string;
  formType: string;
  formData: Record<string, string>;
  status: "draft" | "completed" | "exported";
  createdAt: string;
  updatedAt: string;
}

// User Profile operations
export async function saveUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;
  const key = `user:${userId}:profile`;
  const existing = await getUserProfile(userId);
  const updated = {
    ...existing,
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await client.set(key, JSON.stringify(updated));
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const client = await getRedisClient();
  if (!client) return null;
  const key = `user:${userId}:profile`;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

// Form Progress operations
export async function saveFormProgress(userId: string, formId: string, progress: Partial<FormProgress>): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;
  const key = `user:${userId}:form:${formId}`;
  const existing = await getFormProgress(userId, formId);
  const updated = {
    ...existing,
    ...progress,
    updatedAt: new Date().toISOString(),
  };
  await client.set(key, JSON.stringify(updated));
}

export async function getFormProgress(userId: string, formId: string): Promise<FormProgress | null> {
  const client = await getRedisClient();
  if (!client) return null;
  const key = `user:${userId}:form:${formId}`;
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
}

export async function getAllUserForms(userId: string): Promise<FormProgress[]> {
  const client = await getRedisClient();
  if (!client) return [];
  const keys = await client.keys(`user:${userId}:form:*`);
  if (keys.length === 0) return [];

  const forms: FormProgress[] = [];
  for (const key of keys) {
    const data = await client.get(key);
    if (data) {
      forms.push(JSON.parse(data));
    }
  }
  return forms;
}

// Extracted document data operations
export async function saveExtractedData(userId: string, documentType: string, data: Record<string, string>): Promise<void> {
  const client = await getRedisClient();
  if (!client) return;
  const key = `user:${userId}:extracted:${documentType}`;
  await client.set(key, JSON.stringify({
    data,
    extractedAt: new Date().toISOString(),
  }));
}

export async function getExtractedData(userId: string, documentType: string): Promise<Record<string, string> | null> {
  const client = await getRedisClient();
  if (!client) return null;
  const key = `user:${userId}:extracted:${documentType}`;
  const result = await client.get(key);
  return result ? JSON.parse(result).data : null;
}

export { getRedisClient };
