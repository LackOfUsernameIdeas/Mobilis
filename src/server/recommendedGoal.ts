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

/**
 * Интерфейс за препоръка на цел
 */
export interface GoalRecommendation {
  goal: FitnessGoal;
  goalName: string;
  description: string;
  reason: string;
  priority: string;
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

  // Здравословни диапазони на телесни мазнини
  const healthyBFRanges = {
    male: { min: 10, max: 20 },
    female: { min: 18, max: 28 },
  };

  const healthy = healthyBFRanges[gender];
  const isBodyFatHigh = bodyFat > healthy.max;
  const isBodyFatLow = bodyFat < healthy.min;
  const isBodyFatHealthy = bodyFat >= healthy.min && bodyFat <= healthy.max;

  // 1. Сериозно наднормено тегло или високи телесни мазнини
  if (bmi >= 30 || bodyFat > healthy.max + 10) {
    return {
      goal: "cut",
      goalName: "Изгаряне на мазнини (Cut)",
      description: "Намаляване на телесните мазнини при запазване на мускулна маса",
      reason: `BMI: ${bmi.toFixed(1)} (${bmi >= 30 ? "затлъстяване" : "високо"}), Телесни мазнини: ${bodyFat.toFixed(1)}% (високо). Приоритет е да намалите теглото и мазнините за подобряване на здравето.`,
      priority: "Здраве и намаляване на телесни мазнини",
    };
  }

  // 2. Наднормено тегло или леко високи телесни мазнини
  if (bmi >= 25 || (isBodyFatHigh && bodyFat <= healthy.max + 10)) {
    return {
      goal: "cut",
      goalName: "Изгаряне на мазнини (Cut)",
      description: "Намаляване на телесните мазнини при запазване на мускулна маса",
      reason: `BMI: ${bmi.toFixed(1)} (наднормено), Телесни мазнини: ${bodyFat.toFixed(1)}%. Препоръчва се леко изгаряне на мазнини.`,
      priority: "Намаляване на телесни мазнини",
    };
  }

  // 3. Поднормено тегло или много ниски телесни мазнини
  if (bmi < 18.5 || bodyFat < healthy.min - 3) {
    return {
      goal: "lean_bulk",
      goalName: "Чисто качване (Lean Bulk)",
      description: "Качване на мускулна маса с минимално натрупване на мазнини",
      reason: `BMI: ${bmi.toFixed(1)} (поднормено), Телесни мазнини: ${bodyFat.toFixed(1)}%. Нуждаете се от качване на здравословно тегло и мускули.`,
      priority: "Качване на мускулна маса и тегло",
    };
  }

  // 4. Нормално тегло, но ниски телесни мазнини
  if (bmi >= 18.5 && bmi < 25 && isBodyFatLow) {
    return {
      goal: "lean_bulk",
      goalName: "Чисто качване (Lean Bulk)",
      description: "Качване на мускулна маса с минимално натрупване на мазнини",
      reason: `BMI: ${bmi.toFixed(1)} (нормално), но телесни мазнини: ${bodyFat.toFixed(1)}% (ниско). Добра възможност за качване на мускулна маса.`,
      priority: "Качване на мускулна маса",
    };
  }

  // 5. Нормално BMI, здравословни телесни мазнини, близо до перфектно тегло
  if (bmi >= 18.5 && bmi < 25 && isBodyFatHealthy && Math.abs(weightDiffPercent) < 5) {
    return {
      goal: "maintenance",
      goalName: "Поддържане (Maintenance)",
      description: "Запазване на текущото тегло и мускулна маса, подобряване на фитнес формата",
      reason: `BMI: ${bmi.toFixed(1)}, Телесни мазнини: ${bodyFat.toFixed(1)}%, Тегло: близо до идеалното (${perfectWeight.toFixed(1)} кг). Вие сте в отлична форма!`,
      priority: "Поддържане на форма и фитнес",
    };
  }

  // 6. Нормално BMI, здравословни телесни мазнини, но над перфектното тегло
  if (bmi >= 18.5 && bmi < 25 && isBodyFatHealthy && weightDiff > 0) {
    return {
      goal: "recomposition",
      goalName: "Рекомпозиция (Recomposition)",
      description: "Едновременно изграждане на мускули и изгаряне на мазнини",
      reason: `BMI: ${bmi.toFixed(1)}, Телесни мазнини: ${bodyFat.toFixed(1)}%. Можете да подобрите телосложението си чрез рекомпозиция.`,
      priority: "Подобряване на телесния състав",
    };
  }

  // 7. По подразбиране - рекомпозиция
  return {
    goal: "recomposition",
    goalName: "Рекомпозиция (Recomposition)",
    description: "Едновременно изграждане на мускули и изгаряне на мазнини",
    reason: `BMI: ${bmi.toFixed(1)}, Телесни мазнини: ${bodyFat.toFixed(1)}%. Балансиран подход за подобряване на общата форма.`,
    priority: "Подобряване на телесния състав",
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
  // Изчисляване на всички метрики
  const bmiResult = calculateBMI(height, weight);
  const perfectWeightResult = calculatePerfectWeight(height, gender, weight);
  const bodyFatResult = calculateBodyFat(height, gender, weight, neck, waist, hip);

  const bmi = parseFloat(bmiResult.bmi);
  const bodyFat = bodyFatResult.bodyFat;
  const perfectWeight = perfectWeightResult.perfectWeight;

  return recommendGoal(bmi, bodyFat, perfectWeight, weight, gender);
}
