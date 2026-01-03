import { getServiceClient } from "@/lib/db/clients/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = getServiceClient();

    // Fetch latest user metrics
    const { data, error } = await supabase
      .from("user_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = {
      bmiData: {
        bmi: data[0].bmi,
        health: data[0].health,
        healthy_bmi_range: data[0].healthy_bmi_range,
      },
      bodyFatData: {
        bodyFat: data[0].bodyFat,
        bodyFatMass: data[0].bodyFatMass,
        leanBodyMass: data[0].leanBodyMass,
      },
      goalData: {
        goal: data[0].goal,
        goalName: data[0].goalName,
        bmi: data[0].bmi,
        bmiCategory: data[0].bmiCategory,
        bodyFatPercentage: data[0].bodyFat,
        bodyFatCategory: data[0].bodyFatCategory,
        reasoning: data[0].reasoning,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
