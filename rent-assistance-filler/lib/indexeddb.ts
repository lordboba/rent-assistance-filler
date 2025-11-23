// IndexedDB utility for client-side document storage
// Documents never leave the user's device - stored locally in the browser

const DB_NAME = "VeteranAssistDocuments";
const DB_VERSION = 1;
const STORE_NAME = "documents";

export interface StoredDocument {
  id: string;
  userId: string;
  documentType: "dd214" | "vaBenefitsLetter" | "governmentId";
  fileName: string;
  fileType: string;
  fileSize: number;
  data: ArrayBuffer;
  createdAt: string;
  updatedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("userId", "userId", { unique: false });
        store.createIndex("documentType", "documentType", { unique: false });
        store.createIndex("userId_documentType", ["userId", "documentType"], { unique: true });
      }
    };
  });

  return dbPromise;
}

export async function saveDocument(
  userId: string,
  documentType: StoredDocument["documentType"],
  file: File
): Promise<StoredDocument> {
  const db = await getDB();
  const arrayBuffer = await file.arrayBuffer();

  const document: StoredDocument = {
    id: `${userId}-${documentType}`,
    userId,
    documentType,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    data: arrayBuffer,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(document);

    request.onsuccess = () => resolve(document);
    request.onerror = () => reject(new Error("Failed to save document"));
  });
}

export async function getDocument(
  userId: string,
  documentType: StoredDocument["documentType"]
): Promise<StoredDocument | null> {
  const db = await getDB();
  const id = `${userId}-${documentType}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error("Failed to get document"));
  });
}

export async function getAllUserDocuments(userId: string): Promise<StoredDocument[]> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("userId");
    const request = index.getAll(userId);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error("Failed to get user documents"));
  });
}

export async function deleteDocument(
  userId: string,
  documentType: StoredDocument["documentType"]
): Promise<void> {
  const db = await getDB();
  const id = `${userId}-${documentType}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error("Failed to delete document"));
  });
}

export async function deleteAllUserDocuments(userId: string): Promise<void> {
  const documents = await getAllUserDocuments(userId);
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    let completed = 0;
    const total = documents.length;

    if (total === 0) {
      resolve();
      return;
    }

    documents.forEach((doc) => {
      const request = store.delete(doc.id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(new Error("Failed to delete documents"));
    });
  });
}

export function documentToFile(doc: StoredDocument): File {
  return new File([doc.data], doc.fileName, { type: doc.fileType });
}

export function hasIndexedDBSupport(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}
