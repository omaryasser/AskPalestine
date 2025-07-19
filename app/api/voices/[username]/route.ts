import { NextRequest, NextResponse } from "next/server";
import { getProPalestinian } from "../../../../lib/database";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { username } = await params;
    const decodedUsername = decodeURIComponent(username);
    const person = await getProPalestinian(decodedUsername);

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 });
    }

    return NextResponse.json(person);
  } catch (error) {
    console.error("Pro-Palestinian API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
