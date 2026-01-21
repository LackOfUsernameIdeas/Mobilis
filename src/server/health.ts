/**
 * 1. Категории на BMI
 * - Потвърдени като точни спрямо актуалните стандарти на WHO/CDC.
 *
 * 2. Формули за телесни мазнини
 * - Използват се стандартните формули на U.S. Navy (Hodgdon & Beckett, 1984).
 */

export function getBMICategory(bmi: number): string {
  switch (true) {
    case bmi < 16:
      return "Сериозно недохранване"; // Severe thinness (BMI < 16)
    case bmi >= 16 && bmi < 17:
      return "Средно недохранване"; // Moderate thinness (BMI 16–16.99)
    case bmi >= 17 && bmi < 18.5:
      return "Леко недохранване"; // Mild thinness (BMI 17–18.49)
    case bmi >= 18.5 && bmi < 25:
      return "Нормално"; // Normal weight (BMI 18.5–24.99)
    case bmi >= 25 && bmi < 30:
      return "Наднормено тегло"; // Overweight / Pre-obese (BMI 25–29.99)
    case bmi >= 30 && bmi < 35:
      return "Затлъстяване I клас"; // Obesity Class I (BMI 30–34.99)
    case bmi >= 35 && bmi < 40:
      return "Затлъстяване II клас"; // Obesity Class II (BMI 35–39.99)
    default:
      return "Затлъстяване III клас"; // Obesity Class III (BMI ≥ 40)
  }
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
      throw new Error("Необходим е обем на таза за изчисляване на телесни мазнини при жени");
    }
    // Формула за жени: BF% = 163.205 × log10(талия + таз - врат) - 97.684 × log10(височина) - 78.387
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
