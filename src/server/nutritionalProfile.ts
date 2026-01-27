import { getServerClient } from "@/lib/db/clients/server";

export interface AverageNutritionalProfile {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

/**
 * Изчислява средните стойности на хранителния профил от всички записи в двете таблици
 */
export async function getAverageNutritionalProfile() {
  const supabase = await getServerClient();

  try {
    // Вземане на данни от nutrition_user_preferences
    const { data: nutritionPrefs, error: nutritionError } = await supabase
      .from("nutrition_user_preferences")
      .select("calories, protein, fats, carbs");

    if (nutritionError) {
      console.error("Error fetching nutrition preferences:", nutritionError);
      throw nutritionError;
    }

    // Вземане на данни от user_metrics
    const { data: userMetrics, error: metricsError } = await supabase
      .from("user_metrics")
      .select("calories, protein, fats, carbs");

    if (metricsError) {
      console.error("Error fetching user metrics:", metricsError);
      throw metricsError;
    }

    // Комбиниране на всички записи
    const allRecords = [...(nutritionPrefs || []), ...(userMetrics || [])];

    if (allRecords.length === 0) {
      return {
        success: true,
        data: {
          calories: 0,
          protein: 0,
          fats: 0,
          carbs: 0,
        },
      };
    }

    // Изчисляване на сумите
    const totals = allRecords.reduce(
      (acc, record) => {
        acc.calories += record.calories || 0;
        acc.protein += record.protein || 0;
        acc.fats += record.fats || 0;
        acc.carbs += record.carbs || 0;
        return acc;
      },
      { calories: 0, protein: 0, fats: 0, carbs: 0 },
    );

    // Изчисляване на средните стойности
    const totalRecords = allRecords.length;
    const result: AverageNutritionalProfile = {
      calories: Math.round(totals.calories / totalRecords),
      protein: Math.round(totals.protein / totalRecords),
      fats: Math.round(totals.fats / totalRecords),
      carbs: Math.round(totals.carbs / totalRecords),
    };

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error calculating average nutritional profile:", error);
    return {
      success: false,
      error: "Failed to calculate average nutritional profile",
    };
  }
}
