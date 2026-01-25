import { ChartBar, Activity, Utensils, Layers } from "lucide-react";
import { Feature } from "./types";

export const features: Feature[] = [
  {
    icon: ChartBar,
    title: "Здравно табло",
    description:
      "Проследявайте BMI, съотношение на телесни мазнини и мускулна маса, BMR, TDEE и следвайте препоръчителната цел",
  },
  {
    icon: Activity,
    title: "Тренировъчни препоръки",
    description: "Съставете персонализирани програми за фитнес, калистеника и йога с видео демонстрации",
  },
  {
    icon: Utensils,
    title: "Хранителни режими",
    description: "Изградете индивидуални режими за хранене, съобразени с калориите и макронутриентите за вашите цели",
  },
  {
    icon: Layers,
    title: "Коригиране на стойката",
    description: "Изпълнявайте специализирани упражнения с Orbbec Astra+ камера и гласов асистент",
  },
];
