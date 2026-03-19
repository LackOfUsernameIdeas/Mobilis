import { Exercise, Meal } from "./types";

/**
 * Сортира масив от дни по номера им, извлечен от формат „Ден X".
 *
 * @param days - Масив от обекти с поле `day` във формат „Ден 1", „Ден 2" и т.н.
 * @returns Нов сортиран масив — оригиналният не се променя
 */
export function sortDaysByNumber<T extends { day: string }>(days: T[]): T[] {
  return [...days].sort((a, b) => {
    const aNum = Number(a.day.replace("Ден ", ""));
    const bNum = Number(b.day.replace("Ден ", ""));
    return aNum - bNum;
  });
}

/**
 * Намира обекта на текущия ден от сортиран масив с дни.
 * Ако денят не е намерен, връща последния елемент (всички дни са завършени).
 *
 * @param sortedDays - Предварително сортиран масив с дни
 * @param currentDay - Текущият ден като стринг, напр. „Ден 3"
 * @returns Намереният обект за текущия ден или последният в масива
 */
export function getCurrentDayObject<Day extends { day: string }>(sortedDays: Day[], currentDay: string): Day {
  for (const day of sortedDays) {
    if (day.day === currentDay) {
      return day;
    }
  }
  return sortedDays[sortedDays.length - 1];
}

/**
 * Връща вариант за Badge компонента въз основа на BMI категория.
 * Нормалното тегло е `"default"`, недохранването и затлъстяването — `"destructive"`,
 * всичко останало — `"secondary"`.
 *
 * @param category - BMI категория на английски (напр. `"Normal"`, `"Obesity"`)
 * @returns Вариант за Badge: `"default"`, `"destructive"` или `"secondary"`
 */
export const getBMIVariant = (category: string): "default" | "destructive" | "secondary" => {
  if (category === "Normal") return "default";
  if (category.includes("Thinness") || category.includes("Obesity")) return "destructive";
  return "secondary";
};

/**
 * Връща описание на здравословното състояние и препоръка за действие
 * според BMI категорията на потребителя.
 *
 * @param category - BMI категория на български (напр. `"Нормално"`, `"Затлъстяване I клас"`)
 * @returns Описателен текст с препоръка или съобщение за липса на информация
 */
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

/**
 * Връща описание и препоръка за действие според категорията на телесните мазнини.
 *
 * @param category - Категория на телесните мазнини на английски
 *   (`"critical"`, `"essential"`, `"athletes"`, `"fitness"`, `"average"`, `"obese"`)
 * @returns Описателен текст с препоръка или съобщение за липса на информация
 */
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

/**
 * Форматира обект с упражнение до опростена структура, подходяща за показване в UI.
 * Извлича само полетата, необходими за визуализация — без излишни релационни данни.
 *
 * @param exercise - Пълен обект с упражнение от базата данни
 * @returns Опростен обект с име, серии, повторения и мускулна активация
 */
export function formatExercise(exercise: Exercise) {
  return {
    exercise_name: String(exercise.exercise_name),
    sets: String(exercise.sets),
    reps: exercise.reps,
    muscle_activation: exercise.workout_exercises?.muscle_activation,
  };
}

/**
 * Форматира обект с хранене до плоска структура, подходяща за показване в UI.
 * Обединява основните полета на храненето с хранителните стойности от релацията.
 *
 * @param meal - Пълен обект с хранене от базата данни, включително `nutrition_meals`
 * @returns Форматиран обект с макронутриенти, съставки, инструкции и времена за приготвяне
 */
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

// ─── Weight Prognosis Helpers ────────────────────────────────────────────────

/**
 * Връща броя изминали цели дни от датата на генериране на прогнозата.
 * Сравнява UTC полунощ на двете дати, за да избегне отместване на часовата зона.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @returns Брой изминали цели дни като цяло число
 */
export function getPrognosisDaysElapsed(createdAt: string): number {
  const created = new Date(createdAt);
  const createdMidnightUTC = Date.UTC(created.getUTCFullYear(), created.getUTCMonth(), created.getUTCDate());
  const today = new Date();
  const todayMidnightUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.floor((todayMidnightUTC - createdMidnightUTC) / (1000 * 60 * 60 * 24));
}

/**
 * Връща четим относителен етикет за времето, изминало от генерирането на прогнозата.
 * При под 1 ден показва часове, при под 7 дни — дни, иначе — седмици и дни.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @returns Текст като `"преди 3 седмици"`, `"преди 1 ден"` или `"току-що"`
 */
export function getPrognosisAgeLabel(createdAt: string): string {
  const diffDays = getPrognosisDaysElapsed(createdAt);

  if (diffDays === 0) {
    const diffHours = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "току-що";
    return `преди ${diffHours} часа`;
  }

  if (diffDays === 1) return "преди 1 ден";
  if (diffDays < 7) return `преди ${diffDays} дни`;

  const diffWeeks = Math.floor(diffDays / 7);
  const remainderDays = diffDays % 7;

  if (remainderDays === 0) {
    return diffWeeks === 1 ? "преди 1 седмица" : `преди ${diffWeeks} седмици`;
  }

  const weeksLabel = diffWeeks === 1 ? "1 седмица" : `${diffWeeks} седмици`;
  const daysLabel = remainderDays === 1 ? "1 ден" : `${remainderDays} дни`;
  return `преди ${weeksLabel} и ${daysLabel}`;
}

/**
 * Изчислява процента на напредък по прогнозата спрямо общия прогнозиран период.
 * Резултатът е ограничен между 0 и 100.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @param estimatedWeeks - Прогнозираният брой седмици за постигане на целта
 * @returns Процент на напредък като цяло число между 0 и 100
 */
export function getPrognosisProgressPercent(createdAt: string, estimatedWeeks: number): number {
  if (estimatedWeeks <= 0) return 0;
  const totalDays = estimatedWeeks * 7;
  return Math.min(100, Math.round((getPrognosisDaysElapsed(createdAt) / totalDays) * 100));
}

/**
 * Проверява дали прогнозираният период е изтекъл напълно.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @param estimatedWeeks - Прогнозираният брой седмици
 * @returns `true` ако са изминали повече дни от общия прогнозиран период
 */
export function isPrognosisStale(createdAt: string, estimatedWeeks: number): boolean {
  return getPrognosisDaysElapsed(createdAt) >= estimatedWeeks * 7;
}

/**
 * Проверява дали даден етап (по номер на седмица) вече е изминал изцяло.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @param milestoneWeek - Номер на седмицата на етапа (напр. `2` за втора седмица)
 * @returns `true` ако броят изминали дни надвишава края на зададената седмица
 */
export function isMilestonePast(createdAt: string, milestoneWeek: number): boolean {
  return getPrognosisDaysElapsed(createdAt) >= milestoneWeek * 7;
}

/**
 * Проверява дали даден етап е текущата активна седмица на прогнозата.
 * Активна е седмицата, в която попада броят изминали дни.
 *
 * @param createdAt - ISO стринг с датата на създаване на прогнозата
 * @param milestoneWeek - Номер на седмицата на етапа (напр. `1` за първа седмица)
 * @returns `true` ако текущият ден попада в рамките на зададената седмица
 */
export function isMilestoneCurrent(createdAt: string, milestoneWeek: number): boolean {
  const daysElapsed = getPrognosisDaysElapsed(createdAt);
  return daysElapsed >= (milestoneWeek - 1) * 7 && daysElapsed < milestoneWeek * 7;
}
