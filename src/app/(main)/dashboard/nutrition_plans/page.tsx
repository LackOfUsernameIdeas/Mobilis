"use client";

import { useEffect, useState } from "react";
import NutritionForm from "./components/nutrition-form";
import ResultsDisplay from "./components/results-display";
import { Loader } from "../_components/loader";
import { fetchUserHealthData } from "@/lib/db/clients/get";
import type { FormAnswers, UserStats } from "./types";
import { useAuth } from "@/contexts/auth-context";
import { Unauthorized } from "@/app/(main)/dashboard/_components/unauthorized";

export default function NutritionPlansPage() {
  const { user, loading: authLoading } = useAuth();
  const [submittedAnswers, setSubmittedAnswers] = useState<FormAnswers | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthData() {
      if (!user) return;

      try {
        const healthData = await fetchUserHealthData(user.id);

        setUserStats(healthData);
      } catch (error) {
        console.error("Error initializing page:", error);
      } finally {
        setLoading(false);
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

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader text={authLoading ? "Автентикация..." : "Зареждане..."} />
      </div>
    );
  }

  if (!user) {
    return <Unauthorized />;
  }

  return (
    <div className="bg-background text-foreground flex min-h-screen justify-center p-4">
      <div className="w-full">
        {submittedAnswers ? (
          <ResultsDisplay userId={user.id} answers={submittedAnswers} userStats={userStats} onReset={handleReset} />
        ) : (
          <NutritionForm usersStats={userStats} onSubmit={handleFormSubmit} />
        )}
      </div>
    </div>
  );
}
