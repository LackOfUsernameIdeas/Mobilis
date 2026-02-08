import { Utensils, ChartBar, Layers, Activity, Mail, type LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    label: "Основни страници",
    items: [
      {
        title: "Здравно табло",
        url: "/dashboard/stats",
        icon: ChartBar,
      },
      {
        title: "Тренировъчни препоръки",
        url: "/dashboard/workout_recommendations",
        icon: Activity,
      },
      {
        title: "Хранителни режими",
        url: "/dashboard/nutrition_plans",
        icon: Utensils,
      },
      {
        title: "Програми",
        url: "/dashboard/specialized_programs",
        icon: Layers,
        subItems: [{ title: "За стойката", url: "/dashboard/specialized_programs/pose_correction", newTab: false }],
      },
      {
        title: "Контакти",
        url: "/dashboard/contact",
        icon: Mail,
      },
    ],
  },
];
