import { calculateBMI, calculatePerfectWeight, calculateBodyFat } from "./health";

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
 * Биологично точни категории на телесни мазнини
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
 * Определя препоръчана цел въз основа на BMI, телесни мазнини и перфектно тегло
 */
function recommendGoal(
  bmi: number,
  bodyFat: number,
  perfectWeight: number,
  currentWeight: number,
  gender: "male" | "female",
): GoalRecommendation {
  const weightDiff = currentWeight - perfectWeight;
  const weightDiffPercent = (weightDiff / perfectWeight) * 100;
  const bmiCat = getBMICategory(bmi);
  const bfCat = getBodyFatCategory(bodyFat, gender);

  // Критични здравословни състояния
  switch (bmiCat) {
    case "severe_thin":
    case "moderate_thin":
      return {
        goal: "dirty_bulk",
        goalName: "Бързо качване (Dirty Bulk)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Критично ниско тегло. Необходимо е бързо качване на тегло, поради здравословни причини.",
      };

    case "obese_3":
    case "obese_2":
      return {
        goal: "cut",
        goalName: "Изгаряне на мазнини (Cut)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Сериозно наднормено тегло. Приоритет е загуба на мазнини за подобряване на здравето.",
      };

    case "obese_1":
      return {
        goal: "cut",
        goalName: "Изгаряне на мазнини (Cut)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Наднормено тегло. Препоръчва се загуба на мазнини.",
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
      reasoning: "Опасно ниски телесни мазнини. Необходимо е спешно качване на тегло.",
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
      reasoning: "Високи телесни мазнини. Препоръчва се загуба на мазнини.",
    };
  }

  // Обработка по BMI категории
  switch (bmiCat) {
    case "mild_thin":
      return {
        goal: "lean_bulk",
        goalName: "Чисто качване (Lean Bulk)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Поднормено тегло. Необходимо е качване на мускулна маса и тегло.",
      };

    case "overweight":
      // Атлетично тяло (висок BMI, ниски мазнини)
      if (bfCat === "athletes" || bfCat === "fitness") {
        return {
          goal: "maintenance",
          goalName: "Поддържане (Maintenance)",
          bmi,
          bmiCategory: bmiCat,
          bodyFatPercentage: bodyFat,
          bodyFatCategory: bfCat,
          reasoning: "Високо BMI но ниски телесни мазнини - мускулно тяло. Поддържане на текущото състояние.",
        };
      }

      // Наднормено с високи мазнини
      return {
        goal: "cut",
        goalName: "Изгаряне на мазнини (Cut)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Наднормено тегло с излишни мазнини. Загуба на мазнини ще подобри композицията на тялото.",
      };

    case "normal":
      // Нормално тегло - обработка по категория на телесни мазнини
      switch (bfCat) {
        case "athletes":
          if (weightDiff < -3) {
            return {
              goal: "lean_bulk",
              goalName: "Чисто качване (Lean Bulk)",
              bmi,
              bmiCategory: bmiCat,
              bodyFatPercentage: bodyFat,
              bodyFatCategory: bfCat,
              reasoning: "Атлетична дефиниция но под идеалното тегло. Чисто качване на мускулна маса.",
            };
          }
          return {
            goal: "maintenance",
            goalName: "Поддържане (Maintenance)",
            bmi,
            bmiCategory: bmiCat,
            bodyFatPercentage: bodyFat,
            bodyFatCategory: bfCat,
            reasoning: "Отлично атлетично телосложение. Поддържане на текущото състояние.",
          };

        case "fitness":
          if (Math.abs(weightDiffPercent) < 5) {
            return {
              goal: "maintenance",
              goalName: "Поддържане (Maintenance)",
              bmi,
              bmiCategory: bmiCat,
              bodyFatPercentage: bodyFat,
              bodyFatCategory: bfCat,
              reasoning: "Отлично телосложение, близо до идеалното тегло. Поддържане на текущото състояние.",
            };
          }
          if (weightDiff < 0) {
            return {
              goal: "lean_bulk",
              goalName: "Чисто качване (Lean Bulk)",
              bmi,
              bmiCategory: bmiCat,
              bodyFatPercentage: bodyFat,
              bodyFatCategory: bfCat,
              reasoning: "Добра дефиниция но под перфектното тегло. Чисто качване на мускулна маса.",
            };
          }
          return {
            goal: "cut",
            goalName: "Изгаряне на мазнини (Cut)",
            bmi,
            bmiCategory: bmiCat,
            bodyFatPercentage: bodyFat,
            bodyFatCategory: bfCat,
            reasoning: "Добра форма но леко над идеалното тегло. Лека редукция на мазнини.",
          };

        case "acceptable":
          if (Math.abs(weightDiffPercent) < 8) {
            return {
              goal: "recomposition",
              goalName: "Рекомпозиция (Recomposition)",
              bmi,
              bmiCategory: bmiCat,
              bodyFatPercentage: bodyFat,
              bodyFatCategory: bfCat,
              reasoning:
                "Нормално тегло с умерени телесни мазнини. Рекомпозиция за подобряване на съотношението мускули/мазнини.",
            };
          }
          if (weightDiff > 0) {
            return {
              goal: "cut",
              goalName: "Изгаряне на мазнини (Cut)",
              bmi,
              bmiCategory: bmiCat,
              bodyFatPercentage: bodyFat,
              bodyFatCategory: bfCat,
              reasoning: "Нормално BMI но излишни мазнини. Загуба на мазнини ще подобри композицията.",
            };
          }
          return {
            goal: "recomposition",
            goalName: "Рекомпозиция (Recomposition)",
            bmi,
            bmiCategory: bmiCat,
            bodyFatPercentage: bodyFat,
            bodyFatCategory: bfCat,
            reasoning: "Под перфектното тегло с умерени мазнини. Рекомпозиция за баланс.",
          };

        default:
          return {
            goal: "recomposition",
            goalName: "Рекомпозиция (Recomposition)",
            bmi,
            bmiCategory: bmiCat,
            bodyFatPercentage: bodyFat,
            bodyFatCategory: bfCat,
            reasoning: "Балансиран подход за подобряване на съотношението мускули/мазнини.",
          };
      }

    default:
      return {
        goal: "recomposition",
        goalName: "Рекомпозиция (Recomposition)",
        bmi,
        bmiCategory: bmiCat,
        bodyFatPercentage: bodyFat,
        bodyFatCategory: bfCat,
        reasoning: "Балансиран подход за подобряване на съотношението мускули/мазнини.",
      };
  }
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
  const perfectWeightResult = calculatePerfectWeight(height, gender, weight);
  const bodyFatResult = calculateBodyFat(height, gender, weight, neck, waist, hip);

  const bmi = parseFloat(bmiResult.bmi);
  const bodyFat = bodyFatResult.bodyFat;
  const perfectWeight = perfectWeightResult.perfectWeight;

  return recommendGoal(bmi, bodyFat, perfectWeight, weight, gender);
}
