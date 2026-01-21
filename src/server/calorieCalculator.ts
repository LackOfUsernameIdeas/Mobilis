// Нива на физическа активност
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

// Цели
export type FitnessGoal =
  | "cut"
  | "aggressive_cut"
  | "lean_bulk"
  | "dirty_bulk"
  | "recomposition"
  | "maintenance"
  | "aesthetic"
  | "strength";

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
  bmr: number; // Базов метаболизъм
  tdee: number; // Общ дневен разход на енергия
  goal: CalorieGoalWithMacros;
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
 * Връща калорийните настройки за дадена цел
 */
function getCaloriesForGoal(tdee: number, goal: FitnessGoal): number {
  const calorieAdjustments: Record<FitnessGoal, number> = {
    cut: -500, // -500 cal дефицит (0.5 кг/седмица)
    aggressive_cut: -750, // -750 cal дефицит (0.75 кг/седмица)
    lean_bulk: 300, // +300 cal суфицит (бавно качване)
    dirty_bulk: 500, // +500 cal суфицит (бързо качване)
    recomposition: -200, // -200 cal леко под поддръжка
    strength: 200, // +200 cal леко над поддръжка
    aesthetic: -300, // -300 cal умерен дефицит
    maintenance: 0, // поддръжка
  };

  return Math.round(tdee + calorieAdjustments[goal]);
}

/**
 * Изчислява макронутриентите за конкретна цел
 */
function calculateMacrosForGoal(calories: number, goal: FitnessGoal): Macros {
  const goalSpecificSplits: Record<FitnessGoal, MacroSplit> = {
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
 * Главна функция за изчисляване на калорийни препоръки за конкретна цел
 */
export function calculateCalorieRecommendation(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female",
  activityLevel: ActivityLevel,
  goal: FitnessGoal,
): CalorieRecommendation {
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const goalCalories = getCaloriesForGoal(tdee, goal);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    goal: {
      calories: goalCalories,
      macros: calculateMacrosForGoal(goalCalories, goal),
    },
  };
}
