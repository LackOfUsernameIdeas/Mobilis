import { getServerClient } from "@/lib/db/clients/server";
import { calculateBMI, calculateBodyFat } from "./health";

/**
 * Типове цели за фитнес
 */
export type FitnessGoal =
  | "cut"
  | "aggressive_cut"
  | "lean_bulk"
  | "dirty_bulk"
  | "recomposition"
  | "maintenance"
  | "aesthetic"
  | "strength";

export type BodyFatCategory = "critical" | "essential" | "athletes" | "fitness" | "average" | "obese";
export type BMICategory =
  | "severe_thin"
  | "moderate_thin"
  | "mild_thin"
  | "normal"
  | "overweight"
  | "obese_1"
  | "obese_2"
  | "obese_3";

/**
 * Интерфейс за препоръка на цел
 */
export interface GoalRecommendation {
  goal: FitnessGoal;
  goalName: string;
  bmi: number;
  bmiCategory: BMICategory;
  bodyFatPercentage: number;
  bodyFatCategory: BodyFatCategory;
  reasoning: string;
}

/**
 * Категории на телесни мазнини
 */
const BODY_FAT_CATEGORIES = {
  male: {
    essential: { min: 2, max: 5 },
    athletes: { min: 6, max: 13 },
    fitness: { min: 14, max: 17 },
    average: { min: 18, max: 24 },
    obese: { min: 25, max: Infinity },
  },
  female: {
    essential: { min: 10, max: 13 },
    athletes: { min: 14, max: 20 },
    fitness: { min: 21, max: 24 },
    average: { min: 25, max: 31 },
    obese: { min: 32, max: Infinity },
  },
};

function getBodyFatCategory(bodyFat: number, gender: "male" | "female"): BodyFatCategory {
  const cats = BODY_FAT_CATEGORIES[gender];

  // Под минималната съществена мазнина (2% за мъже, 10% за жени)
  const minEssential = gender === "male" ? 2 : 10;
  if (bodyFat < minEssential) return "critical";

  // Проверка на всяка категория
  for (const [category, range] of Object.entries(cats)) {
    if (bodyFat >= range.min && bodyFat <= range.max) {
      return category as BodyFatCategory;
    }
  }

  throw new Error(`Uncategorized body fat: ${bodyFat}% for ${gender}`);
}

function getBMICategory(bmi: number): BMICategory {
  if (bmi < 16) return "severe_thin";
  if (bmi < 17) return "moderate_thin";
  if (bmi < 18.5) return "mild_thin";
  if (bmi < 25) return "normal";
  if (bmi < 30) return "overweight";
  if (bmi < 35) return "obese_1";
  if (bmi < 40) return "obese_2";
  return "obese_3";
}

/**
 * Определя препоръчана цел въз основа на BMI и телесни мазнини
 */
