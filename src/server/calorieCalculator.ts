// Нива на физическа активност
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

// Macro split тип (процентно разпределение)
export interface MacroSplit {
  protein: number; // Процент от калориите
  fats: number; // Процент от калориите
  carbs: number; // Процент от калориите
}

// Macro distribution types
export type MacroDistribution = "balanced" | "lowFat" | "lowCarb" | "highProtein";

// Изчислени макронутриенти в грамове
export interface Macros {
  protein: number; // грамове
  fats: number; // грамове
  carbs: number; // грамове
}

export interface CalorieRecommendation {
  bmr: number; // Базален метаболизъм
  tdee: number; // Общ дневен разход на енергия
  maintenance: {
    calories: number;
    balanced: Macros; // 30P/30F/40C
    lowFat: Macros; // 30P/20F/50C
    lowCarb: Macros; // 40P/40F/20C
    highProtein: Macros; // 40P/25F/35C
  };
  cutting: {
    calories: number; // TDEE - 500
    balanced: Macros;
    lowFat: Macros;
    lowCarb: Macros;
    highProtein: Macros;
  };
  bulking: {
    calories: number; // TDEE + 300
    balanced: Macros;
    lowFat: Macros;
    lowCarb: Macros;
    highProtein: Macros;
  };
}

/**
 * Изчислява BMR използвайки Mifflin-St Jeor формулата
 */
function calculateBMR(weight: number, height: number, age: number, gender: "male" | "female"): number {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === "male" ? baseBMR + 5 : baseBMR - 161;
}

/**
 * Изчислява TDEE на база BMR и ниво на активност
 */
function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return bmr * activityMultipliers[activityLevel];
}

/**
 * Изчислява макронутриентите в грамове на база калории и процентно разпределение
 *
 * @param calories - Целеви калории за деня
 * @param split - Процентно разпределение (P/F/C)
 * @returns Макронутриенти в грамове
 */
function calculateMacrosFromSplit(calories: number, split: MacroSplit): Macros {
  // Протеин: (калории × процент) ÷ 4 cal/g
  const protein = Math.round((calories * split.protein) / 4);

  // Мазнини: (калории × процент) ÷ 9 cal/g
  const fats = Math.round((calories * split.fats) / 9);

  // Въглехидрати: (калории × процент) ÷ 4 cal/g
  const carbs = Math.round((calories * split.carbs) / 4);

  return { protein, fats, carbs };
}

/**
 * Изчислява макронутриентите за всички четири варианта
 */
function calculateAllMacroVariants(calories: number): {
  balanced: Macros;
  lowFat: Macros;
  lowCarb: Macros;
  highProtein: Macros;
} {
  const splits = {
    balanced: { protein: 0.3, fats: 0.3, carbs: 0.4 }, // 30P/30F/40C
    lowFat: { protein: 0.3, fats: 0.2, carbs: 0.5 }, // 30P/20F/50C
    lowCarb: { protein: 0.4, fats: 0.4, carbs: 0.2 }, // 40P/40F/20C
    highProtein: { protein: 0.4, fats: 0.25, carbs: 0.35 }, // 40P/25F/35C
  };

  return {
    balanced: calculateMacrosFromSplit(calories, splits.balanced),
    lowFat: calculateMacrosFromSplit(calories, splits.lowFat),
    lowCarb: calculateMacrosFromSplit(calories, splits.lowCarb),
    highProtein: calculateMacrosFromSplit(calories, splits.highProtein),
  };
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
): CalorieRecommendation {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Калорийни цели
  const maintenanceCalories = Math.round(tdee);
  const cuttingCalories = Math.round(tdee - 500); // -500 cal дефицит
  const bulkingCalories = Math.round(tdee + 300); // +300 cal суфицит

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    maintenance: {
      calories: maintenanceCalories,
      ...calculateAllMacroVariants(maintenanceCalories),
    },
    cutting: {
      calories: cuttingCalories,
      ...calculateAllMacroVariants(cuttingCalories),
    },
    bulking: {
      calories: bulkingCalories,
      ...calculateAllMacroVariants(bulkingCalories),
    },
  };
}
