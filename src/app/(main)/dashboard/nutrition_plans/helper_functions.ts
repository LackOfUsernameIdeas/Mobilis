import { getBrowserClient } from "@/lib/db/clients/browser";
import type { NutrientRecommendationParams, NutrientRecommendations } from "./types";

/**
 * Извлича URL за вграждане на YouTube видео за дадена заявка
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
 * Извлича препоръки за хранителни вещества въз основа на потребителски параметри
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
 * Валидира числов вход въз основа на шаблон и максимална стойност
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
 * Изчислява разликата в теглото от текущото тегло
 */
export const calculateWeightDifference = (targetWeight: number, currentWeight: number): string => {
  const diff = targetWeight - currentWeight;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)} кг от текущото тегло`;
};

/**
 * Извлича препоръки за хранителен план от API
 */
export const fetchNutritionPlan = async (userId: string, answers: Record<string, any>, userStats: any) => {
  try {
    const response = await fetch("/api/get-model-response/nutrition-plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
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
 * Получава икона на ястие въз основа на типа ястие
 */
export const getMealIconName = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "Activity";
  }
  return "Utensils";
};

/**
 * Получава класа за фон на значката на ястието въз основа на типа ястие
 */
export const getMealBadgeBg = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "bg-primary";
  }
  return "bg-foreground";
};
