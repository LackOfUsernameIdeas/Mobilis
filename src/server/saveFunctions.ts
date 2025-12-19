import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

interface UserPreferences {
  user_id: string;
  category: string;
  mainGoal: string;
  experience: string;
  frequency: number;

  // Gym/Calisthenics specific (nullable for yoga)
  warmupCooldown?: string;
  muscleGroups?: string[];
  targetWeight?: string;
  targetWeightValue?: string;

  // Yoga specific (nullable for gym/calisthenics)
  yogaStyle?: string;
  focusAreas?: string[];
  warmupSavasana?: string;

  // Common fields
  healthIssues: string;
  specificExercises: string;
}

interface WorkoutDayRecommendation {
  day: string;
  generation_id: number;
  focus: string;
  warmup: {
    duration_minutes: number;
    exercises: string[];
  };
  workout?: WorkoutExercise[];
  cooldown: {
    duration_minutes: number;
    exercises: string[];
  };
}

interface WorkoutExercise {
  exercise_name: string;
  exercise_id: string;
  generation_id: number;
  day: string;
  sets: number;
  reps: string;
  muscle_activation?: MuscleActivation;
}

interface MuscleActivation {
  chest: boolean;
  front_delts: boolean;
  side_delts: boolean;
  rear_delts: boolean;
  biceps: boolean;
  triceps: boolean;
  forearms: boolean;
  traps: boolean;
  lats: boolean;
  lower_back: boolean;
  abs: boolean;
  obliques: boolean;
  quadriceps: boolean;
  hamstrings: boolean;
  glutes: boolean;
  calves: boolean;
  adductors: boolean;
}

interface WorkoutRecommendationsResponse {
  weekly_schedule: WorkoutDayRecommendation[];
  safety_considerations: string[];
}

