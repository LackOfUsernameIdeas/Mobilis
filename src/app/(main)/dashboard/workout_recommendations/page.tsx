"use client";

import { useState } from "react";
import CategorySelector from "./components/fitness/category-selector";
import GymCalisthenicsForm from "./components/fitness/gym-calisthenics-form";
import YogaForm from "./components/fitness/yoga-form";
import RunningForm from "./components/fitness/running-form";
import ResultsDisplay from "./components/fitness/results-display";

type Category = "gym" | "calisthenics" | "yoga" | "running" | null;
type FormAnswers = Record<string, any>;

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState<Category>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<FormAnswers | null>(null);

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
                userStats={{
                  gender: "male",
                  height: 185,
                  weight: 95,
                  bmi: "27.76",
                  bodyFat: "26.97",
                  fatMass: "25.62",
                  leanMass: "69.38",
                }}
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
            {selectedCategory === "running" && <RunningForm onSubmit={handleFormSubmit} onBack={handleGoBack} />}
          </div>
        )}
      </div>
    </div>
  );
}
