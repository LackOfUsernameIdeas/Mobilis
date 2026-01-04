"use client";

import { useEffect, useState } from "react";
import NutritionForm from "./components/nutrition-form";
import ResultsDisplay from "./components/results-display";
import { Loader } from "../_components/loader";
import { fetchUserHealthData } from "@/lib/db/clients/get";
import type { FormAnswers, UserStats } from "./types";

export default function NutritionPlansPage() {
  const [submittedAnswers, setSubmittedAnswers] = useState<FormAnswers | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthData() {
      try {
        const healthData = await fetchUserHealthData();

        setUserStats(healthData);
      } catch (error) {
        console.error("Error initializing page:", error);
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
          <ResultsDisplay category="nutrition" answers={submittedAnswers} userStats={userStats} onReset={handleReset} />
        ) : (
          <NutritionForm usersStats={userStats} onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  );
}
