import { NextRequest, NextResponse } from "next/server";

const INTERACTIONS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzkz3WDW6cyZAf0Zew1gNvMiH8bHIdN_P3QpI-YPFUMjLhKWHh3AtYPS3TnAC6F_QBf6Q/exec";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, feedback, interactionType } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    // Determine interaction type if not explicitly provided
    let type = interactionType;

    if (!type) {
      console.error("Interaction type is required");
    } else {
      // Validate based on interaction type
      if (type === "report" && (!feedback || feedback.trim().length < 5)) {
        return NextResponse.json(
          { error: "Report feedback too short" },
          { status: 400 },
        );
      }

      if (type === "report" && feedback.trim().length > 2000) {
        return NextResponse.json(
          { error: "Report feedback too long" },
          { status: 400 },
        );
      }

      if (
        type === "suggested_answer" &&
        (!answer || answer.trim().length < 10)
      ) {
        return NextResponse.json(
          { error: "Suggested answer too short" },
          { status: 400 },
        );
      }
    }

    const response = await fetch(INTERACTIONS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: question.toString().substring(0, 500),
        answer: answer ? answer.toString().substring(0, 1000) : "",
        feedback: feedback
          ? type === "report"
            ? feedback.trim()
            : feedback
          : "",
        timestamp: new Date().toISOString(),
        source: "askpalestine-web",
        interactionType: type,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `External service responded with status: ${response.status}`,
      );
    }

    return NextResponse.json({ success: true, interactionType: type });
  } catch (error) {
    console.error("Interactions API error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to record interaction" },
      { status: 500 },
    );
  }
}
