import { getBrowserClient } from "@/lib/db/clients/browser";
import type { NutrientRecommendationParams, NutrientRecommendations } from "./types";

/**
 * Извлича URL за вграждане на YouTube видео по подадена заявка.
 *
 * @param query - Търсена заявка (напр. "рецепта за салата")
 * @returns URL за вграждане на намереното видео или `null` при грешка
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
 * Извлича препоръки за хранителни вещества въз основа на потребителски параметри.
 * Изпраща POST заявка към API-то за изчисляване на калории и макронутриенти.
 *
 * @param params - Потребителски параметри (тегло, ръст, цел и др.)
 * @returns Обект с калории, протеини, въглехидрати и мазнини или `null` при грешка
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
 * Валидира числов вход спрямо регулярен израз и максимално допустима стойност.
 * Позволява празен стринг (полето може да е незапълнено) или стойност, която
 * отговаря на шаблона и не надвишава зададения максимум.
 *
 * @param value - Въведената стойност като текст
 * @param pattern - Регулярен израз за допустим формат (напр. само цифри)
 * @param max - Максимално допустима числова стойност
 * @returns `true` ако входът е валиден, иначе `false`
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
 * Изчислява разликата между целевото и текущото тегло и я форматира като четим текст.
 * Положителните стойности се предхождат от знак „+".
 *
 * @param targetWeight - Желаното целево тегло в килограми
 * @param currentWeight - Текущото тегло на потребителя в килограми
 * @returns Форматиран текст, напр. `"+3.50 кг от текущото тегло"`
 */
export const calculateWeightDifference = (targetWeight: number, currentWeight: number): string => {
  const diff = targetWeight - currentWeight;
  const sign = diff > 0 ? "+" : "";
  return `${sign}${diff.toFixed(2)} кг от текущото тегло`;
};

/**
 * Извлича персонализиран хранителен план от AI модела въз основа на
 * отговорите от въпросника и здравните показатели на потребителя.
 * При неуспешен отговор от сървъра хвърля грешка.
 *
 * @param userId - Уникален идентификатор на потребителя
 * @param answers - Отговори от здравния въпросник
 * @param userStats - Здравни показатели (тегло, ръст, възраст и др.)
 * @returns Разпарсен обект с хранителния план
 * @throws Грешка ако заявката е неуспешна или отговорът е невалиден
 */
export const fetchNutritionPlan = async (userId: string, answers: Record<string, any>, userStats: any) => {
  try {
    const hasTargetWeight =
      answers.targetWeight === "yes" &&
      !!answers.targetWeightValue &&
      (userStats?.weight === undefined || Math.abs(parseFloat(answers.targetWeightValue) - userStats.weight) >= 0.5);

    const requests: [Promise<Response>, Promise<Response> | null] = [
      fetch("/api/get-model-response/nutrition-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, answers, userStats }),
      }),
      hasTargetWeight
        ? fetch("/api/get-model-response/weight-prognosis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, answers, userStats }),
          })
        : null,
    ];

    const [nutritionResponse, prognosisResponse] = await Promise.all(requests);

    if (!nutritionResponse.ok) throw new Error("Failed to fetch nutrition plan");
    if (prognosisResponse && !prognosisResponse.ok) throw new Error("Failed to fetch weight prognosis");

    console.log("Fetching Nutrition Plans for user:", userId);

    const nutritionJson = await nutritionResponse.json();
    const plan = JSON.parse(nutritionJson);

    let prognosis = null;
    if (prognosisResponse) {
      const prognosisJson = await prognosisResponse.json();
      prognosis = JSON.parse(prognosisJson);
    }

    return { ...plan, prognosis };
  } catch (error) {
    console.error("Error fetching nutrition plan:", error);
    throw error;
  }
};

/**
 * Връща името на иконата за даден тип хранене.
 * Предтренировъчните и следтренировъчните закуски получават икона „Activity",
 * всички останали типове — „Utensils".
 *
 * @param mealType - Тип на храненето (напр. `"pre_workout_snack"`, `"breakfast"`)
 * @returns Името на Lucide иконата като стринг
 */
export const getMealIconName = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "Activity";
  }
  return "Utensils";
};

/**
 * Връща Tailwind CSS клас за фон на значката към даден тип хранене.
 * Тренировъчните закуски се оцветяват с основния цвят на приложението,
 * останалите типове — с цвета на преден план.
 *
 * @param mealType - Тип на храненето (напр. `"post_workout_snack"`, `"dinner"`)
 * @returns Tailwind клас за фон — `"bg-primary"` или `"bg-foreground"`
 */
export const getMealBadgeBg = (mealType: string): string => {
  if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
    return "bg-primary";
  }
  return "bg-foreground";
};
