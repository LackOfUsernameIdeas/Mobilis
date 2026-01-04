import type { DayRecommendation } from "./types";

/**
 * Sorts days by extracting the numeric value from "Ден X" format
 */
export function sortDaysByNumber(days: DayRecommendation[]): DayRecommendation[] {
  return [...days].sort((a, b) => {
    const aNum = Number(a.day.replace("Ден ", ""));
    const bNum = Number(b.day.replace("Ден ", ""));
    return aNum - bNum;
  });
}

/**
 * Finds the current incomplete day from the list
 * @param sortedDays - Sorted array of days
 * @param completedDays - Array of completed day names
 * @returns Current incomplete day or last day if all are completed
 */
export function getCurrentDay(sortedDays: DayRecommendation[], completedDays: string[]): DayRecommendation {
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
    "Затлъстяване I Клас": "Затлъстяване клас I - умерени здравни рискове.",
    "Затлъстяване II Клас": "Затлъстяване клас II - сериозни здравни рискове.",
    "Затлъстяване III Клас": "Затлъстяване клас III - много сериозни здравни рискове, изискващи медицинска намеса.",
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
