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

export interface CalorieGoalWithMacros {
  calories: number;
  macros: Macros;
}

export interface CalorieRecommendation {
  bmr: number; // Базален метаболизъм
  tdee: number; // Общ дневен разход на енергия
  cut: CalorieGoalWithMacros;
  aggressive_cut: CalorieGoalWithMacros;
  lean_bulk: CalorieGoalWithMacros;
  dirty_bulk: CalorieGoalWithMacros;
  recomposition: CalorieGoalWithMacros;
  maintenance: CalorieGoalWithMacros;
  aesthetic: CalorieGoalWithMacros;
  strength: CalorieGoalWithMacros;
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
 * Изчислява макронутриентите за конкретна цел
 */
function calculateMacrosForGoal(calories: number, goal: string): Macros {
  const goalSpecificSplits: Record<string, { protein: number; fats: number; carbs: number }> = {
    cut: { protein: 0.4, fats: 0.25, carbs: 0.35 }, // 40P/25F/35C
    aggressive_cut: { protein: 0.45, fats: 0.2, carbs: 0.35 }, // 45P/20F/35C
    lean_bulk: { protein: 0.3, fats: 0.25, carbs: 0.45 }, // 30P/25F/45C
    dirty_bulk: { protein: 0.25, fats: 0.3, carbs: 0.45 }, // 25P/30F/45C
    recomposition: { protein: 0.4, fats: 0.3, carbs: 0.3 }, // 40P/30F/30C
    maintenance: { protein: 0.3, fats: 0.3, carbs: 0.4 }, // 30P/30F/40C
    strength: { protein: 0.3, fats: 0.25, carbs: 0.45 }, // 30P/25F/45C
    aesthetic: { protein: 0.4, fats: 0.25, carbs: 0.35 }, // 40P/25F/35C
  };

  return calculateMacrosFromSplit(calories, goalSpecificSplits[goal]);
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
  const cuttingCalories = Math.round(tdee - 500); // -500 cal дефицит (0.5 кг/седмица)
  const aggressiveCuttingCalories = Math.round(tdee - 750); // -750 cal дефицит (0.75 кг/седмица)
  const leanBulkCalories = Math.round(tdee + 300); // +300 cal суфицит (бавно качване)
  const dirtyBulkCalories = Math.round(tdee + 500); // +500 cal суфицит (бързо качване)
  const recompCalories = Math.round(tdee - 200); // -200 cal леко под поддръжка
  const strengthCalories = Math.round(tdee + 200); // +200 cal леко над поддръжка
  const aestheticCalories = Math.round(tdee - 300); // -300 cal умерен дефицит

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    cut: {
      calories: cuttingCalories,
      macros: calculateMacrosForGoal(cuttingCalories, "cut"),
    },
    aggressive_cut: {
      calories: aggressiveCuttingCalories,
      macros: calculateMacrosForGoal(aggressiveCuttingCalories, "aggressive_cut"),
    },
    lean_bulk: {
      calories: leanBulkCalories,
      macros: calculateMacrosForGoal(leanBulkCalories, "lean_bulk"),
    },
    dirty_bulk: {
      calories: dirtyBulkCalories,
      macros: calculateMacrosForGoal(dirtyBulkCalories, "dirty_bulk"),
    },
    recomposition: {
      calories: recompCalories,
      macros: calculateMacrosForGoal(recompCalories, "recomposition"),
    },
    maintenance: {
      calories: maintenanceCalories,
      macros: calculateMacrosForGoal(maintenanceCalories, "maintenance"),
    },
    strength: {
      calories: strengthCalories,
      macros: calculateMacrosForGoal(strengthCalories, "strength"),
    },
    aesthetic: {
      calories: aestheticCalories,
      macros: calculateMacrosForGoal(aestheticCalories, "aesthetic"),
    },
  };
}
