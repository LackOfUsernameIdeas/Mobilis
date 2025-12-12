"use client";

import { Activity, TrendingUp, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalRecommendation } from "@/server/recommendedGoal";

type BMIResult = {
  bmi: number;
  health: string;
  healthy_bmi_range: "18.5 - 25";
};

type BodyFatResult = {
  bodyFat: number;
  bodyFatMass: number;
  leanBodyMass: number;
};

interface HealthStatsCardsProps {
  bmiData: BMIResult;
  bodyFatData: BodyFatResult;
  goalData: GoalRecommendation;
}

export function HealthStatsCards({ bmiData, bodyFatData, goalData }: HealthStatsCardsProps) {
  const getBMIVariant = (category: string) => {
    if (category === "Normal") return "default";
    if (category.includes("Thinness") || category.includes("Obesity")) return "destructive";
    return "secondary";
  };

  const getBodyFatVariant = (category: string) => {
    if (category === "fitness" || category === "athletes") return "default";
    if (category === "critical" || category === "obese") return "destructive";
    return "secondary";
  };

  const formatBodyFatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Activity className="size-4" />
            Body Mass Index (BMI)
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">{bmiData.bmi}</CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={getBMIVariant(bmiData.health) === "destructive" ? "border-destructive text-destructive" : ""}
            >
              {bmiData.health}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Healthy Range: {bmiData.healthy_bmi_range}</div>
          <div className="text-muted-foreground">Based on height and weight</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            Body Fat Percentage
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
            {bodyFatData.bodyFat}%
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className={
                getBodyFatVariant(goalData.bodyFatCategory) === "destructive"
                  ? "border-destructive text-destructive"
                  : ""
              }
            >
              {formatBodyFatCategory(goalData.bodyFatCategory)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Fat Mass: {bodyFatData.bodyFatMass} kg</div>
          <div className="text-muted-foreground">Lean Mass: {bodyFatData.leanBodyMass} kg</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <Target className="size-4" />
            Recommended Goal
          </CardDescription>
          <CardTitle className="text-2xl font-semibold text-pretty @[250px]/card:text-3xl">
            {goalData.goalName}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-chart-1 text-chart-1">
              {goalData.goal.replace("_", " ").toUpperCase()}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-2 leading-relaxed font-medium">{goalData.reasoning}</div>
        </CardFooter>
      </Card>
    </div>
  );
}
