import { NextRequest, NextResponse } from "next/server";
import { saveUserProfile, getUserProfile, saveExtractedData } from "@/lib/redis";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, documents } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get existing profile
    const existingProfile = await getUserProfile(userId);

    // Update profile with document references
    await saveUserProfile(userId, {
      ...existingProfile,
      documents: {
        dd214: documents.dd214 || existingProfile?.documents?.dd214,
        vaBenefitsLetter: documents.vaBenefitsLetter || existingProfile?.documents?.vaBenefitsLetter,
        governmentId: documents.governmentId || existingProfile?.documents?.governmentId,
      },
    });

    // In a real implementation, this would:
    // 1. Upload files to cloud storage
    // 2. Run OCR on the documents
    // 3. Extract relevant data
    // 4. Store extracted data in Redis

    // Simulate extracted data
    const mockExtractedData: Record<string, Record<string, string>> = {
      dd214: {
        veteranName: (existingProfile?.firstName || "") + " " + (existingProfile?.lastName || ""),
        branch: existingProfile?.veteranStatus?.branch || "",
        dischargeDate: existingProfile?.veteranStatus?.serviceEnd || "",
        dischargeType: existingProfile?.veteranStatus?.dischargeType || "",
      },
    };

    if (documents.dd214) {
      await saveExtractedData(userId, "dd214", mockExtractedData.dd214);
    }

    return NextResponse.json({
      success: true,
      message: "Documents processed successfully",
      extracted: mockExtractedData,
    });
  } catch (error) {
    console.error("Error processing documents:", error);
    return NextResponse.json({ error: "Failed to process documents" }, { status: 500 });
  }
}
