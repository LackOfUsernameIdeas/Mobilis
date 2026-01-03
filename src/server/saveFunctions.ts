import { getServiceClient } from "@/lib/db/clients/supabase";

const supabase = getServiceClient();

// Интерфейс за потребителските предпочитания
interface UserPreferences {
  user_id: string;
  category: string;
  mainGoal: string;
  experience: string;
  frequency: number;

  // Специфични полета за фитнес зала/калистеника (nullable за йога)
  warmupCooldown?: string;
  muscleGroups?: string[];
  targetWeight?: string;
  targetWeightValue?: string;

  // Специфични полета за йога (nullable за фитнес/калистеника)
  yogaStyle?: string;
  focusAreas?: string[];
  warmupSavasana?: string;

  // Общи полета
  healthIssues: string;
  specificExercises: string;
}

// Интерфейс за препоръка за тренировъчен ден
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

// Интерфейс за упражнение
interface WorkoutExercise {
  exercise_name: string;
  exercise_id: string;
  generation_id: number;
  day: string;
  sets: number;
  reps: string;
  muscle_activation?: MuscleActivation;
}

// Интерфейс за мускулна активация
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

// Интерфейс за отговор с тренировъчни препоръки
interface WorkoutRecommendationsResponse {
  weekly_schedule: WorkoutDayRecommendation[];
  safety_considerations: string[];
}

