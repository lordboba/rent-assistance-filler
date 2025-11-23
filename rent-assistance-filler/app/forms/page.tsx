"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FormCard from "@/components/FormCard";
import { FORM_TYPES } from "@/lib/types";

export default function Forms() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const federalForms = FORM_TYPES.filter((f) => f.category === "federal");
  const generalForms = FORM_TYPES.filter((f) => f.category === "general");

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Select Forms</h1>
          <p className="text-secondary mt-2">
            Choose the forms you need to complete. Your profile data will be auto-filled.
          </p>
        </div>

        {/* Federal Programs */}
        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-primary rounded-full mr-2"></span>
            Federal Programs
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {federalForms.map((form) => (
              <FormCard
                key={form.id}
                title={form.name}
                description={form.description}
                onClick={() => router.push(`/forms/fill?type=${form.id}`)}
              />
            ))}
          </div>
        </section>

        {/* General Forms */}
        <section className="mb-8">
          <h2 className="font-serif text-xl font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-secondary rounded-full mr-2"></span>
            General Forms
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {generalForms.map((form) => (
              <FormCard
                key={form.id}
                title={form.name}
                description={form.description}
                onClick={() => router.push(`/forms/fill?type=${form.id}`)}
              />
            ))}
          </div>
        </section>

        {/* AI Recommendations */}
        <section className="card bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-green-900">AI Recommendation</h3>
              <p className="text-sm text-green-800 mt-1">
                Based on your profile, we recommend starting with the <strong>HUD-VASH Application</strong> as
                it provides comprehensive housing support with VA case management services.
              </p>
              <button
                onClick={() => router.push("/forms/fill?type=hud-vash")}
                className="mt-3 text-sm font-medium text-green-700 hover:text-green-900"
              >
                Start HUD-VASH Application →
              </button>
            </div>
          </div>
        </section>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={() => router.push("/documents")}
            className="btn-secondary"
          >
            Back to Documents
          </button>
        </div>
      </main>
    </div>
  );
}
