"use client";

import { useEffect, useState } from "react";
import CategorySelector from "./components/fitness/category-selector";
import GymCalisthenicsForm from "./components/fitness/gym-calisthenics-form";
import YogaForm from "./components/fitness/yoga-form";
import ResultsDisplay from "./components/fitness/results-display";
import { createClient } from "@/app/utils/supabase/client";

type Category = "gym" | "calisthenics" | "yoga" | null;
type FormAnswers = Record<string, any>;

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<FormAnswers | null>(null);
  const [userStats, setUserStats] = useState<any>(null);

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
          bmi: metrics.bmiData.bmi,
          bodyFat: metrics.bodyFatData.bodyFat,
          bodyFatMass: metrics.bodyFatData.bodyFatMass,
          leanBodyMass: metrics.bodyFatData.leanBodyMass,
        });
      } catch (error) {
        console.error("[v0] Error fetching health data:", error);
      }
    }

    fetchHealthData();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSubmittedAnswers(null);
  };

  const handleFormSubmit = (answers: FormAnswers) => {
    setSubmittedAnswers(answers);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSubmittedAnswers(null);
  };

  const handleGoBack = () => {
    setSelectedCategory(null);
    setSubmittedAnswers(null);
  };

  return (
    <div className="bg-background text-foreground flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {!selectedCategory || submittedAnswers ? (
          <div className="flex flex-col gap-4 md:gap-6">
            {submittedAnswers && (
              <ResultsDisplay
                category={selectedCategory!}
                answers={submittedAnswers}
                userStats={userStats}
                onReset={handleReset}
              />
            )}
            {!submittedAnswers && <CategorySelector onSelectCategory={handleCategorySelect} />}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {selectedCategory === "gym" && (
              <GymCalisthenicsForm isCategoryGym={true} onSubmit={handleFormSubmit} onBack={handleGoBack} />
            )}
            {selectedCategory === "calisthenics" && (
              <GymCalisthenicsForm isCategoryGym={false} onSubmit={handleFormSubmit} onBack={handleGoBack} />
            )}
            {selectedCategory === "yoga" && <YogaForm onSubmit={handleFormSubmit} onBack={handleGoBack} />}
          </div>
        )}
      </div>
    </div>
  );
}
