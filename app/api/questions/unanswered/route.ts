import { NextRequest, NextResponse } from "next/server";
import {
  getQuestionsWithoutAnswersPaginated,
  getUnansweredQuestions,
} from "../../../../lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const simple = searchParams.get("simple") === "true";

    let result;
    if (simple) {
      result = await getUnansweredQuestions(limit);
    } else {
      result = await getQuestionsWithoutAnswersPaginated(page, limit);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching unanswered questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch unanswered questions" },
      { status: 500 },
    );
  }
}
