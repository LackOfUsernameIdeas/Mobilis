"use client";

import { useEffect, useState } from "react";
import CategorySelector from "./components/category-selector";
import GymCalisthenicsForm from "./components/gym-calisthenics-form";
import YogaForm from "./components/yoga-form";
import ResultsDisplay from "./components/results-display";
import { Loader } from "../_components/loader";
import { Category, FormAnswers, UserStats } from "./types";
import { fetchUserHealthData } from "@/lib/db/clients/get";
import { useAuth } from "@/contexts/auth-context";
import { Unauthorized } from "@/app/(main)/dashboard/_components/unauthorized";

export default function WorkoutRecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
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
              <GymCalisthenicsForm
                isCategoryGym={true}
                usersWeight={userStats?.weight}
                usersGoal={userStats?.goal}
                onSubmit={handleFormSubmit}
                onBack={handleGoBack}
              />
            )}
            {selectedCategory === "calisthenics" && (
              <GymCalisthenicsForm
                isCategoryGym={false}
                usersWeight={userStats?.weight}
                usersGoal={userStats?.goal}
                onSubmit={handleFormSubmit}
                onBack={handleGoBack}
              />
            )}
            {selectedCategory === "yoga" && <YogaForm onSubmit={handleFormSubmit} onBack={handleGoBack} />}
          </div>
        )}
      </div>
    </div>
  );
}
