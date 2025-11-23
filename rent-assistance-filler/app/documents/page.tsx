"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FileUpload from "@/components/FileUpload";
import {
  saveDocument,
  getAllUserDocuments,
  StoredDocument,
  hasIndexedDBSupport,
} from "@/lib/indexeddb";
import { fetchWithAuth } from "@/lib/api-client";

interface UploadedDocs {
  dd214: File | null;
  vaBenefitsLetter: File | null;
  governmentId: File | null;
}

export default function Documents() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [indexedDBSupported, setIndexedDBSupported] = useState(true);
  const [storedDocs, setStoredDocs] = useState<Record<string, StoredDocument>>({});
  const [documents, setDocuments] = useState<UploadedDocs>({
    dd214: null,
    vaBenefitsLetter: null,
    governmentId: null,
  });

  // Check IndexedDB support and load existing documents
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user && hasIndexedDBSupport()) {
      setIndexedDBSupported(true);
      loadStoredDocuments();
    } else if (!hasIndexedDBSupport()) {
      setIndexedDBSupported(false);
    }
  }, [user, loading, router]);

  const loadStoredDocuments = async () => {
    if (!user) return;
    try {
      const docs = await getAllUserDocuments(user.uid);
      const docsMap: Record<string, StoredDocument> = {};
      docs.forEach((doc) => {
        docsMap[doc.documentType] = doc;
      });
      setStoredDocs(docsMap);
    } catch (error) {
      console.error("Error loading stored documents:", error);
    }
  };

  const handleFileSelect = (docType: keyof UploadedDocs) => (file: File) => {
    setDocuments((prev) => ({ ...prev, [docType]: file }));
    setProcessed(false);
  };

  const handleProcess = async () => {
    if (!user) return;
    setProcessing(true);

    try {
      // Step 1: Save documents to IndexedDB (local browser storage)
      // Documents never leave the user's device
      const savePromises: Promise<StoredDocument>[] = [];

      if (documents.dd214) {
        savePromises.push(saveDocument(user.uid, "dd214", documents.dd214));
      }
      if (documents.vaBenefitsLetter) {
        savePromises.push(saveDocument(user.uid, "vaBenefitsLetter", documents.vaBenefitsLetter));
      }
      if (documents.governmentId) {
        savePromises.push(saveDocument(user.uid, "governmentId", documents.governmentId));
      }

      await Promise.all(savePromises);

      // Step 2: Send only metadata (file names) to server
      // Actual files stay in local IndexedDB
      const response = await fetchWithAuth("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          userId: user.uid,
          documents: {
            dd214: documents.dd214?.name || storedDocs.dd214?.fileName || null,
            vaBenefitsLetter: documents.vaBenefitsLetter?.name || storedDocs.vaBenefitsLetter?.fileName || null,
            governmentId: documents.governmentId?.name || storedDocs.governmentId?.fileName || null,
          },
        }),
      });

      if (response.ok) {
        setProcessed(true);
        await loadStoredDocuments();
        setTimeout(() => {
          router.push("/forms");
        }, 1500);
      }
    } catch (error) {
      console.error("Error processing documents:", error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasDocuments = documents.dd214 || documents.vaBenefitsLetter || documents.governmentId ||
    storedDocs.dd214 || storedDocs.vaBenefitsLetter || storedDocs.governmentId;

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Upload Documents</h1>
          <p className="text-secondary mt-2">
            Upload your supporting documents. Our AI will extract information to auto-fill your forms.
          </p>
        </div>

        <div className="space-y-6">
          {/* DD-214 */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold">DD-214</h2>
                <p className="text-sm text-secondary mt-1">
                  Certificate of Release or Discharge from Active Duty
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-800 rounded-full">
                Required
              </span>
            </div>
            <FileUpload
              label=""
              onFileSelect={handleFileSelect("dd214")}
              currentFile={documents.dd214?.name || storedDocs.dd214?.fileName}
            />
          </div>

          {/* VA Benefits Letter */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold">VA Benefits Letter</h2>
                <p className="text-sm text-secondary mt-1">
                  Proof of VA benefits and disability rating
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Recommended
              </span>
            </div>
            <FileUpload
              label=""
              onFileSelect={handleFileSelect("vaBenefitsLetter")}
              currentFile={documents.vaBenefitsLetter?.name || storedDocs.vaBenefitsLetter?.fileName}
            />
          </div>

          {/* Government ID */}
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-serif text-xl font-semibold">Government ID</h2>
                <p className="text-sm text-secondary mt-1">
                  Driver&apos;s license, state ID, or passport
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                Recommended
              </span>
            </div>
            <FileUpload
              label=""
              onFileSelect={handleFileSelect("governmentId")}
              currentFile={documents.governmentId?.name || storedDocs.governmentId?.fileName}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-blue-900">Local-First Storage</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Your documents are stored securely in your browser and never uploaded to our servers.
                  Only extracted text data is sent to fill your forms.
                </p>
              </div>
            </div>
          </div>

          {/* IndexedDB Warning */}
          {!indexedDBSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-medium text-yellow-900">Browser Storage Unavailable</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    Your browser does not support local document storage. Documents will not persist
                    between sessions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="btn-secondary"
            >
              Back to Profile
            </button>
            <button
              onClick={handleProcess}
              disabled={!hasDocuments || processing}
              className="btn-primary disabled:opacity-50"
            >
              {processing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : processed ? (
                "Processed! Redirecting..."
              ) : (
                "Process Documents & Continue"
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
