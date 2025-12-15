import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface UserPreferences {
  user_id: string;
  mainGoal: string;
  experience: string;
  frequency: number;

  // Gym/Calisthenics specific (nullable for yoga)
  warmupCooldown?: string;
  muscleGroups?: string[];
  targetWeight?: string;
  targetWeightValue?: number;

  // Yoga specific (nullable for gym/calisthenics)
  yogaStyle?: string;
  focusAreas?: string[];
  warmupSavasana?: string;

  // Common fields
  healthIssues: string;
  specificExercises: string;
}

export const saveUserPreferences = async (userId: string, category: string, answers: Record<string, any>) => {
  try {
    if (category !== "gym" && category !== "calisthenics" && category !== "yoga") {
      console.log(`Category ${category} does not require preference saving`);
      return { success: true, message: "Category does not require saving" };
    }

    const preferences: UserPreferences = {
      user_id: userId,
      mainGoal: answers.mainGoal || "",
      experience: answers.experience || "",
      frequency: parseInt(answers.frequency) || 0,
      healthIssues: answers.healthIssues || "",
      specificExercises: answers.specificExercises || "",
    };

    // Add gym/calisthenics specific fields
    if (category === "gym" || category === "calisthenics") {
      preferences.warmupCooldown = answers.warmupCooldown || "";
      preferences.muscleGroups = Array.isArray(answers.muscleGroups) ? answers.muscleGroups : [];
      preferences.targetWeight = answers.targetWeight || "";
      preferences.targetWeightValue = parseInt(answers.targetWeightValue) || 0;
    }

    // Add yoga specific fields
    if (category === "yoga") {
      preferences.yogaStyle = answers.yogaStyle || "";
      preferences.focusAreas = Array.isArray(answers.focusAreas) ? answers.focusAreas : [];
      preferences.warmupSavasana = answers.warmupSavasana || "";
    }

    const { data, error } = await supabase.from("user_preferences").insert(preferences).select().single();

    if (error) {
      console.error("Database error saving preferences:", error);
      throw new Error(`Failed to save preferences: ${error.message}`);
    }

    console.log("User preferences saved successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Error in saveUserPreferences:", error);
    throw error;
  }
};
