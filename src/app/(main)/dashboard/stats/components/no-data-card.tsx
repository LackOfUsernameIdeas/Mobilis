"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Flame,
  Dumbbell,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NoDataCardProps {
  type: "workout" | "meal";
}

const CONFIG = {
  workout: {
    title: "Няма активен тренировъчен план",
    icon: Dumbbell,
    description: "В момента нямате създаден тренировъчен план.",
    intro: "За да започнете да проследявате тренировките си по дни, е необходимо първо да създадете тренировъчен план.",
    points: [
      { text: "Персонализирани упражнения по дни", icon: CalendarDays },
      { text: "Проследяване на напредъка", icon: TrendingUp },
      { text: "Отбелязване на завършени тренировки", icon: CheckCircle2 },
    ],
    href: "/dashboard/workout_recommendations",
    cta: "Създай тренировъчен план",
  },
  meal: {
    title: "Няма активен хранителен план",
    icon: UtensilsCrossed,
    description: "В момента нямате създаден хранителен план.",
    intro:
      "За да следите храненията си и дневния прием на калории и хранителни вещества, е необходимо първо да създадете хранителен план.",
    points: [
      { text: "Дневни хранения по график", icon: Clock },
      { text: "Контрол на калории и макронутриенти", icon: Target },
      { text: "Проследяване на хранителния напредък", icon: Flame },
    ],
    href: "/dashboard/nutrition_plans",
    cta: "Създай хранителен план",
  },
} as const;

export function NoDataCard({ type }: NoDataCardProps) {
  const config = CONFIG[type];
  const MainIcon = config.icon;

  return (
    <Card className="border-muted-foreground/40 bg-card/50 flex h-[36rem] flex-col border-2 border-dashed">
      <CardHeader className="gap-4 space-y-9 pb-10">
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="h-8 w-8" />
            <CardTitle className="text-2xl">{config.title}</CardTitle>
          </div>
          <div className="bg-muted/50 rounded-full p-2">
            <MainIcon className="text-muted-foreground h-5 w-5" />
          </div>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-8 overflow-hidden">
        <p className="text-muted-foreground text-sm leading-relaxed">{config.intro}</p>

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {config.points.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.text} className="bg-muted/30 flex items-center gap-3 rounded-lg p-3">
                <div className="bg-primary/10 flex-shrink-0 rounded-md p-1.5">
                  <Icon className="text-primary h-4 w-4" />
                </div>
                <span className="text-foreground text-sm">{point.text}</span>
              </div>
            );
          })}
        </div>

        <div className="border-muted-foreground/20 flex-shrink-0 border-t pt-4">
          <Link href={config.href}>
            <Button className="w-full">{config.cta}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
