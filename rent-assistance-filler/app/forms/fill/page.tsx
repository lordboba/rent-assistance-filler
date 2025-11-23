"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { FORM_TYPES, FormField } from "@/lib/types";

function FormFillContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const formType = searchParams.get("type");

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const currentForm = FORM_TYPES.find((f) => f.id === formType);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Initialize form with empty values
    if (currentForm) {
      const initialData: Record<string, string> = {};
      currentForm.fields.forEach((field) => {
        initialData[field.id] = "";
      });
      setFormData(initialData);
    }
  }, [currentForm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (status: "draft" | "completed") => {
    setSaving(true);

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          formType,
          formData,
          status,
        }),
      });

      if (response.ok) {
        if (status === "completed") {
          router.push(`/forms/review?type=${formType}`);
        }
      }
    } catch (error) {
      console.error("Error saving form:", error);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: FormField) => {
    const baseInputClass = "input-field";

    switch (field.type) {
      case "select":
        return (
          <select
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className={baseInputClass}
          />
        );

      case "date":
        return (
          <input
            type="date"
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            className={baseInputClass}
          />
        );

      case "email":
        return (
          <input
            type="email"
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || "email@example.com"}
            className={baseInputClass}
          />
        );

      case "phone":
        return (
          <input
            type="tel"
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder || "(555) 555-5555"}
            className={baseInputClass}
          />
        );

      case "ssn":
        return (
          <input
            type="text"
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder="XXX-XX-XXXX"
            className={baseInputClass}
          />
        );

      case "address":
        return (
          <textarea
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder="Street Address, City, State ZIP"
            rows={2}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            type="text"
            name={field.id}
            value={formData[field.id] || ""}
            onChange={handleChange}
            required={field.required}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  if (loading || !user) {
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
          <button
            onClick={() => router.push("/forms")}
            className="text-sm text-secondary hover:text-foreground mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Forms
          </button>
          <h1 className="font-serif text-3xl font-bold text-foreground">{currentForm.name}</h1>
          <p className="text-secondary mt-2">{currentForm.description}</p>
        </div>

        {/* AI Auto-fill Notice */}
        <div className="card bg-blue-50 border-blue-200 mb-6">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900">AI Auto-Fill Available</h3>
              <p className="text-sm text-blue-800 mt-1">
                Fields marked with a lightning bolt can be auto-filled from your profile and uploaded documents.
                Review all auto-filled data for accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form className="space-y-6">
          <div className="card">
            <div className="grid sm:grid-cols-2 gap-4">
              {currentForm.fields.map((field) => (
                <div
                  key={field.id}
                  className={
                    field.type === "textarea" || field.type === "address"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {field.label}
                    {field.required && <span className="text-error ml-1">*</span>}
                    {field.autoFillKey && (
                      <span title="Auto-fillable from profile">
                        <svg
                          className="w-4 h-4 inline-block ml-1 text-primary"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      </span>
                    )}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="btn-secondary w-full sm:w-auto"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("completed")}
              disabled={saving}
              className="btn-primary w-full sm:w-auto"
            >
              {saving ? "Saving..." : "Complete & Review"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function FormFill() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }
    >
      <FormFillContent />
    </Suspense>
  );
}
