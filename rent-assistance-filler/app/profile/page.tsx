"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { fetchWithAuth } from "@/lib/api-client";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  ssn: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  branch: string;
  serviceStart: string;
  serviceEnd: string;
  dischargeType: string;
}

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    branch: "",
    serviceStart: "",
    serviceEnd: "",
    dischargeType: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
      return;
    }

    if (user) {
      loadProfile();
    }
  }, [user, loading, router]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const response = await fetchWithAuth(`/api/profile?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfile({
            firstName: data.profile.firstName || "",
            lastName: data.profile.lastName || "",
            phone: data.profile.phone || "",
            dateOfBirth: data.profile.dateOfBirth || "",
            ssn: data.profile.ssn || "",
            street: data.profile.address?.street || "",
            city: data.profile.address?.city || "",
            state: data.profile.address?.state || "",
            zipCode: data.profile.address?.zipCode || "",
            branch: data.profile.veteranStatus?.branch || "",
            serviceStart: data.profile.veteranStatus?.serviceStart || "",
            serviceEnd: data.profile.veteranStatus?.serviceEnd || "",
            dischargeType: data.profile.veteranStatus?.dischargeType || "",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetchWithAuth("/api/profile", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.uid,
          ...profile,
        }),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push("/documents");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Your Profile</h1>
          <p className="text-secondary mt-2">
            Fill in your information below. This will be used to auto-fill your forms.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="card">
            <h2 className="font-serif text-xl font-semibold mb-6">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="(555) 555-5555"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Social Security Number
                </label>
                <input
                  type="text"
                  name="ssn"
                  value={profile.ssn}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="XXX-XX-XXXX"
                />
                <p className="text-xs text-secondary mt-1">
                  Your SSN is encrypted using AES-256-GCM before storage. It will only be used for form filling.
                </p>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="card">
            <h2 className="font-serif text-xl font-semibold mb-6">Current Address</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  name="street"
                  value={profile.street}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State
                </label>
                <select
                  name="state"
                  value={profile.state}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={profile.zipCode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>

          {/* Military Service */}
          <div className="card">
            <h2 className="font-serif text-xl font-semibold mb-6">Military Service</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Branch of Service *
                </label>
                <select
                  name="branch"
                  value={profile.branch}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Branch</option>
                  <option value="Army">Army</option>
                  <option value="Navy">Navy</option>
                  <option value="Air Force">Air Force</option>
                  <option value="Marines">Marines</option>
                  <option value="Coast Guard">Coast Guard</option>
                  <option value="Space Force">Space Force</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Discharge Type *
                </label>
                <select
                  name="dischargeType"
                  value={profile.dischargeType}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Discharge Type</option>
                  <option value="Honorable">Honorable</option>
                  <option value="General">General (Under Honorable Conditions)</option>
                  <option value="Other Than Honorable">Other Than Honorable</option>
                  <option value="Bad Conduct">Bad Conduct</option>
                  <option value="Dishonorable">Dishonorable</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service Start Date
                </label>
                <input
                  type="date"
                  name="serviceStart"
                  value={profile.serviceStart}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Service End Date
                </label>
                <input
                  type="date"
                  name="serviceEnd"
                  value={profile.serviceEnd}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Saving..." : saved ? "Saved! Redirecting..." : "Save & Continue"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
