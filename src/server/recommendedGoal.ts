import { calculateBMI, calculateBodyFat } from "./health";

/**
 * Типове цели за фитнес
 */
export type FitnessGoal =
  | "cut"
  | "lean_bulk"
  | "dirty_bulk"
  | "recomposition"
  | "maintenance"
  | "aesthetic"
  | "strength";

export type BodyFatCategory = "critical" | "athletes" | "fitness" | "acceptable" | "obese";
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
    essential: 5,
    athletes: 13,
    fitness: 17,
    acceptable: 24,
    obese: 25,
  },
  female: {
    essential: 11,
    athletes: 19,
    fitness: 24,
    acceptable: 29,
    obese: 30,
  },
};

function getBodyFatCategory(bodyFat: number, gender: "male" | "female"): BodyFatCategory {
  const cats = BODY_FAT_CATEGORIES[gender];
  if (bodyFat < cats.essential) return "critical";
  if (bodyFat <= cats.athletes) return "athletes";
  if (bodyFat <= cats.fitness) return "fitness";
  if (bodyFat <= cats.acceptable) return "acceptable";
  return "obese";
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

  if (bmiCat === "obese_3" || bmiCat === "obese_2" || bmiCat === "obese_1") {
    return {
      goal: "cut",
      goalName: "Изгаряне на мазнини (Cut)",
      bmi,
      bmiCategory: bmiCat,
      bodyFatPercentage: bodyFat,
      bodyFatCategory: bfCat,
      reasoning: "Наднормено тегло или затлъстяване. Препоръчва се сваляне на тегло и намаляване на телесните мазнини.",
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
      if (bfCat === "acceptable") {
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
      if (bfCat === "acceptable") {
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
