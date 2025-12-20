import { Fingerprint, LayoutDashboard, ChartBar, Banknote, Layers, Activity, type LucideIcon } from "lucide-react";

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
    label: "Dashboards",
    items: [
      {
        title: "Default",
        url: "/dashboard/default",
        icon: LayoutDashboard,
      },
      {
        title: "Статистики",
        url: "/dashboard/stats",
        icon: ChartBar,
      },
      {
        title: "Тренировъчни препоръки",
        url: "/dashboard/workout_recommendations",
        icon: Activity,
      },
      {
        title: "Програми",
        url: "/dashboard/specialized_programs",
        icon: Layers,
        subItems: [{ title: "За стойката", url: "/dashboard/specialized_programs/pose_correction", newTab: false }],
      },
      {
        title: "CRM",
        url: "/dashboard/crm",
        icon: ChartBar,
      },
      {
        title: "Finance",
        url: "/dashboard/finance",
        icon: Banknote,
      },
    ],
  },
];
