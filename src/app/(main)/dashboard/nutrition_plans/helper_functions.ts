import { getBrowserClient } from "@/lib/db/clients/browser";
import type { NutrientRecommendationParams, NutrientRecommendations } from "./types";

/**
 * Fetches YouTube video embed URL for a given query
 */
export const fetchYouTubeEmbed = async (query: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/get-recommendation-video?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.youTubeEmbedUrl || null;
  } catch (error) {
    console.error(`Error fetching YouTube video for ${query}:`, error);
    return null;
  }
};

/**
 * Fetches nutrient recommendations based on user parameters
 */
export const fetchNutrientRecommendations = async (
  params: NutrientRecommendationParams,
): Promise<NutrientRecommendations | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calculate-nutrients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return {
      calories: data.goal.calories || 0,
      protein: data.goal.macros.protein || 0,
      carbs: data.goal.macros.carbs || 0,
      fats: data.goal.macros.fats || 0,
    };
  } catch (error) {
    console.error("Error fetching nutrient recommendations:", error);
    return null;
  }
};

/**
 * Fetches user health data (metrics and measurements)
 */
export const fetchUserHealthData = async (userId: string) => {
  try {
    const [responseMetrics, responseMeasurements] = await Promise.all([
      fetch(`/api/user-metrics?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(`/api/user-measurements?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!responseMetrics.ok || !responseMeasurements.ok) {
      throw new Error("Failed to fetch metrics or measurements data");
    }

    const [metrics, measurements] = await Promise.all([responseMetrics.json(), responseMeasurements.json()]);

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
  } catch (error) {
    console.error("Error fetching health data:", error);
    throw error;
  }
};

/**
 * Validates numeric input based on pattern and max value
 */
export const validateNumericInput = (value: string, pattern: RegExp, max: number): boolean => {
  if (value === "" || pattern.test(value)) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= max) {
      return true;
    }
  }
  return false;
};

/**
 * Calculates weight difference from current weight
 */
export const calculateWeightDifference = (targetWeight: number, currentWeight: number): string => {
  const diff = targetWeight - currentWeight;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)} кг от текущото тегло`;
};

/**
 * Gets authenticated user from Supabase
 */
export const getAuthenticatedUser = async () => {
  const supabase = getBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Fetches nutrition plan recommendations from API
 */
export const fetchNutritionPlan = async (
  userId: string,
  category: string,
  answers: Record<string, any>,
  userStats: any,
) => {
  try {
    const response = await fetch("/api/get-model-response/nutrition-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        category,
        answers,
        userStats,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch nutrition plan");
    }

    const responseJson = await response.json();
    return JSON.parse(responseJson);
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    throw error;
  }
};

/**
 * Gets meal icon based on meal type
 */
export const getMealIconName = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "Activity";
  }
  return "Utensils";
};

/**
 * Gets meal badge background class based on meal type
 */
export const getMealBadgeBg = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "bg-primary";
  }
  return "bg-foreground";
};
