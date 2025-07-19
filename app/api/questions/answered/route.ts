import { NextRequest, NextResponse } from "next/server";
import {
  getQuestionsWithAnswersPaginated,
  getQuestionsWithMostAnswers,
} from "../../../../lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sortBy = searchParams.get("sortBy") || "paginated";

    let result;
    if (sortBy === "most-answers") {
      result = await getQuestionsWithMostAnswers(limit);
    } else {
      result = await getQuestionsWithAnswersPaginated(page, limit);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching answered questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch answered questions" },
      { status: 500 },
    );
  }
}
