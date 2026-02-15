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
 * @param currentDay - Сегашният ден
 * @returns Текущ незавършен ден или последен ден ако всички са завършени
 */
export function getCurrentDayObject<Day extends { day: string }>(sortedDays: Day[], currentDay: string): Day {
  for (const day of sortedDays) {
    if (day.day === currentDay) {
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
    "Сериозно недохранване":
      "Критично ниско тегло - сериозен здравословен риск. Препоръчва се бързо качване на тегло под медицински надзор.",
    "Средно недохранване":
      "Критично ниско тегло - здравословен риск. Необходимо е качване на тегло за възстановяване до здравословно ниво.",
    "Леко недохранване": "Поднормено тегло - препоръчва се покачване на мускулна маса и увеличаване на тегло.",
    Нормално:
      "Нормален диапазон на теглото. В зависимост от телесните мазнини може да е подходящо поддържане, рекомпозиция или чисто качване.",
    "Наднормено тегло":
      "Наднормено тегло - препоръчва се оценка на телесните мазнини. При високи нива се препоръчва сваляне, при ниски - поддържане или рекомпозиция.",
    "Затлъстяване I клас":
      "Затлъстяване клас I - препоръчва се сваляне на тегло и намаляване на телесните мазнини за намаляване на здравните рискове.",
    "Затлъстяване II клас":
      "Затлъстяване клас II - сериозен здравословен риск. Препоръчва се агресивно сваляне на тегло с по-голям калориен дефицит.",
    "Затлъстяване III клас":
      "Затлъстяване клас III - критичен здравословен риск. Препоръчва се агресивно сваляне на тегло и медицинска консултация.",
  };
  return descriptions[category] || "Няма налична информация.";
};

export const getBodyFatDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    critical:
      "Критично ниско ниво на телесни мазнини - опасно за здравето. Препоръчва се бързо качване на тегло и телесни мазнини.",
    essential:
      "Ниво на основни телесни мазнини - минималното количество, необходимо за основна физиологична функция. При нормално ниво на BMI се препоръчва поддържане.",
    athletes:
      "Атлетично ниво на телесни мазнини - отлично за спортни постижения. При нормално ниво на BMI се препоръчва поддържане на текущото състояние.",
    fitness:
      "Фитнес ниво на телесни мазнини - свързани с добро здраве и физическа форма. При нормално или повишено ниво на BMI се препоръчва поддържане.",
    average:
      "Средно ниво на телесни мазнини - приемлив здравен диапазон. В зависимост от нивото на BMI може да е подходяща рекомпозиция или поддържане.",
    obese:
      "Повишено ниво на телесни мазнини - увеличен здравен риск. Препоръчва се сваляне на тегло и намаляване на телесните мазнини или рекомпозиция при нормално ниво на BMI.",
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