export const saveUserPreferences = async (userId: string, category: string, answers: Record<string, any>) => {
  try {
    if (category !== "gym" && category !== "calisthenics" && category !== "yoga") {
      console.log(`Category ${category} does not require preference saving`);
      return { success: true, message: "Category does not require saving" };
    }

    const preferences: UserPreferences = {
      user_id: userId,
      category: category,
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
      preferences.targetWeightValue = answers.targetWeightValue || 0;
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

    return { success: true, data };
  } catch (error) {
    console.error("Error in saveUserPreferences:", error);
    throw error;
  }
};

export const saveWorkoutRecommendations = async (
  userId: string,
  category: string,
  recommendations: WorkoutRecommendationsResponse,
) => {
  try {
    const { weekly_schedule, safety_considerations } = recommendations;

    if (!weekly_schedule || weekly_schedule.length === 0) {
      throw new Error("No workout schedule provided");
    }

    // Step 1: Get the latest user_preferences id for this user and category
    const { data: preferencesData, error: preferencesError } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", userId)
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (preferencesError) {
      console.error("Error fetching user preferences:", preferencesError);
      throw new Error(`Failed to fetch preferences: ${preferencesError.message}`);
    }

    const preferencesId = preferencesData.id;
    console.log(`Using preferences ID: ${preferencesId}`);

    // Step 2: Create a new generation entry and get the ID
    const { data: generationData, error: generationError } = await supabase
      .from("workout_generations")
      .insert({
        user_id: userId,
        preferences_id: preferencesId,
        safety_considerations: safety_considerations || [],
      })
      .select()
      .single();

    if (generationError) {
      console.error("Error creating workout generation:", generationError);
      throw new Error(`Failed to create generation: ${generationError.message}`);
    }

    const generationId = generationData.id;
    console.log(`Created workout generation with ID: ${generationId}`);

    // Step 3: Save in workout_day_recommendations
    const dayRecommendations = weekly_schedule.map((rec) => ({
      generation_id: generationId,
      day: rec.day,
      focus: rec.focus,
      warmup_duration_minutes: rec.warmup.duration_minutes,
      warmup_exercises: rec.warmup.exercises,
      cooldown_duration_minutes: rec.cooldown.duration_minutes,
      cooldown_exercises: rec.cooldown.exercises,
    }));

    const { data: savedDays, error: daysError } = await supabase
      .from("workout_day_recommendations")
      .insert(dayRecommendations)
      .select();

    if (daysError) {
      console.error("Error saving workout day recommendations:", daysError);
      throw new Error(`Failed to save day recommendations: ${daysError.message}`);
    }

    console.log(`Saved ${savedDays?.length} workout day recommendations`);

    // Step 4: Collect all exercises and their muscle activations
    const allExercises: Array<WorkoutExercise & { day: string; exercise_id: string }> = [];
    weekly_schedule.forEach((rec) => {
      if (rec.workout && Array.isArray(rec.workout)) {
        rec.workout.forEach((exercise) => {
          allExercises.push({ ...exercise, day: rec.day });
        });
      }
    });

    if (allExercises.length === 0) {
      console.log("No exercises found in recommendations");
      return {
        success: true,
        generationId,
        data: { generation: generationData, days: savedDays, exercises: [], workoutExercises: [] },
      };
    }

    // Step 5: Save unique exercises to workout_exercises
    const uniqueExercises = Array.from(
      new Map(
        allExercises
          .filter((ex) => ex.muscle_activation)
          .map((ex) => [
            ex.exercise_id,
            {
              exercise_id: ex.exercise_id,
              muscle_activation: ex.muscle_activation,
              category,
            },
          ]),
      ).values(),
    );

    let savedWorkoutExercises = null;
    if (uniqueExercises.length > 0) {
      const { data: workoutExercisesData, error: workoutExercisesError } = await supabase
        .from("workout_exercises")
        .upsert(uniqueExercises, {
          onConflict: "exercise_id",
          ignoreDuplicates: false,
        })
        .select();

      if (workoutExercisesError) {
        console.error("Error saving workout exercises:", workoutExercisesError);
        throw new Error(`Failed to save workout exercises: ${workoutExercisesError.message}`);
      }

      savedWorkoutExercises = workoutExercisesData;
      console.log(`Saved/Updated ${workoutExercisesData?.length} workout exercises`);
    }

    // Step 6: Save workout_day_exercises
    const dayExercises = allExercises.map((ex) => ({
      generation_id: generationId,
      day: ex.day,
      exercise_id: ex.exercise_id,
      sets: ex.sets,
      reps: ex.reps,
    }));

    const { data: savedExercises, error: exercisesError } = await supabase
      .from("workout_day_exercises")
      .insert(dayExercises)
      .select();

    if (exercisesError) {
      console.error("Error saving workout day exercises:", exercisesError);
      throw new Error(`Failed to save day exercises: ${exercisesError.message}`);
    }

    console.log(`Saved ${savedExercises?.length} workout day exercises`);

    return {
      success: true,
      generationId,
      data: {
        generation: generationData,
        days: savedDays,
      },
    };
  } catch (error) {
    console.error("Error in saveWorkoutRecommendations:", error);
    throw error;
  }
};

export const saveUserMeasurements = async (
  userId: string,
  data: {
    height: number;
    weight: number;
    gender: "male" | "female";
    neck: number;
    waist: number;
    hip?: number;
  },
) => {
  const { data: result, error } = await supabase
    .from("user_measurements")
    .insert({
      user_id: userId,
      height: Math.round(data.height),
      weight: Math.round(data.weight),
      gender: data.gender,
      neck: Math.round(data.neck),
      waist: Math.round(data.waist),
      hip: data.hip ? Math.round(data.hip) : 0, // Default to 0 if not provided (for males)
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

export const saveUserMetrics = async (
  userId: string,
  measurementId: string,
  data: {
    bmi: string;
    health: string;
    healthy_bmi_range: string;
    bodyFat: number;
    bodyFatMass: number;
    leanBodyMass: number;
    goal: string;
    goalName: string;
    bmiCategory: string;
    bodyFatCategory: string;
    reasoning: string;
  },
) => {
  const { data: result, error } = await supabase
    .from("user_metrics")
    .insert({
      user_id: userId,
      measurement_id: measurementId,

      // BMI data
      bmi: parseFloat(data.bmi),
      health: data.health,
      healthy_bmi_range: data.healthy_bmi_range,

      // Body fat data
      bodyFat: data.bodyFat,
      bodyFatMass: data.bodyFatMass,
      leanBodyMass: data.leanBodyMass,
      bodyFatCategory: data.bodyFatCategory,

      // Goal data
      goal: data.goal,
      goalName: data.goalName,
      bmiCategory: data.bmiCategory,
      reasoning: data.reasoning,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving user metrics:", error);
    throw error;
  }

  return result;
};
