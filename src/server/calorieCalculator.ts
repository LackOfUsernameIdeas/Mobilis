// Нива на физическа активност
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

interface MacroRange {
  min: number;
  max: number;
}

export interface CalorieRecommendation {
  bmr: number; // Базален метаболизъм (Basal Metabolic Rate)
  tdee: number; // Общ дневен разход на енергия (Total Daily Energy Expenditure)
  protein: { min: number; max: number }; // Протеин в грамове
  carbs: { min: number; max: number }; // Въглехидрати в грамове
  fats: { min: number; max: number }; // Мазнини в грамове
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
 * Изчислява макронутриенти според AMDR (Acceptable Macronutrient Distribution Ranges)
 * стандартите на Institute of Medicine.
 *
 * AMDR стандарти (приложими за всички нива на активност):
 * - Протеин: 10-35% от калориите
 * - Мазнини: 20-35% от калориите
 * - Въглехидрати: 45-65% от калориите
 *
 * DRI минимум за протеин: 0.8 g/kg телесно тегло
 */
function calculateMacros(
  tdee: number,
  weight: number,
): {
  protein: MacroRange;
  carbs: MacroRange;
  fats: MacroRange;
} {
  // AMDR стандартни диапазони (фиксирани за всички)
  const AMDR = {
    protein: { min: 0.1, max: 0.35 }, // 10-35%
    fats: { min: 0.2, max: 0.35 }, // 20-35%
    carbs: { min: 0.45, max: 0.65 }, // 45-65%
  };

  // Изчисляваме протеин
  const proteinCaloriesMin = tdee * AMDR.protein.min;
  const proteinCaloriesMax = tdee * AMDR.protein.max;

  const proteinMin = Math.round(proteinCaloriesMin / 4); // 4 cal/gram
  const proteinMax = Math.round(proteinCaloriesMax / 4);

  // Проверка спрямо DRI минимум (0.8 g/kg)
  const driMinimum = Math.round(weight * 0.8);

  const protein = {
    min: Math.max(proteinMin, driMinimum), // Минимум DRI или AMDR, което е по-голямо
    max: proteinMax,
  };

  // Изчисляваме мазнини
  const fatsCaloriesMin = tdee * AMDR.fats.min;
  const fatsCaloriesMax = tdee * AMDR.fats.max;

  const fats = {
    min: Math.round(fatsCaloriesMin / 9), // 9 cal/gram
    max: Math.round(fatsCaloriesMax / 9),
  };

  // Изчисляваме въглехидрати
  const carbsCaloriesMin = tdee * AMDR.carbs.min;
  const carbsCaloriesMax = tdee * AMDR.carbs.max;

  const carbs = {
    min: Math.round(carbsCaloriesMin / 4), // 4 cal/gram
    max: Math.round(carbsCaloriesMax / 4),
  };

  return { protein, carbs, fats };
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
  const macros = calculateMacros(tdee, weight);

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
  };
}
