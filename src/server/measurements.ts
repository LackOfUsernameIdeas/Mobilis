"use server";

import { saveUserMeasurements } from "@/server/saveFunctionts";
import { createClient } from "@/app/utils/supabase/server";

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
