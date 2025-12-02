"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { FORM_TYPES } from "@/lib/types";
import { fetchWithAuth } from "@/lib/api-client";
import { SUPPORTED_PDF_FORMS } from "@/lib/pdf-support";

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  ssn?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  veteranStatus?: {
    branch?: string;
    serviceStart?: string;
    serviceEnd?: string;
    dischargeType?: string;
  };
}

interface SavedForm {
  id: string;
  formType: string;
  formData: Record<string, string>;
  status?: string;
  updatedAt?: string;
  createdAt?: string;
}

function ReviewContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formType = searchParams.get("type");

  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [formId, setFormId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentForm = FORM_TYPES.find((f) => f.id === formType);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  // Load profile and autofill form data for review
  useEffect(() => {
    if (!currentForm || !user) return;

    const loadFormData = async () => {
      const data: Record<string, string> = {};
      currentForm.fields.forEach((field) => {
        data[field.id] = "";
      });

      try {
        // Autofill from profile as baseline
        const profileResponse = await fetchWithAuth(`/api/profile?userId=${user.uid}`);
        if (profileResponse.ok) {
          const result = await profileResponse.json();
          const profile: UserProfile = result.profile || {};
          currentForm.fields.forEach((field) => {
            if (field.autoFillKey) {
              const value = getProfileValue(profile, field.autoFillKey, user.email || "");
              if (value) {
                data[field.id] = value;
              }
            }
          });
        }

        // Overlay any saved form data for this form type
        const formsResponse = await fetchWithAuth(`/api/forms?userId=${user.uid}`);
        if (formsResponse.ok) {
          const result = await formsResponse.json();
          const forms: SavedForm[] = result.forms || [];
          const matching = forms
            .filter((f) => f.id && f.id.startsWith(formType || "") && f.formType === formType)
            .sort((a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime());

          if (matching.length > 0) {
            const selected = matching[0];
            setFormId(selected.id);
            Object.assign(data, selected.formData || {});
          }
        }
      } catch (error) {
        console.error("Error loading form data:", error);
      }

      setFormData(data);
      setLoadingData(false);
    };

    loadFormData();
  }, [currentForm, user]);

  // Helper to get nested profile values
  const getProfileValue = (profile: UserProfile, key: string, userEmail: string): string => {
    if (key === "email") return userEmail;

    if (key === "address") {
      const addr = profile.address;
      if (!addr) return "";
      const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean);
      return parts.join(", ");
    }

    if (key.startsWith("veteranStatus.")) {
      const subKey = key.split(".")[1] as keyof NonNullable<UserProfile["veteranStatus"]>;
      return profile.veteranStatus?.[subKey] || "";
    }

    return (profile as Record<string, string>)[key] || "";
  };

  // Mask sensitive data for display
  const maskSensitiveData = (fieldId: string, value: string): string => {
    if (fieldId === "ssn" && value) {
      const digits = value.replace(/\D/g, "");
      if (digits.length >= 4) {
        return `***-**-${digits.slice(-4)}`;
      }
    }
    return value || "Not provided";
  };

  const handleExportPDF = async () => {
    if (!formType) return;
    if (!SUPPORTED_PDF_FORMS.includes(formType)) {
      setError("PDF export for this form will be added soon. Currently supported: Section 8, VA Benefits, Income Verification.");
      return;
    }

    setExporting(true);
    setError(null);

    try {
      const response = await fetchWithAuth("/api/forms/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          formType,
          formId,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formType}-application.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExported(true);
    } catch (err) {
      console.error(err);
      setError("Unable to generate the PDF right now. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !user || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="min-h-screen bg-muted">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card text-center">
            <h1 className="font-serif text-2xl font-bold text-foreground mb-4">Form Not Found</h1>
            <p className="text-secondary mb-6">The requested form type does not exist.</p>
            <button onClick={() => router.push("/forms")} className="btn-primary">
              Back to Forms
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Review & Export</h1>
          <p className="text-secondary mt-2">
            Review your completed form before exporting.
          </p>
        </div>

        {/* Success Message */}
        <div className="card bg-green-50 border-green-200 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-green-900">Form Completed</h3>
              <p className="text-sm text-green-800">
                Your {currentForm.name} has been filled out and saved.
              </p>
            </div>
          </div>
        </div>

        {/* Form Preview */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold">{currentForm.name}</h2>
            <span className="text-xs font-medium px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Completed
            </span>
          </div>

          {/* Form Data Display */}
          <div className="border border-border rounded-lg p-6 bg-muted/50">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {currentForm.fields.map((field) => (
                <div key={field.id} className={field.type === "address" || field.type === "textarea" ? "sm:col-span-2" : ""}>
                  <dt className="text-secondary text-xs uppercase tracking-wide">{field.label}</dt>
                  <dd className="font-medium text-foreground mt-1">
                    {maskSensitiveData(field.id, formData[field.id])}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Form Summary */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="font-medium text-foreground mb-4">Form Summary</h3>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-secondary">Form Type</dt>
                <dd className="font-medium text-foreground">{currentForm.name}</dd>
              </div>
              <div>
                <dt className="text-secondary">Category</dt>
                <dd className="font-medium text-foreground capitalize">{currentForm.category}</dd>
              </div>
              <div>
                <dt className="text-secondary">Fields Completed</dt>
                <dd className="font-medium text-foreground">
                  {Object.values(formData).filter(Boolean).length} / {currentForm.fields.length}
                </dd>
              </div>
              <div>
                <dt className="text-secondary">Status</dt>
                <dd className="font-medium text-accent">Ready to Export</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Export Options */}
        <div className="card mb-6">
          <h2 className="font-serif text-xl font-semibold mb-4">Export Options</h2>
          <div className="space-y-4">
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13H10v4H8.5v-4zm2.5 0h1.5v4H11v-4zm2.5 0H15v4h-1.5v-4z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-foreground">Download as PDF</p>
                  <p className="text-sm text-secondary">Standard format for printing and submission</p>
                </div>
              </div>
              {exporting ? (
                <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
            </button>
            {!SUPPORTED_PDF_FORMS.includes(currentForm.id) && (
              <p className="text-sm text-secondary">
                PDF export is currently available for HUD Section 8 (HUD-52641), VA Benefits Verification (26-8937), and Income Verification (VA 5655). Other forms will be added next.
              </p>
            )}
            {error && (
              <div className="text-sm text-error bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
          </div>
        </div>

        {exported && (
          <div className="card bg-green-50 border-green-200 mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">
                Your form has been exported successfully!
              </p>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="card bg-blue-50 border-blue-200 mb-6">
          <h2 className="font-serif text-xl font-semibold text-blue-900 mb-4">Next Steps</h2>
          <ol className="space-y-3 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
              <span>Review the exported PDF for accuracy</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
              <span>Print and sign where required</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
              <span>Submit to the appropriate agency or organization</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
              <span>For HUD-VASH, contact your local VA Medical Center at 877-424-3838</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => router.push(`/forms/fill?type=${formType}`)}
            className="btn-secondary w-full sm:w-auto"
          >
            Edit Form
          </button>
          <button
            onClick={() => router.push("/forms")}
            className="btn-primary w-full sm:w-auto"
          >
            Fill Another Form
          </button>
        </div>
      </main>
    </div>
  );
}

export default function Review() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ReviewContent />
    </Suspense>
  );
}
