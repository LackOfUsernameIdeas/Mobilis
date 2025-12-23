"use client";

import { useEffect, useState } from "react";
import NutritionForm from "./components/nutrition-form";
import ResultsDisplay from "./components/results-display";
import { Loader } from "../_components/loader";
import { createClient } from "@/app/utils/supabase/client";

type FormAnswers = Record<string, any>;

export default function Page() {
  const [submittedAnswers, setSubmittedAnswers] = useState<FormAnswers | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);

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
          setPageLoading(false);
          return;
        }

        // Fetch from your API endpoint that queries the database
        const [responseMetrics, responseMeasurements] = await Promise.all([
          fetch(`/api/user-metrics?userId=${user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch(`/api/user-measurements?userId=${user.id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
        ]);

        if (!responseMetrics.ok || !responseMeasurements.ok) {
          throw new Error("Failed to fetch metrics or measurements data");
        }

        const [metrics, measurements] = await Promise.all([responseMetrics.json(), responseMeasurements.json()]);

        setUserStats({
          gender: measurements.gender,
          height: measurements.height,
          weight: measurements.weight,
          activityLevel: measurements.activity_level,
          bmi: metrics.bmiData.bmi,
          bodyFat: metrics.bodyFatData.bodyFat,
          bodyFatMass: metrics.bodyFatData.bodyFatMass,
          leanBodyMass: metrics.bodyFatData.leanBodyMass,
        });
      } catch (error) {
        console.error("[v0] Error fetching health data:", error);
      } finally {
        setPageLoading(false);
      }
    }

    fetchHealthData();
  }, []);

  const handleFormSubmit = (answers: FormAnswers) => {
    setSubmittedAnswers(answers);
  };

  const handleReset = () => {
    setSubmittedAnswers(null);
  };

  if (pageLoading) {
    return (
      <div className="bg-background flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen justify-center p-4">
      <div className="w-full">
        {submittedAnswers ? (
          <ResultsDisplay category="gym" answers={submittedAnswers} userStats={userStats} onReset={handleReset} />
        ) : (
          <NutritionForm usersWeight={userStats.weight} onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  );
}
