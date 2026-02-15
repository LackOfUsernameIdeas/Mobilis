"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Dumbbell, UtensilsCrossed } from "lucide-react";
import { HealthProgressChart } from "@/app/(main)/dashboard/stats/components/health-progress-chart";
import { HealthStatsCards } from "@/app/(main)/dashboard/stats/components/health-stats-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Loader } from "../_components/loader";
import { BodyCompositionCard } from "@/app/(main)/dashboard/stats/components/body-composition-card";
import {
  fetchUserMetrics,
  fetchUserWorkoutOverview,
  fetchUserNutritionOverview,
  fetchBodyFatWeightHistory,
} from "@/lib/db/clients/get";
import { WorkoutExercisesCard } from "@/app/(main)/dashboard/stats/components/workout-exercises-card";
import { NutrientStatsCard } from "@/app/(main)/dashboard/stats/components/nutrient-stats-cards";
import { MacronutrientChartCard } from "@/app/(main)/dashboard/stats/components/macronutrient-chart-card";
import { BMIData, BodyFatData, GoalData, NutrientData, WorkoutData, BodyFatWeightEntry, NutritionData } from "./types";
import { MealPlanCard } from "@/app/(main)/dashboard/stats/components/meal-plan-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Unauthorized } from "@/app/(main)/dashboard/_components/unauthorized";

type ActivePlan = "workout" | "nutrition";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [bodyFatData, setBodyFatData] = useState<BodyFatData | null>(null);
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [nutrientData, setNutrientData] = useState<NutrientData | null>(null);
  const [chartData, setChartData] = useState<BodyFatWeightEntry[] | null>(null);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [activePlan, setActivePlan] = useState<ActivePlan>("workout");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealthData() {
      if (!user) return;

      try {
        const metrics = await fetchUserMetrics(user.id);
        const chartData = await fetchBodyFatWeightHistory(user.id);
        const workout = await fetchUserWorkoutOverview(user.id);
        const nutrition = await fetchUserNutritionOverview(user.id);

        setBmiData(metrics.bmiData);
        setBodyFatData(metrics.bodyFatData);
        setGoalData(metrics.goalData);
        setNutrientData(metrics.nutrientData);
        setChartData(chartData);
        setWorkoutData(workout);
        setNutritionData(nutrition);
        console.log("workout", workout);
        console.log("nutrition", nutrition);
      } catch (error) {
        console.error("Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHealthData();
  }, [user]);

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

  const hasWorkout = !!workoutData && activePlan === "workout";
  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Здравно табло</h1>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted-foreground text-lg text-pretty md:text-xl">
            Разгледайте телесния си състав и проследявайте напредъка си
          </p>
        </div>
      </motion.div>

      {bmiData && bodyFatData && goalData && user.id && nutrientData && chartData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="gap-6"
          >
            <HealthStatsCards bmiData={bmiData} bodyFatData={bodyFatData} goalData={goalData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            <motion.div className="grid gap-6">
              <BodyCompositionCard bodyFatData={bodyFatData} />
              <NutrientStatsCard nutrientData={nutrientData} />

              {hasWorkout && <MacronutrientChartCard nutrientData={nutrientData} />}
            </motion.div>
            <div className="row-start-2 grid gap-4 sm:row-auto">
              <div className="flex gap-1 rounded-lg border p-1">
                <Button
                  variant={activePlan === "workout" ? "default" : "ghost"}
                  className={`${!(activePlan === "workout") && "hover:bg-primary/75 dark:hover:bg-primary/50"} flex-1 cursor-pointer`}
                  onClick={() => setActivePlan("workout")}
                >
                  <Dumbbell />
                  Тренировки
                </Button>
                <Button
                  variant={activePlan === "nutrition" ? "default" : "ghost"}
                  className={`${!(activePlan === "nutrition") && "hover:bg-primary/75 dark:hover:bg-primary/50"} flex-1 cursor-pointer`}
                  onClick={() => setActivePlan("nutrition")}
                >
                  <UtensilsCrossed />
                  Хранене
                </Button>
              </div>

              <motion.div
                key={activePlan}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activePlan === "workout" ? (
                  <WorkoutExercisesCard workoutData={workoutData} userId={user.id} />
                ) : (
                  <MealPlanCard nutritionData={nutritionData} userId={user.id} />
                )}
              </motion.div>
            </div>
            {!hasWorkout && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="col-span-2"
              >
                <MacronutrientChartCard nutrientData={nutrientData} />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {chartData.length > 1 && <HealthProgressChart chartData={chartData} />}
          </motion.div>
        </>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Alert
          variant="destructive"
          className="border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-200"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="leading-relaxed text-pretty">
            Тези стойности са приблизителни и може да е необходима преоценка от здравен специалист, за да се адаптират
            към индивидуалните ви нужди. В никакъв случай не поощряваме прескачането на лекарска препоръка.
          </AlertDescription>
        </Alert>
      </motion.div>
    </div>
  );
}
