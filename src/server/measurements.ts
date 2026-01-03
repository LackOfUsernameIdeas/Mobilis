"use server";

import { getServerClient } from "@/lib/db/clients/server";
import { saveUserMeasurements, saveUserMetrics } from "@/server/saveFunctions";

/**
 * Проверява дали има измервания за днес
 */
export async function checkTodayMeasurements() {
  const supabase = await getServerClient();

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

  // Получаване на днешната дата в ISO формат
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
    data: data,
  };
}

/**
 * Запазва измерванията и изчислява здравните метрики
 */
export async function saveMeasurementsAndCalculateMetrics(data: {
  height: number;
  weight: number;
  gender: "male" | "female";
  age: number;
  activityLevel: string;
  neck: number;
  waist: number;
  hip?: number;
}) {
  try {
    const supabase = await getServerClient();
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

    // Получаване на базовия URL за API извиквания
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Извикване на трите крайни точки паралелно
    const [bmiResponse, bodyFatResponse, goalResponse] = await Promise.all([
      fetch(`${baseUrl}/api/health/bmi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ height: data.height, weight: data.weight }),
      }),
      fetch(`${baseUrl}/api/health/body-fat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: data.height,
          gender: data.gender,
          weight: data.weight,
          neck: data.neck,
          waist: data.waist,
          hip: data.hip,
        }),
      }),
      fetch(`${baseUrl}/api/recommended-goal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          height: data.height,
          weight: data.weight,
          gender: data.gender,
          neck: data.neck,
          waist: data.waist,
          hip: data.hip,
        }),
      }),
    ]);

    // Проверка дали всички заявки са успешни
    if (!bmiResponse.ok || !bodyFatResponse.ok || !goalResponse.ok) {
      throw new Error("Failed to calculate health metrics");
    }

    // Парсване на отговорите
    const [bmiData, bodyFatData, goalData] = await Promise.all([
      bmiResponse.json(),
      bodyFatResponse.json(),
      goalResponse.json(),
    ]);

    // Изчисляване на хранителни вещества с данните за целта
    const nutrientsResponse = await fetch(`${baseUrl}/api/calculate-nutrients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        height: data.height,
        weight: data.weight,
        gender: data.gender,
        age: data.age,
        activityLevel: data.activityLevel,
        goal: goalData.goal,
      }),
    });

    if (!nutrientsResponse.ok) {
      throw new Error("Failed to calculate nutrients");
    }

    const nutrientsData = await nutrientsResponse.json();

    // Запазване на измерванията с изчислените метрики
    const measurementResult = await saveUserMeasurements(user.id, data);

    // След това запазване на метриките с препратка към измерването
    await saveUserMetrics(
      user.id,
      measurementResult.id, // Връзка към измерването
      {
        bmi: bmiData.bmi,
        health: bmiData.health,
        healthy_bmi_range: bmiData.healthy_bmi_range,
        bodyFat: bodyFatData.bodyFat,
        bodyFatMass: bodyFatData.bodyFatMass,
        leanBodyMass: bodyFatData.leanBodyMass,
        goal: goalData.goal,
        goalName: goalData.goalName,
        bmiCategory: goalData.bmiCategory,
        bodyFatCategory: goalData.bodyFatCategory,
        reasoning: goalData.reasoning,
        bmr: nutrientsData.bmr,
        tdee: nutrientsData.tdee,
        calories: nutrientsData.goal.calories,
        protein: nutrientsData.goal.macros.protein,
        fats: nutrientsData.goal.macros.fats,
        carbs: nutrientsData.goal.macros.carbs,
      },
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error saving measurements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save measurements",
    };
  }
}
