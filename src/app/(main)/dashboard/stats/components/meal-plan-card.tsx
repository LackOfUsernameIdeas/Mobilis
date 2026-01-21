"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import MealModal from "@/app/(main)/dashboard/nutrition_plans/components/meal-modal";
import { getDayProgress } from "@/lib/db/clients/get";
import { getOrCreateSession, markItemProgress, moveToNextDay } from "@/lib/db/clients/post";
import { DayRecommendationNutrition, Status, Meal, MealItemProgress } from "@/app/(main)/dashboard/stats/types";
import { DAY_LABELS, DAY_ORDER, MEAL_TYPE_LABELS } from "@/app/(main)/dashboard/stats/constants";
import { formatMeal } from "@/app/(main)/dashboard/stats/helper_functions";

interface MealPlanCardProps {
  userId: string;
  generationId: number;
  day: string;
  meals: Meal[];
  dayRecommendation?: DayRecommendationNutrition;
  onDayComplete?: (nextDay: string) => void;
}

export function MealPlanCard({
  userId,
  generationId,
  day,
  meals,
  dayRecommendation,
  onDayComplete,
}: MealPlanCardProps) {
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [mealStatus, setMealStatus] = useState<Record<number, Status>>(() =>
    meals.reduce((acc, meal) => ({ ...acc, [meal.id]: "pending" }), {}),
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const session = await getOrCreateSession("meal", userId, generationId, day);
        setSessionId(session.id);

        const dayExerciseIds = meals.map((m) => m.id);
        const progress: MealItemProgress[] = await getDayProgress("meal", session.id, dayExerciseIds);

        const statusMap: Record<number, Status> = {};
        meals.forEach((m) => {
          const progressEntry = progress.find((p) => p.day_meal_id === m.id);
          statusMap[m.id] = progressEntry ? progressEntry.status : "pending";
        });

        setMealStatus(statusMap);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId, generationId, day, meals]);

  const totalCalories = meals.reduce((sum, meal) => sum + (meal.nutrition_meals?.calories || 0), 0);

  const handleMealClick = (meal: Meal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (mealId: number, status: Status) => {
    if (!sessionId || status === "pending") return;

    try {
      setMealStatus((prev) => ({ ...prev, [mealId]: status }));

      await markItemProgress("meal", sessionId, userId, mealId, status);
    } catch (error) {
      console.error("Error updating meal status:", error);
      setMealStatus((prev) => ({ ...prev, [mealId]: "pending" }));
    }
  };

  const handleNextDay = async () => {
    if (!sessionId || !allCompleted) return;

    try {
      const currentDayIndex = DAY_ORDER.indexOf(day.toLowerCase());
      const nextDayIndex = (currentDayIndex + 1) % DAY_ORDER.length;
      const nextDay = DAY_ORDER[nextDayIndex];

      await moveToNextDay("meal", sessionId, nextDay);

      if (onDayComplete) {
        onDayComplete(nextDay);
      }
    } catch (error) {
      console.error("Error moving to next day:", error);
    }
  };

  const getCardStyles = (status: Status) => {
    switch (status) {
      case "completed":
        return `
        bg-green-50 border-green-400
        dark:bg-emerald-500/10 dark:border-emerald-500/40 dark:text-emerald-200
      `;
      case "skipped":
        return `
        bg-red-50 border-red-400 line-through text-muted-foreground
        dark:bg-rose-500/10 dark:border-rose-500/40 dark:text-rose-300/70
      `;
      default:
        return `
        bg-muted/50 border-chart-1 hover:bg-muted
        dark:bg-muted/30 dark:border-border dark:hover:bg-muted/50
      `;
    }
  };

  const allCompleted = Object.values(mealStatus).every((status) => status === "completed" || status === "skipped");

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Зареждане...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base font-medium">{DAY_LABELS[day.toLowerCase()] || day} - Хранене</CardTitle>
          </div>
          <Badge variant="outline">{meals.length} ястия</Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Flame className="h-3 w-3" />
          {totalCalories} kcal общо
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {meals.map((meal, index) => {
            const status = mealStatus[meal.id] || "pending";
            const mealData = meal.nutrition_meals;

            return (
              <div
                key={index}
                className={`cursor-pointer rounded-r-lg border-l-2 p-3 transition ${getCardStyles(status)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1" onClick={() => handleMealClick(meal)}>
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{meal.name}</p>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meal.time}
                      </span>
                      {mealData && (
                        <>
                          <span>•</span>
                          <span>{mealData.calories} kcal</span>
                          <span>•</span>
                          <span>П: {mealData.protein}г</span>
                          <span>В: {mealData.carbs}г</span>
                          <span>М: {mealData.fats}г</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {MEAL_TYPE_LABELS[meal.meal_type?.toLowerCase()] || meal.meal_type}
                    </Badge>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(meal.id, "completed");
                        }}
                        className={`rounded-full px-2 py-0.5 text-xs transition ${
                          status === "completed"
                            ? "bg-green-500 text-white"
                            : "bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                        }`}
                      >
                        ✔
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(meal.id, "skipped");
                        }}
                        className={`rounded-full px-2 py-0.5 text-xs transition ${
                          status === "skipped"
                            ? "bg-red-500 text-white"
                            : "bg-red-100 text-red-700 dark:bg-rose-500/20 dark:text-rose-300"
                        }`}
                      >
                        ✖
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            disabled={!allCompleted}
            onClick={handleNextDay}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              allCompleted
                ? "bg-primary hover:bg-chart-4 text-white"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            Следващ ден
          </button>
        </div>

        {selectedMeal && <MealModal open={isModalOpen} onOpenChange={setIsModalOpen} meal={formatMeal(selectedMeal)} />}
      </CardContent>
    </Card>
  );
}
