import { DayRecommendationNutrition, DayRecommendationWorkout, Exercise, Meal } from "./types";

/**
 * Сортира дни чрез извличане на числова стойност от формат "Ден X"
 */
export function sortDaysByNumber<T extends { day: string }>(days: T[]): T[] {
  return [...days].sort((a, b) => {
    const aNum = Number(a.day.replace("Ден ", ""));
    const bNum = Number(b.day.replace("Ден ", ""));
    return aNum - bNum;
  });
}

/**
 * Намира текущия незавършен ден от списъка
 * @param sortedDays - Сортиран масив с дни
 * @param completedDays - Масив със завършени имена на дни
 * @returns Текущ незавършен ден или последен ден ако всички са завършени
 */
export function getCurrentDay<T extends { day: string }>(sortedDays: T[], completedDays: string[]): T {
  for (const day of sortedDays) {
    if (!completedDays.includes(day.day)) {
      return day;
    }
  }
  return sortedDays[sortedDays.length - 1];
}

export const getBMIVariant = (category: string): "default" | "destructive" | "secondary" => {
  if (category === "Normal") return "default";
  if (category.includes("Thinness") || category.includes("Obesity")) return "destructive";
  return "secondary";
};

export const getBMIDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    "Сериозно недохранване": "Тежка слабост - критичен здравен риск, изискващ незабавна медицинска намеса.",
    "Средно недохранване": "Умерена слабост - недостатъчно тегло, което трябва да се коригира.",
    "Леко недохранване": "Лека слабост - леко под нормалния диапазон на теглото.",
    Нормално: "Нормален диапазон на теглото, свързан с оптимални здравни резултати.",
    "Наднормено тегло": "Наднормено тегло - може да увеличи здравните рискове при повишена мастна тъкан.",
    "Затлъстяване I клас": "Затлъстяване клас I - умерени здравни рискове.",
    "Затлъстяване II клас": "Затлъстяване клас II - сериозни здравни рискове.",
    "Затлъстяване III клас": "Затлъстяване клас III - много сериозни здравни рискове, изискващи медицинска намеса.",
  };
  return descriptions[category] || "Няма налична информация.";
};

export const getBodyFatDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    critical: "Критично ниско телесно мазнини - сериозни здравни рискове.",
    essential: "Основни нива на телесно мазнини, необходими за базисна физиологична функция.",
    athletes: "Атлетични нива на телесно мазнини, типични за състезателни спортисти.",
    fitness: "Фитнес-ориентирани нива на телесно мазнини, свързани с добро здраве.",
    average: "Средни нива на телесно мазнини в приемлив здравен диапазон.",
    obese: "Повишени нива на телесно мазнини, свързани с увеличени здравни рискове.",
  };
  return descriptions[category] || "Няма налична информация.";
};

export function formatExercise(exercise: Exercise) {
  return {
    exercise_name: String(exercise.exercise_name),
    sets: String(exercise.sets),
    reps: exercise.reps,
    muscle_activation: exercise.workout_exercises?.muscle_activation,
  };
}

export function formatMeal(meal: Meal) {
  const nutrition = meal.nutrition_meals ?? {};

  return {
    id: meal.id,
    name: meal.name,
    meal_type: meal.meal_type,
    day: meal.day,
    time: meal.time,

    description: nutrition.description,

    prep_time: Number(nutrition.prep_time) || 0,
    cooking_time: Number(nutrition.cooking_time) || 0,

    macros: {
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbs: nutrition.carbs,
      fats: nutrition.fats,
    },

    ingredients: nutrition.ingredients ?? [],

    instructions: nutrition.instructions ?? [],
  };
}
