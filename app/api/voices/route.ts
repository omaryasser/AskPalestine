import { NextResponse } from "next/server";
import { getAllProPalestinians } from "../../../lib/database";

export async function GET() {
  try {
    const proPalestinians = getAllProPalestinians();
    return NextResponse.json({ proPalestinians });
  } catch (error) {
    console.error("Voices API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
