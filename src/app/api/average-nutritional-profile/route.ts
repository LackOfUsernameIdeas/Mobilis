import { NextResponse } from "next/server";
import { getAverageNutritionalProfile } from "@/server/nutritionalProfile";

export async function GET() {
  try {
    const result = await getAverageNutritionalProfile();

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to get average nutritional profile" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in average nutritional profile endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
