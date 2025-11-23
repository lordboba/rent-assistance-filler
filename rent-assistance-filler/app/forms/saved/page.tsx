"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithAuth } from "@/lib/api-client";
import { FORM_TYPES } from "@/lib/types";
import Navbar from "@/components/Navbar";

interface SavedForm {
  id: string;
  userId: string;
  formType: string;
  formData: Record<string, string>;
  status: "draft" | "completed" | "exported";
  createdAt: string;
  updatedAt: string;
}

export default function SavedFormsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    const fetchForms = async () => {
      try {
        const response = await fetchWithAuth(`/api/forms?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error("Failed to fetch forms");
        }
        const data = await response.json();
        setForms(data.forms || []);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError("Failed to load saved forms");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, [user, authLoading, router]);

  const getFormName = (formType: string) => {
    const form = FORM_TYPES.find((f) => f.id === formType);
    return form?.name || formType;
  };

  const getFormDescription = (formType: string) => {
    const form = FORM_TYPES.find((f) => f.id === formType);
    return form?.description || "";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleFormClick = (form: SavedForm) => {
    if (form.status === "completed" || form.status === "exported") {
      router.push(`/forms/review?type=${form.formType}&formId=${form.id}`);
    } else {
      router.push(`/forms/fill?type=${form.formType}&formId=${form.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this form?")) return;

    try {
      const response = await fetchWithAuth(`/api/forms?userId=${user?.uid}&formId=${formId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setForms(forms.filter((f) => f.id !== formId));
      }
    } catch (err) {
      console.error("Error deleting form:", err);
    }
  };

  const statusConfig = {
    draft: {
      label: "Draft",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-400",
    },
    completed: {
      label: "Completed",
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-accent",
    },
    exported: {
      label: "Exported",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-primary",
    },
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const drafts = forms.filter((f) => f.status === "draft");
  const completed = forms.filter((f) => f.status === "completed" || f.status === "exported");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Saved Forms</h1>
          <p className="mt-2 text-secondary">
            View and manage your saved form submissions
          </p>
        </div>

        {forms.length === 0 ? (
          <div className="card text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 font-serif text-lg font-medium text-foreground">
              No saved forms yet
            </h3>
            <p className="mt-2 text-secondary">
              Start filling out a form to save your progress
            </p>
            <button
              onClick={() => router.push("/forms")}
              className="btn-primary mt-4"
            >
              Browse Forms
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {drafts.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Drafts ({drafts.length})
                </h2>
                <div className="space-y-3">
                  {drafts.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => handleFormClick(form)}
                      className={`card w-full text-left transition-all hover:shadow-md border-l-4 ${statusConfig[form.status].borderColor}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-semibold text-foreground">
                              {getFormName(form.formType)}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[form.status].bgColor} ${statusConfig[form.status].textColor}`}
                            >
                              {statusConfig[form.status].label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-secondary">
                            {getFormDescription(form.formType)}
                          </p>
                          <p className="mt-2 text-xs text-secondary">
                            Last updated: {formatDate(form.updatedAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-primary font-medium">
                            Continue
                          </span>
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {completed.length > 0 && (
              <section>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">
                  Completed ({completed.length})
                </h2>
                <div className="space-y-3">
                  {completed.map((form) => (
                    <button
                      key={form.id}
                      onClick={() => handleFormClick(form)}
                      className={`card w-full text-left transition-all hover:shadow-md border-l-4 ${statusConfig[form.status].borderColor}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif text-lg font-semibold text-foreground">
                              {getFormName(form.formType)}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusConfig[form.status].bgColor} ${statusConfig[form.status].textColor}`}
                            >
                              {statusConfig[form.status].label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-secondary">
                            {getFormDescription(form.formType)}
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-xs text-secondary">
                            <span>Created: {formatDate(form.createdAt)}</span>
                            <span>Updated: {formatDate(form.updatedAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-sm text-primary font-medium">
                            View
                          </span>
                          <svg
                            className="w-4 h-4 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
