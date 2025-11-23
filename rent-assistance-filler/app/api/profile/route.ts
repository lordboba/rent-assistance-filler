import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...profileData } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await saveUserProfile(userId, {
      id: userId,
      email: profileData.email || "",
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      dateOfBirth: profileData.dateOfBirth,
      ssn: profileData.ssn,
      address: {
        street: profileData.street,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
      },
      veteranStatus: {
        branch: profileData.branch,
        serviceStart: profileData.serviceStart,
        serviceEnd: profileData.serviceEnd,
        dischargeType: profileData.dischargeType,
      },
      documents: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving profile:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // In a real implementation, this would fetch from Redis
    // For now, return empty profile
    return NextResponse.json({ profile: null });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
