import { NextRequest, NextResponse } from "next/server";
import { getAllUserForms, getFormProgress } from "@/lib/redis";
import { verifyUserOwnership, unauthorizedResponse, forbiddenResponse } from "@/lib/api-auth";
import { generateFilledPdf, getTemplate } from "@/lib/pdf-templates";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, formType, formId } = body as { userId?: string; formType?: string; formId?: string };

    if (!userId || !formType) {
      return NextResponse.json({ error: "User ID and form type are required" }, { status: 400 });
    }

    const authResult = await verifyUserOwnership(request, userId);
    if (!authResult.authenticated) {
      return authResult.error?.includes("permission")
        ? forbiddenResponse(authResult.error)
        : unauthorizedResponse(authResult.error);
    }

    const template = getTemplate(formType);
    if (!template) {
      return NextResponse.json({ error: `No PDF template available for ${formType}` }, { status: 400 });
    }

    let formData: Record<string, string> | null = null;

    if (formId) {
      const form = await getFormProgress(userId, formId);
      formData = form?.formData || null;
    }

    if (!formData) {
      const forms = await getAllUserForms(userId);
      const matching = forms
        .filter((f) => f.formType === formType)
        .sort((a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime());

      if (matching.length > 0) {
        formData = matching[0].formData;
      }
    }

    if (!formData) {
      return NextResponse.json({ error: "Form data not found for this user/form type" }, { status: 404 });
    }

    const pdfBytes = await generateFilledPdf(formType, formData);

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=\"${formType}-application.pdf\"`,
      },
    });
  } catch (error) {
    console.error("Error exporting filled PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
