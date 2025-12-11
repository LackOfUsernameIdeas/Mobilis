"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GoalRecommendation } from "@/server/recommendedGoal";

interface HealthDetailsProps {
  goalData: GoalRecommendation;
}

export function HealthDetails({ goalData }: HealthDetailsProps) {
  const getCategoryDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      severe_thin: "Severe thinness indicates a critical health risk requiring immediate medical attention.",
      moderate_thin: "Moderate thinness suggests underweight status that should be addressed.",
      mild_thin: "Mild thinness indicates slightly below normal weight range.",
      normal: "Normal weight range associated with optimal health outcomes.",
      overweight: "Overweight status may increase health risks if body fat is elevated.",
      obese_1: "Class I obesity indicates moderate health risks.",
      obese_2: "Class II obesity indicates severe health risks.",
      obese_3: "Class III obesity indicates very severe health risks requiring medical intervention.",
    };
    return descriptions[category] || "No description available.";
  };

  const getBodyFatDescription = (category: string, gender = "male") => {
    const descriptions: Record<string, string> = {
      critical: "Critically low body fat poses serious health risks.",
      essential: "Essential body fat levels required for basic physiological function.",
      athletes: "Athletic body fat levels typical of competitive athletes.",
      fitness: "Fitness-oriented body fat levels associated with good health.",
      average: "Average body fat levels within acceptable health range.",
      obese: "Elevated body fat levels associated with increased health risks.",
    };
    return descriptions[category] || "No description available.";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Assessment Details</CardTitle>
        <CardDescription>Comprehensive breakdown of your health metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">BMI Category</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {getCategoryDescription(goalData.bmiCategory)}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-base font-semibold">Body Fat Category</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {getBodyFatDescription(goalData.bodyFatCategory)}
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h3 className="text-base font-semibold">Recommended Action</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{goalData.reasoning}</p>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">BMI Value</p>
            <p className="font-semibold tabular-nums">{goalData.bmi.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Body Fat</p>
            <p className="font-semibold tabular-nums">{goalData.bodyFatPercentage}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
