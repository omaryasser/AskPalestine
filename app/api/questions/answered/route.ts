import { NextRequest, NextResponse } from "next/server";
import { getQuestionsWithAnswersPaginated } from "../../../../lib/database";
import { initializeOnServerStart } from "../../../../lib/server-startup";

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized on first API call
    await initializeOnServerStart();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const result = getQuestionsWithAnswersPaginated(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching answered questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch answered questions" },
      { status: 500 },
    );
  }
}
