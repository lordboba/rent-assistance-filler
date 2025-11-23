"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import ProgressSteps from "@/components/ProgressSteps";

export default function Dashboard() {
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

  const steps = [
    { id: 1, name: "Profile", status: "current" as const },
    { id: 2, name: "Documents", status: "upcoming" as const },
    { id: 3, name: "Forms", status: "upcoming" as const },
    { id: 4, name: "Review", status: "upcoming" as const },
  ];

  const quickActions = [
    {
      title: "Complete Profile",
      description: "Add your personal information and veteran details",
      href: "/profile",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Upload Documents",
      description: "Upload DD-214, VA benefits letter, and ID",
      href: "/documents",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Fill Out Forms",
      description: "Select and complete rental assistance forms",
      href: "/forms",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
          </h1>
          <p className="text-secondary mt-2">
            Complete the steps below to fill out your rental assistance forms.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="card mb-8">
          <h2 className="font-serif text-xl font-semibold mb-6 text-center">Your Progress</h2>
          <ProgressSteps steps={steps} />
        </div>

        {/* Quick Actions */}
        <h2 className="font-serif text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{action.title}</h3>
                  <p className="text-sm text-secondary mt-1">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Resources */}
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="font-serif text-xl font-semibold mb-4">Need Help?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-foreground">National Homeless Veteran Call Center</h3>
              <p className="text-primary font-semibold text-lg">877-424-3838</p>
              <p className="text-sm text-secondary">Available 24/7</p>
            </div>
            <div>
              <h3 className="font-medium text-foreground">VA Benefits Hotline</h3>
              <p className="text-primary font-semibold text-lg">800-827-1000</p>
              <p className="text-sm text-secondary">Mon-Fri 8am-9pm ET</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
