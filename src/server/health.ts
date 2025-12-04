/**
 * 1. Категории на BMI
 * - Потвърдени като точни спрямо актуалните стандарти на WHO/CDC.
 * - Оригиналните категории са вече правилни.
 *
 * 2. Формули за телесни мазнини
 * - Използват се стандартните формули на U.S. Navy (Hodgdon & Beckett, 1984).
 *
 * 3. Формула за перфектно тегло
 * - Използва се формулата на Robinson:
 * - Мъже: 52 кг + 1.90 кг за всеки инч над 5 фута
 * - Жени: 49 кг + 1.7 кг за всеки инч над 5 фута
 */

export function getBMICategory(bmi: number): string {
  if (bmi < 16) return "Сериозно недохранване"; // Severe thinness (BMI < 16)
  if (bmi < 17) return "Средно недохранване"; // Moderate thinness (BMI 16-16.99)
  if (bmi < 18.5) return "Леко недохранване"; // Mild thinness (BMI 17-18.49)
  if (bmi < 25) return "Нормално"; // Normal weight (BMI 18.5-24.9)
  if (bmi < 30) return "Наднормено тегло"; // Overweight/Pre-obese (BMI 25-29.9)
  if (bmi < 35) return "Затлъстяване I Клас"; // Obesity Class I (BMI 30-34.9)
  if (bmi < 40) return "Затлъстяване II Клас"; // Obesity Class II (BMI 35-39.9)
  return "Затлъстяване III Клас"; // Obesity Class III (BMI ≥ 40)
}

export function calculateBMI(height: number, weight: number) {
  const h = height / 100; // Конвертиране от см в метри
  const bmi = weight / (h * h);
  return {
    bmi: bmi.toFixed(2),
    health: getBMICategory(bmi),
    healthy_bmi_range: "18.5 - 25",
  };
}

export function calculatePerfectWeight(height: number, gender: string, weight: number) {
  const heightInInches = height / 2.54; // Конвертиране от см в инчове
  const inchesOver5Feet = heightInInches - 60; // 60 инча = 5 фута
  let p: number | null;

  if (gender === "male") {
    // Robinson формула за мъже: 52 кг + 1.90 кг за всеки инч над 5 фута
    p = 52 + 1.9 * inchesOver5Feet;
  } else if (gender === "female") {
    // Robinson формула за жени: 49 кг + 1.7 кг за всеки инч над 5 фута
    p = 49 + 1.7 * inchesOver5Feet;
  } else {
    p = null;
  }

  if (p === null) throw new Error("Невалиден пол");

  const perfect = parseFloat(p.toFixed(2));
  const diff = perfect - weight;

  return {
    perfectWeight: perfect,
    differenceFromPerfectWeight: {
      difference: parseFloat(Math.abs(diff).toFixed(2)),
      isUnderOrAbove: weight > perfect ? "above" : "under",
    },
  };
}

export function calculateBodyFat(
  height: number,
  gender: string,
  weight: number,
  neck: number,
  waist: number,
  hip?: number,
) {
  let bf: number;

  if (gender === "male") {
    // Формула за мъже: BF% = 86.010 × log10(талия - врат) - 70.041 × log10(височина) + 36.76
    bf = 86.01 * Math.log10(waist - neck) - 70.041 * Math.log10(height) + 36.76;
  } else if (gender === "female") {
    if (hip === undefined) {
      throw new Error("Необходим е обем на ханша за изчисляване на телесни мазнини при жени");
    }
    // Формула за жени: BF% = 163.205 × log10(талия + ханш - врат) - 97.684 × log10(височина) - 78.387
    bf = 163.205 * Math.log10(waist + hip - neck) - 97.684 * Math.log10(height) - 78.387;
  } else {
    throw new Error("Невалиден пол");
  }

  // Ограничаване на телесните мазнини в реалистичен диапазон (3-60%)
  bf = Math.max(3, Math.min(60, bf));

  const fatMass = weight * (bf / 100);
  const leanMass = weight - fatMass;

  return {
    bodyFat: parseFloat(bf.toFixed(2)),
    bodyFatMass: parseFloat(fatMass.toFixed(2)),
    leanBodyMass: parseFloat(leanMass.toFixed(2)),
  };
}
