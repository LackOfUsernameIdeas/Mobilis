"use client";

import { useState, useEffect } from "react";

import { AlertTriangle } from "lucide-react";

import { HealthDetails } from "@/app/(main)/dashboard/stats/components/health-details";
import { HealthProgressChart } from "@/app/(main)/dashboard/stats/components/health-progress-chart";
import { HealthStatsCards } from "@/app/(main)/dashboard/stats/components/health-stats-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/app/utils/supabase/client";

export default function HomePage() {
  const [bmiData, setBmiData] = useState<any>(null);
  const [bodyFatData, setBodyFatData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthData() {
      try {
        // Get the current user
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        // Fetch from your API endpoint that queries the database
        const response = await fetch(`/api/user-metrics?userId=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch health data");
        }

        const metrics = await response.json();

        setBmiData(metrics.bmiData);
        setBodyFatData(metrics.bodyFatData);
        setGoalData(metrics.goalData);
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

      {bmiData && bodyFatData && goalData && (
        <>
          <HealthStatsCards bmiData={bmiData} bodyFatData={bodyFatData} goalData={goalData} />

          <div className="grid grid-cols-1 gap-6 @5xl/main:grid-cols-2">
            <HealthProgressChart />
            <HealthDetails goalData={goalData} />
          </div>
        </>
      )}

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
    </div>
  );
}
