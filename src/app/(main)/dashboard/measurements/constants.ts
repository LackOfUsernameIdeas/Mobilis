import type { ActivityLevelOption, ValidationLimits } from "./types";

export const STORAGE_KEY = "user_last_measurements";

export const LIMITS: ValidationLimits = {
  height: { min: 100, max: 300 }, // cm
  weight: { min: 30, max: 300 }, // kg
  age: { min: 10, max: 100 }, // years
  neck: { min: 20, max: 100 }, // cm
  waist: { min: 40, max: 300 }, // cm
  hip: { min: 50, max: 300 }, // cm
};

export const ACTIVITY_LEVELS: ActivityLevelOption[] = [
  {
    value: "sedentary",
    label: "Заседнал начин на живот",
    description:
      "Малко или никаква физическа активност. Предимно седяща работа, при която свободното време минава основно на закрито",
  },
  {
    value: "light",
    label: "Лека физическа активност",
    description:
      "Леки упражнения 1-3 пъти седмично или работа, свързана с движение и/или стоене прав през по-голямата част от деня",
  },
  {
    value: "moderate",
    label: "Умерена физическа активност",
    description:
      "Редовни тренировки със средна интензивност 3-5 пъти седмично, например бягане, колоездене или плуване",
  },
  {
    value: "active",
    label: "Висока физическа активност",
    description: "Интензивни тренировки или спорт с умерена до висока натовареност 6-7 пъти седмично",
  },
  {
    value: "very_active",
    label: "Много висока физическа активност",
    description: "Много интензивни тренировки, по две тренировки дневно или работа, изискваща тежък физически труд",
  },
];

export const FIELD_NAMES = {
  height: "Височината",
  weight: "Теглото",
  age: "Възрастта",
  neck: "Врата",
  waist: "Талията",
  hip: "Таза",
} as const;
