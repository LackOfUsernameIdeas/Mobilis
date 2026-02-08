import { NextResponse } from "next/server";
import { getMostRecommendedGoal } from "@/server/recommendedGoal";

export async function GET() {
  try {
    const result = await getMostRecommendedGoal();

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to get most recommended goal" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in most recommended goal endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
