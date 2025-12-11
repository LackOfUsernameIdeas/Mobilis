"use client";

import { useState, useEffect } from "react";

import { AlertTriangle } from "lucide-react";

import { HealthDetails } from "@/app/(main)/dashboard/stats/components/health-details";
import { HealthProgressChart } from "@/app/(main)/dashboard/stats/components/health-progress-chart";
import { HealthStatsCards } from "@/app/(main)/dashboard/stats/components/health-stats-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Example data - In production, this would come from user input or database
const userData = {
  height: 175, // cm
  weight: 78.5, // kg
  gender: "male" as const,
  neck: 38, // cm
  waist: 85, // cm
  hip: undefined, // only needed for females
};

export default function HomePage() {
  const [bmiData, setBmiData] = useState<any>(null);
  const [bodyFatData, setBodyFatData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthData() {
      try {
        const [bmiResponse, bodyFatResponse, goalResponse] = await Promise.all([
          fetch("/api/health/bmi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ height: userData.height, weight: userData.weight }),
          }),
          fetch("/api/health/body-fat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              height: userData.height,
              gender: userData.gender,
              weight: userData.weight,
              neck: userData.neck,
              waist: userData.waist,
              hip: userData.hip,
            }),
          }),
          fetch("/api/recommended-goal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              height: userData.height,
              weight: userData.weight,
              gender: userData.gender,
              neck: userData.neck,
              waist: userData.waist,
              hip: userData.hip,
            }),
          }),
        ]);

        const [bmi, bodyFat, goal] = await Promise.all([
          bmiResponse.json(),
          bodyFatResponse.json(),
          goalResponse.json(),
        ]);

        setBmiData(bmi);
        setBodyFatData(bodyFat);
        setGoalData(goal);
      } catch (error) {
        console.error("[v0] Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, []);

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-muted-foreground">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Health Dashboard</h1>
        <p className="text-muted-foreground text-lg text-pretty md:text-xl">
          Monitor your body composition metrics and track your fitness progress
        </p>
      </div>

      <Alert
        variant="destructive"
        className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-200"
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="leading-relaxed text-pretty">
          Тези стойности са приблизителни и може да е необходима преоценка от здравен специалист, за да се адаптират към
          индивидуалните ви нужди. В никакъв случай не поощряваме прескачането на лекарска препоръка.
        </AlertDescription>
      </Alert>

      {bmiData && bodyFatData && goalData && (
        <>
          <HealthStatsCards bmiData={bmiData} bodyFatData={bodyFatData} goalData={goalData} />

          <div className="grid grid-cols-1 gap-6 @5xl/main:grid-cols-2">
            <HealthProgressChart />
            <HealthDetails goalData={goalData} />
          </div>
        </>
      )}
    </div>
  );
}
