import { getAllGems, getTotalCounts } from "../../../lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [allGems, counts] = await Promise.all([
      getAllGems(),
      getTotalCounts(),
    ]);

    // Group gems by type
    const gemsByType = allGems.reduce(
      (acc, gem) => {
        if (!acc[gem.type]) {
          acc[gem.type] = [];
        }
        acc[gem.type].push(gem);
        return acc;
      },
      {} as Record<string, typeof allGems>,
    );

    return NextResponse.json({
      allGems,
      gemsByType,
      counts,
    });
  } catch (error) {
    console.error("Error fetching gems:", error);
    return NextResponse.json(
      { error: "Failed to fetch gems" },
      { status: 500 },
    );
  }
}
