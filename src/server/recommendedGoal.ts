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
    essential: 13,
    athletes: 20,
    fitness: 24,
    acceptable: 31,
    obese: 32,
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
      reasoning: "Критично ниско тегло. Нужно е качване поради здравословен риск.",
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
      reasoning: "Наднормено тегло или затлъстяване. Препоръчва се намаляване на мазнини.",
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
      reasoning: "Опасно ниски мазнини. Нужно е качване на тегло.",
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
        reasoning: "Поднормено тегло. Нужно е изграждане на мускули и увеличение на тегло.",
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
            "BMI е нормално, но мазнините са високи. Подход с паралелно изграждане на мускули и намаляване на мазнини.",
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
          reasoning: "Нормални мазнини. Подход с паралелно изграждане на мускули и леко намаляване на мазнини.",
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
          reasoning: "Добро телосложение с ниски мазнини. Поддържане на текущото състояние.",
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
          reasoning: "Висок BMI, но ниски мазнини. Поддържане на мускулна маса.",
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
          reasoning: "Наднормено тегло с умерени мазнини. Подход с изграждане на мускули и леко намаляване на мазнини.",
        };
      }
      return {
        goal: "cut",
        goalName: "Изгаряне на мазнини (Cut)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Наднормено тегло с високи мазнини. Препоръчва се намаляване.",
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
    reasoning: "Подход за подобряване на съотношението мускули към мазнини.",
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