function recommendGoal(bmi: number, bodyFat: number, gender: "male" | "female"): GoalRecommendation {
  const bmiCat = getBMICategory(bmi);
  const bfCat = getBodyFatCategory(bodyFat, gender);

  // Критични здравословни състояния
  if (bmiCat === "severe_thin" || bmiCat === "moderate_thin") {
    return {
      goal: "dirty_bulk",
      goalName: "Бързо качване (Dirty Bulk)",
      bmi,
      bmiCategory: bmiCat,
      bodyFatPercentage: bodyFat,
      bodyFatCategory: bfCat,
      reasoning: "Критично ниско тегло. Препоръчва се качване поради здравословен риск.",
    };
  }

  // Критични телесни мазнини
  if (bfCat === "critical") {
    return {
      goal: "dirty_bulk",
      goalName: "Бързо качване (Dirty Bulk)",
      bmi,
      bmiCategory: bmiCat,
      bodyFatPercentage: bodyFat,
      bodyFatCategory: bfCat,
      reasoning: "Опасно ниско ниво на телесни мазнини. Препоръчва се качване на тегло и телесни мазнини.",
    };
  }

  // Агресивно сваляне за критично затлъстяване
  if (bmiCat === "obese_3" || bmiCat === "obese_2") {
    return {
      goal: "aggressive_cut",
      goalName: "Агресивно изгаряне (Aggressive Cut)",
      bmi,
      bmiCategory: bmiCat,
      bodyFatPercentage: bodyFat,
      bodyFatCategory: bfCat,
      reasoning:
        "Сериозно затлъстяване с високо здравословен риск. Препоръчва се агресивно сваляне на тегло с по-голям калориен дефицит за бързо намаляване на телесните мазнини.",
    };
  }

  // Обикновено сваляне за затлъстяване клас 1
  if (bmiCat === "obese_1") {
    return {
      goal: "cut",
      goalName: "Изгаряне на мазнини (Cut)",
      bmi,
      bmiCategory: bmiCat,
      bodyFatPercentage: bodyFat,
      bodyFatCategory: bfCat,
      reasoning: "Затлъстяване клас I. Препоръчва се сваляне на тегло и намаляване на телесните мазнини.",
    };
  }

  // Комбинации BMI + body fat
  switch (bmiCat) {
    case "mild_thin":
      return {
        goal: "lean_bulk",
        goalName: "Чисто качване (Lean Bulk)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Поднормено тегло. Препоръчва се покачване на мускулна маса и увеличаване на тегло.",
      };

    case "normal":
      if (bfCat === "obese") {
        return {
          goal: "recomposition",
          goalName: "Рекомпозиция (Recomposition)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning:
            "Стойността на BMI е нормална, но нивото на телесни мазнини е високо. Препоръчва се едновременното покачване на мускулна маса и намаляването на нивото на телесни мазнини.",
        };
      }
      if (bfCat === "average") {
        return {
          goal: "recomposition",
          goalName: "Рекомпозиция (Recomposition)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning:
            "Нормално ниво на телесни мазнини. Препоръчва се едновременното покачване на мускулна маса и намаляването на нивото на телесни мазнини.",
        };
      }
      if (bfCat === "fitness" || bfCat === "athletes") {
        return {
          goal: "maintenance",
          goalName: "Поддържане (Maintenance)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning: "Нормално ниво на телесни мазнини. Препоръчва се поддържане на текущото състояние.",
        };
      }
      break;

    case "overweight":
      if (bfCat === "fitness" || bfCat === "athletes") {
        return {
          goal: "maintenance",
          goalName: "Поддържане (Maintenance)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning:
            "Стойността на BMI е висока, но нивото на телесни мазнини е ниско. Препоръчва се поддържане на текущото състояние.",
        };
      }
      if (bfCat === "average") {
        return {
          goal: "recomposition",
          goalName: "Рекомпозиция (Recomposition)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning:
            "Наднормено тегло с умерено ниво на телесни мазнини. Препоръчва се покачване на мускулна маса и леко намаляване на телесните мазнини.",
        };
      }
      if (bfCat === "obese") {
        return {
          goal: "cut",
          goalName: "Изгаряне на мазнини (Cut)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning:
            "Наднормено тегло с високо ниво на телесни мазнини. Препоръчва се сваляне на тегло и намаляване на телесните мазнини.",
        };
      }
      break;
  }

  // Default
  return {
    goal: "recomposition",
    goalName: "Рекомпозиция (Recomposition)",
    bmi,
    bmiCategory: bmiCat,
    bodyFatPercentage: bodyFat,
    bodyFatCategory: bfCat,
    reasoning: "Препоръчва се едновременното покачване на мускулна маса и намаляването на нивото на телесни мазнини.",
  };
}

/**
 * Изчислява всички метрики и препоръчва цел
 */
export function getRecommendedGoal(
  height: number,
  weight: number,
  gender: "male" | "female",
  neck: number,
  waist: number,
  hip?: number,
): GoalRecommendation {
  const bmiResult = calculateBMI(height, weight);
  const bodyFatResult = calculateBodyFat(height, gender, weight, neck, waist, hip);

  const bmi = parseFloat(bmiResult.bmi);
  const bodyFat = bodyFatResult.bodyFat;

  return recommendGoal(bmi, bodyFat, gender);
}

export interface MostRecommendedGoal {
  goal: string;
  goalName: string;
  count: number;
}

/**
 * Извлича най-често препоръчваната цел от user_metrics
 */
export async function getMostRecommendedGoal() {
  const supabase = await getServerClient();

  try {
    // Вземане на всички цели от user_metrics
    const { data: userMetrics, error } = await supabase.from("user_metrics").select("goal, goalName");

    if (error) {
      console.error("Error fetching user metrics:", error);
      throw error;
    }

    if (!userMetrics || userMetrics.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    // Броене на всяка цел
    const goalCounts = userMetrics.reduce(
      (acc, metric) => {
        const key = `${metric.goal}|${metric.goalName}`; // Комбинираме goal и goalName
        if (!acc[key]) {
          acc[key] = {
            goal: metric.goal,
            goalName: metric.goalName,
            count: 0,
          };
        }
        acc[key].count++;
        return acc;
      },
      {} as Record<string, MostRecommendedGoal>,
    );

    // Намиране на най-често срещаната цел
    const mostRecommended = Object.values(goalCounts).reduce((max, current) => {
      return current.count > max.count ? current : max;
    });

    return {
      success: true,
      data: mostRecommended,
    };
  } catch (error) {
    console.error("Error getting most recommended goal:", error);
    return {
      success: false,
      error: "Failed to get most recommended goal",
    };
  }
}
