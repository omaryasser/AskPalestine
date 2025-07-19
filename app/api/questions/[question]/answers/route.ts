import { NextRequest, NextResponse } from "next/server";
import { getAnswersForQuestion } from "../../../../../lib/database";

interface RouteParams {
  params: Promise<{ question: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { question } = await params;
    const questionId = decodeURIComponent(question);
    const answers = await getAnswersForQuestion(questionId);

    return NextResponse.json(answers);
  } catch (error) {
    console.error("Answers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
