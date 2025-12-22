/**
 * Калкулатор на калории за различни фитнес цели
 */

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface CalorieRecommendation {
  bmr: number; // Базален метаболизъм (Basal Metabolic Rate)
  tdee: number; // Общ дневен разход на енергия (Total Daily Energy Expenditure)
  targetCalories: number; // Целеви калории според целта
  protein: { min: number; max: number }; // Протеин в грамове
  carbs: { min: number; max: number }; // Въглехидрати в грамове
  fats: { min: number; max: number }; // Мазнини в грамове
  description: string;
}

/**
 * Изчислява BMR използвайки Mifflin-St Jeor формулата
 */
function calculateBMR(weight: number, height: number, age: number, gender: "male" | "female"): number {
  // Mifflin-St Jeor формула
  // За мъже: BMR = (10 × тегло kg) + (6.25 × височина cm) - (5 × възраст години) + 5
  // За жени: BMR = (10 × тегло kg) + (6.25 × височина cm) - (5 × възраст години) - 161

  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Изчислява TDEE на база BMR и ниво на активност
 */
function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const activityMultipliers = {
    sedentary: 1.2, // Малко или никаква физическа активност
    light: 1.375, // Лека тренировка 1-3 дни/седмица
    moderate: 1.55, // Умерена тренировка 3-5 дни/седмица
    active: 1.725, // Интензивна тренировка 6-7 дни/седмица
    very_active: 1.9, // Много интензивна тренировка 2 пъти на ден
  };

  return bmr * activityMultipliers[activityLevel];
}

/**
 * Изчислява целеви калории според фитнес целта
 */
function getTargetCalories(tdee: number, goal: string): number {
  switch (goal) {
    case "cut": // Агресивен дефицит
      return Math.round(tdee * 0.8); // -20%
    case "lean_bulk": // Контролиран излишък
      return Math.round(tdee * 1.1); // +10%
    case "dirty_bulk": // По-агресивен излишък
      return Math.round(tdee * 1.2); // +20%
    case "recomposition": // Малък дефицит/поддържане
      return Math.round(tdee * 0.95); // -5%
    case "maintenance": // Поддържане
      return Math.round(tdee);
    case "aesthetic": // Умерен дефицит
      return Math.round(tdee * 0.85); // -15%
    case "strength": // Умерен излишък
      return Math.round(tdee * 1.15); // +15%
    default:
      return Math.round(tdee);
  }
}

/**
 * Изчислява макронутриенти според целта и теглото
 */
function calculateMacros(
  targetCalories: number,
  weight: number,
  goal: string,
): { protein: { min: number; max: number }; carbs: { min: number; max: number }; fats: { min: number; max: number } } {
  // Протеин (4 cal/g)
  let proteinGPerKg: { min: number; max: number };

  switch (goal) {
    case "cut":
      proteinGPerKg = { min: 2.2, max: 2.6 }; // По-висок протеин по време на дефицит
      break;
    case "lean_bulk":
    case "dirty_bulk":
      proteinGPerKg = { min: 1.8, max: 2.2 };
      break;
    case "recomposition":
      proteinGPerKg = { min: 2.0, max: 2.4 };
      break;
    case "strength":
      proteinGPerKg = { min: 1.8, max: 2.2 };
      break;
    default:
      proteinGPerKg = { min: 1.6, max: 2.0 };
  }

  const protein = {
    min: Math.round(weight * proteinGPerKg.min),
    max: Math.round(weight * proteinGPerKg.max),
  };

  // Мазнини (9 cal/g) - 25-35% от калориите
  const fatsCaloriesMin = targetCalories * 0.25;
  const fatsCaloriesMax = targetCalories * 0.35;
  const fats = {
    min: Math.round(fatsCaloriesMin / 9),
    max: Math.round(fatsCaloriesMax / 9),
  };

  // Въглехидрати (4 cal/g) - остатъкът от калориите
  const proteinCaloriesAvg = ((protein.min + protein.max) / 2) * 4;
  const fatsCaloriesAvg = ((fats.min + fats.max) / 2) * 9;
  const carbsCalories = targetCalories - proteinCaloriesAvg - fatsCaloriesAvg;
  const carbsAvg = Math.round(carbsCalories / 4);

  const carbs = {
    min: Math.max(0, Math.round(carbsAvg * 0.9)),
    max: Math.round(carbsAvg * 1.1),
  };

  return { protein, carbs, fats };
}

/**
 * Генерира описание на препоръката
 */
function getCalorieDescription(goal: string, tdee: number, targetCalories: number): string {
  const diff = targetCalories - tdee;
  const diffPercent = Math.round((diff / tdee) * 100);

  const descriptions: Record<string, string> = {
    cut: `Калориен дефицит от ${Math.abs(diffPercent)}% за ефективно изгаряне на мазнини при запазване на мускулна маса.`,
    lean_bulk: `Калориен излишък от ${diffPercent}% за чисто покачване на мускулна маса с минимално натрупване на мазнини.`,
    dirty_bulk: `Калориен излишък от ${diffPercent}% за бързо покачване на тегло и мускулна маса.`,
    recomposition: `Лек калориен дефицит от ${Math.abs(diffPercent)}% за едновременно изгаряне на мазнини и покачване на мускули.`,
    maintenance: `Калории за поддържане на текущото тегло и телесна композиция.`,
    aesthetic: `Калориен дефицит от ${Math.abs(diffPercent)}% за постигане на естетичен вид с ниски телесни мазнини.`,
    strength: `Калориен излишък от ${diffPercent}% за максимално покачване на сила и мускулна маса.`,
  };

  return descriptions[goal] || "Калории съобразени с вашата цел.";
}

/**
 * Главна функция за изчисляване на калорийни препоръки
 */
export function calculateCalorieRecommendation(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: ActivityLevel,
  goal: string,
): CalorieRecommendation {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const targetCalories = getTargetCalories(tdee, goal);
  const macros = calculateMacros(targetCalories, weight, goal);
  const description = getCalorieDescription(goal, tdee, targetCalories);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    description,
  };
}
