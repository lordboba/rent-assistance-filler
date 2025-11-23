"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Veterans Rent Assistance
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto mb-8">
            AI-powered form filling assistant to help homeless veterans quickly complete
            rental assistance applications and secure housing.
          </p>
          {user ? (
            <Link href="/dashboard" className="btn-primary inline-block">
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin" className="btn-primary">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-secondary">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">1</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-secondary">
                Upload your DD-214, VA benefits letter, and ID. Our AI extracts your information automatically.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">2</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Select Forms</h3>
              <p className="text-secondary">
                Choose from HUD-VASH, SSVF, Section 8, and other rental assistance forms you need to complete.
              </p>
            </div>
            <div className="card text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-xl font-bold">3</span>
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Review & Export</h3>
              <p className="text-secondary">
                Review AI-filled forms, make any corrections, and export as PDF ready for submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Forms Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-foreground mb-12">
            Supported Forms
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "HUD-VASH Application", type: "Federal" },
              { name: "SSVF Intake Form", type: "Federal" },
              { name: "Section 8 Housing Choice Voucher", type: "Federal" },
              { name: "Standard Rental Application", type: "General" },
              { name: "Income Verification Form", type: "Federal" },
              { name: "Landlord Verification Form", type: "General" },
            ].map((form) => (
              <div key={form.name} className="flex items-center p-4 border border-border rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-foreground">{form.name}</p>
                  <p className="text-sm text-secondary">{form.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join thousands of veterans who have streamlined their rental assistance applications.
          </p>
          {!user && (
            <Link
              href="/auth/signup"
              className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="font-serif text-lg font-bold mb-4 md:mb-0">
              Veterans Rent Assist
            </p>
            <div className="flex space-x-6 text-sm text-gray-400">
              <span>National Homeless Veteran Call Center: 877-424-3838</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
