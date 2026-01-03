import { NutrientRecommendationParams } from "@/app/(main)/dashboard/nutrition_plans/types";

export async function fetchUserHealthData(userId: string) {
  const [metricsRes, measurementsRes] = await Promise.all([
    fetch(`/api/user-metrics?userId=${userId}`),
    fetch(`/api/user-measurements?userId=${userId}`),
  ]);

  if (!metricsRes.ok || !measurementsRes.ok) {
    throw new Error("Failed to fetch user health data");
  }

  const [metrics, measurements] = await Promise.all([metricsRes.json(), measurementsRes.json()]);

  return {
    gender: measurements.gender,
    height: measurements.height,
    weight: measurements.weight,
    age: measurements.age,
    goal: metrics.goalData.goal,
    activityLevel: measurements.activity_level,
    bmi: metrics.bmiData.bmi,
    bodyFat: metrics.bodyFatData.bodyFat,
    bodyFatMass: metrics.bodyFatData.bodyFatMass,
    leanBodyMass: metrics.bodyFatData.leanBodyMass,
  };
}

export async function fetchNutrientRecommendations(params: NutrientRecommendationParams) {
  const response = await fetch(`/api/calculate-nutrients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) throw new Error("Failed to fetch nutrients");

  const data = await response.json();
  return {
    calories: data.goal.calories || 0,
    protein: data.goal.macros.protein || 0,
    carbs: data.goal.macros.carbs || 0,
    fats: data.goal.macros.fats || 0,
  };
}
