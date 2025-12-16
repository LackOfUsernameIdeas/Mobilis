"use server";

import { saveUserMeasurements } from "@/server/saveFunctionts";
import { createClient } from "@/app/utils/supabase/server";

export async function checkTodayMeasurements() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      hasTodayMeasurement: false,
    };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("user_measurements")
    .select("id, created_at")
    .eq("user_id", user.id)
    .gte("created_at", today)
    .limit(1);

  if (error) {
    console.error("Error checking measurements:", error);
    throw error;
  }

  return {
    success: true,
    hasTodayMeasurement: data.length > 0,
  };
}

export async function saveMeasurementsAction(data: {
  height: number;
  weight: number;
  gender: "male" | "female";
  neck: number;
  waist: number;
  hip?: number;
}) {
  try {
    // Get the current user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("User not authenticated:", authError);
      return {
        success: false,
        error: "You must be logged in to save measurements",
      };
    }

    const result = await saveUserMeasurements(user.id, data);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error saving measurements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save measurements",
    };
  }
}