// Запазва потребителските предпочитания в базата данни
export const saveUserPreferences = async (userId: string, category: string, answers: Record<string, any>) => {
  try {
    // Проверява дали категорията изисква запазване на предпочитания
    if (category !== "gym" && category !== "calisthenics" && category !== "yoga" && category !== "nutrition") {
      console.log(`Category ${category} does not require preference saving`);
      return { success: true, message: "Category does not require saving" };
    }

    // Обработва хранителния режим отделно, тъй като използва различна таблица
    if (category === "nutrition") {
      const nutritionPreferences = {
        user_id: userId,
        mainGoal: answers.mainGoal || "",
        trainingTime: answers.trainingTime || "",
        targetWeight: answers.targetWeight || "no",
        targetWeightValue: answers.targetWeight === "yes" ? parseFloat(answers.targetWeightValue) || null : null,
        healthIssues: answers.healthIssues || "",
        cuisinePreference: Array.isArray(answers.cuisinePreference) ? answers.cuisinePreference : [],
        calories: parseFloat(answers.calories) || 0,
        protein: parseFloat(answers.protein) || 0,
        carbs: parseFloat(answers.carbs) || 0,
        fats: parseFloat(answers.fats) || 0,
      };

      const { data, error } = await supabase
        .from("nutrition_user_preferences")
        .insert(nutritionPreferences)
        .select()
        .single();

      if (error) {
        console.error("Database error saving nutrition preferences:", error);
        throw new Error(`Failed to save nutrition preferences: ${error.message}`);
      }

      return { success: true, data };
    }

    // Обработва категориите за тренировки (фитнес зала, калистеника, йога)
    const preferences: UserPreferences = {
      user_id: userId,
      category: category,
      mainGoal: answers.mainGoal || "",
      experience: answers.experience || "",
      frequency: parseInt(answers.frequency) || 0,
      healthIssues: answers.healthIssues || "",
      specificExercises: answers.specificExercises || "",
    };

    // Добавя специфични полета за фитнес зала/калистеника
    if (category === "gym" || category === "calisthenics") {
      preferences.warmupCooldown = answers.warmupCooldown || "";
      preferences.muscleGroups = Array.isArray(answers.muscleGroups) ? answers.muscleGroups : [];
      preferences.targetWeight = answers.targetWeight || "";
      preferences.targetWeightValue = answers.targetWeightValue || 0;
    }

    // Добавя специфични полета за йога
    if (category === "yoga") {
      preferences.yogaStyle = answers.yogaStyle || "";
      preferences.focusAreas = Array.isArray(answers.focusAreas) ? answers.focusAreas : [];
      preferences.warmupSavasana = answers.warmupSavasana || "";
    }

    const { data, error } = await supabase.from("workout_user_preferences").insert(preferences).select().single();

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

// Запазва тренировъчните препоръки в базата данни
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

    // Стъпка 1: Взима последния workout_user_preferences id за този потребител и категория
    const { data: preferencesData, error: preferencesError } = await supabase
      .from("workout_user_preferences")
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

    // Стъпка 2: Създава нов запис за генериране и взима ID-то
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

    // Стъпка 3: Запазва в workout_day_recommendations
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

    // Стъпка 4: Събира всички упражнения и техните мускулни активации
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

    // Стъпка 5: Запазва уникалните упражнения в workout_exercises
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

      console.log(`Saved/Updated ${workoutExercisesData?.length} workout exercises`);
    }

    // Стъпка 6: Запазва workout_day_exercises
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

// Интерфейс за хранително ядене
interface NutritionMeal {
  meal_id: string;
  name: string;
  meal_type: string;
  time: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  instructions: string[];
  prep_time: number;
  cooking_time: number;
}

// Интерфейс за дневен план
interface DayPlan {
  day: string;
  total_macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: NutritionMeal[];
}

// Интерфейс за отговор с хранителни препоръки
interface NutritionRecommendationsResponse {
  weekly_plan: DayPlan[];
  nutrition_tips: string[];
}

// Запазва хранителните препоръки в базата данни
export const saveNutritionRecommendations = async (
  userId: string,
  recommendations: NutritionRecommendationsResponse,
) => {
  try {
    const { weekly_plan, nutrition_tips } = recommendations;

    if (!weekly_plan || weekly_plan.length === 0) {
      throw new Error("No nutrition plan provided");
    }

    // Стъпка 1: Взима последния nutrition_user_preferences id за този потребител
    const { data: preferencesData, error: preferencesError } = await supabase
      .from("nutrition_user_preferences")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (preferencesError) {
      console.error("Error fetching nutrition preferences:", preferencesError);
      throw new Error(`Failed to fetch preferences: ${preferencesError.message}`);
    }

    const preferencesId = preferencesData.id;
    console.log(`Using nutrition preferences ID: ${preferencesId}`);

    // Стъпка 2: Създава нов запис за генериране
    const { data: generationData, error: generationError } = await supabase
      .from("nutrition_generations")
      .insert({
        user_id: userId,
        preferences_id: preferencesId,
        nutrition_tips: nutrition_tips || [],
      })
      .select()
      .single();

    if (generationError) {
      console.error("Error creating nutrition generation:", generationError);
      throw new Error(`Failed to create generation: ${generationError.message}`);
    }

    const generationId = generationData.id;
    console.log(`Created nutrition generation with ID: ${generationId}`);

    // Стъпка 3: Запазва дневните препоръки с общите макроси
    const dayRecommendations = weekly_plan.map((dayPlan) => ({
      generation_id: generationId,
      day: dayPlan.day,
      calories: dayPlan.total_macros.calories,
      protein: dayPlan.total_macros.protein,
      carbs: dayPlan.total_macros.carbs,
      fats: dayPlan.total_macros.fats,
    }));

    const { data: savedDays, error: daysError } = await supabase
      .from("nutrition_day_recommendations")
      .insert(dayRecommendations)
      .select();

    if (daysError) {
      console.error("Error saving nutrition day recommendations:", daysError);
      throw new Error(`Failed to save day recommendations: ${daysError.message}`);
    }

    console.log(`Saved ${savedDays?.length} nutrition day recommendations`);

    // Стъпка 4: Събира всички уникални ядения от всички дни
    const allMeals: Array<NutritionMeal & { day: string }> = [];
    weekly_plan.forEach((dayPlan) => {
      dayPlan.meals.forEach((meal) => {
        allMeals.push({ ...meal, day: dayPlan.day });
      });
    });

    if (allMeals.length === 0) {
      console.log("No meals found in recommendations");
      return {
        success: true,
        generationId,
        data: { generation: generationData, days: savedDays, meals: [], dayMeals: [] },
      };
    }

    // Стъпка 5: Запазва уникалните ядения в таблицата nutrition_meals
    const uniqueMeals = Array.from(
      new Map(
        allMeals.map((meal) => [
          meal.meal_id,
          {
            meal_id: meal.meal_id,
            description: meal.description,
            ingredients: meal.ingredients,
            calories: meal.macros.calories,
            protein: meal.macros.protein,
            carbs: meal.macros.carbs,
            fats: meal.macros.fats,
            instructions: meal.instructions,
            prep_time: meal.prep_time,
            cooking_time: meal.cooking_time,
          },
        ]),
      ).values(),
    );

    if (uniqueMeals.length > 0) {
      const { data: mealsData, error: mealsError } = await supabase
        .from("nutrition_meals")
        .upsert(uniqueMeals, {
          onConflict: "meal_id",
          ignoreDuplicates: false,
        })
        .select();

      if (mealsError) {
        console.error("Error saving nutrition meals:", mealsError);
        throw new Error(`Failed to save meals: ${mealsError.message}`);
      }

      console.log(`Saved/Updated ${mealsData?.length} nutrition meals`);
    }

    // Стъпка 6: Запазва nutrition_day_meals (свързва яденията с конкретните дни)
    const dayMeals = allMeals.map((meal) => ({
      generation_id: generationId,
      meal_id: meal.meal_id,
      name: meal.name,
      meal_type: meal.meal_type,
      day: meal.day,
      time: meal.time,
    }));

    const { data: savedDayMeals, error: dayMealsError } = await supabase
      .from("nutrition_day_meals")
      .insert(dayMeals)
      .select();

    if (dayMealsError) {
      console.error("Error saving nutrition day meals:", dayMealsError);
      throw new Error(`Failed to save day meals: ${dayMealsError.message}`);
    }

    console.log(`Saved ${savedDayMeals?.length} nutrition day meals`);

    return {
      success: true,
      generationId,
      data: {
        generation: generationData,
        days: savedDays,
      },
    };
  } catch (error) {
    console.error("Error in saveNutritionRecommendations:", error);
    throw error;
  }
};

// Запазва измерванията на потребителя в базата данни
export const saveUserMeasurements = async (
  userId: string,
  data: {
    height: number;
    weight: number;
    gender: "male" | "female";
    age: number;
    activityLevel: string;
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
      age: data.age,
      activity_level: data.activityLevel,
      gender: data.gender,
      neck: Math.round(data.neck),
      waist: Math.round(data.waist),
      hip: data.hip ? Math.round(data.hip) : 0, // По подразбиране 0, ако не е предоставено (за мъже)
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return result;
};

// Запазва метриките на потребителя в базата данни
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
    bmr: number;
    tdee: number;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  },
) => {
  const { data: result, error } = await supabase
    .from("user_metrics")
    .insert({
      user_id: userId,
      measurement_id: measurementId,

      // BMI данни
      bmi: parseFloat(data.bmi),
      health: data.health,
      healthy_bmi_range: data.healthy_bmi_range,

      // Данни за телесни мазнини
      bodyFat: data.bodyFat,
      bodyFatMass: data.bodyFatMass,
      leanBodyMass: data.leanBodyMass,
      bodyFatCategory: data.bodyFatCategory,

      // Данни за цел
      goal: data.goal,
      goalName: data.goalName,
      bmiCategory: data.bmiCategory,
      reasoning: data.reasoning,

      // Данни за хранителни вещества
      bmr: data.bmr,
      tdee: data.tdee,
      calories: data.calories,
      protein: data.protein,
      fats: data.fats,
      carbs: data.carbs,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving user metrics:", error);
    throw error;
  }

  return result;
};
