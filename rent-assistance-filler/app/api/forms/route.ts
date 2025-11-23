import { NextRequest, NextResponse } from "next/server";
import { saveFormProgress, getFormProgress, getAllUserForms } from "@/lib/redis";
import { v4 as uuidv4 } from "uuid";
import { verifyUserOwnership, unauthorizedResponse, forbiddenResponse } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, formType, formData, status } = body;

    if (!userId || !formType) {
      return NextResponse.json({ error: "User ID and form type are required" }, { status: 400 });
    }

    // Verify the authenticated user owns this form
    const authResult = await verifyUserOwnership(request, userId);
    if (!authResult.authenticated) {
      return authResult.error?.includes("permission")
        ? forbiddenResponse(authResult.error)
        : unauthorizedResponse(authResult.error);
    }

    const formId = `${formType}-${uuidv4().slice(0, 8)}`;

    await saveFormProgress(userId, formId, {
      id: formId,
      userId,
      formType,
      formData,
      status: status || "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      formId,
      message: `Form ${status === "completed" ? "completed" : "saved as draft"}`,
    });
  } catch (error) {
    console.error("Error saving form:", error);
    return NextResponse.json({ error: "Failed to save form" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const formId = searchParams.get("formId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Verify the authenticated user owns these forms
    const authResult = await verifyUserOwnership(request, userId);
    if (!authResult.authenticated) {
      return authResult.error?.includes("permission")
        ? forbiddenResponse(authResult.error)
        : unauthorizedResponse(authResult.error);
    }

    if (formId) {
      const form = await getFormProgress(userId, formId);
      return NextResponse.json({ form });
    }

    const forms = await getAllUserForms(userId);
    return NextResponse.json({ forms });
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}
