"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
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
  getCompletedDays,
} from "@/lib/db/clients/get";
import { WorkoutExercisesCard } from "@/app/(main)/dashboard/stats/components/workout-exercises-card";
import { NutrientStatsCard } from "@/app/(main)/dashboard/stats/components/nutrient-stats-cards";
import { MacronutrientChartCard } from "@/app/(main)/dashboard/stats/components/macronutrient-chart-card";
import { PageNavigation } from "@/app/(main)/dashboard/stats/components/page-navigation";
import { sortDaysByNumber, getCurrentDay } from "./helper_functions";
import { BMIData, BodyFatData, GoalData, NutrientData, WorkoutData, BodyFatWeightEntry, NutritionData } from "./types";
import { MealPlanCard } from "@/app/(main)/dashboard/stats/components/meal-plan-card";

export default function HomePage() {
  const [uid, setUID] = useState<string | null>(null);
  const [bmiData, setBmiData] = useState<BMIData | null>(null);
  const [bodyFatData, setBodyFatData] = useState<BodyFatData | null>(null);
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const [nutrientData, setNutrientData] = useState<NutrientData | null>(null);
  const [chartData, setChartData] = useState<BodyFatWeightEntry[] | null>(null);
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [workoutDaysCompleted, setWorkoutDaysCompleted] = useState<string[] | null>(null);
  const [nutritionDaysCompleted, setNutritionDaysCompleted] = useState<string[] | null>(null);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealthData() {
      try {
        const metrics = await fetchUserMetrics(true);
        const chartData = await fetchBodyFatWeightHistory();
        const workout = await fetchUserWorkoutOverview();
        const nutrition = await fetchUserNutritionOverview();

        setUID(metrics.userId);
        setBmiData(metrics.bmiData);
        setBodyFatData(metrics.bodyFatData);
        setGoalData(metrics.goalData);
        setNutrientData(metrics.nutrientData);
        setChartData(chartData);
        setWorkoutData(workout);
        setNutritionData(nutrition);
        console.log("workout", workout);
      } catch (error) {
        console.error("Еrror fetching health data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHealthData();
  }, []);

  useEffect(() => {
    if (!workoutData || !nutritionData) {
      return;
    }

    async function loadCurrentDays() {
      try {
        const workoutId = workoutData!.day_recommendations[0]!.generation_id;
        const nutritionId = nutritionData!.day_recommendations[0]!.generation_id;

        const workoutRes = await getCompletedDays("workout", workoutId);
        const nutritionRes = await getCompletedDays("meal", nutritionId);

        setWorkoutDaysCompleted(workoutRes.completedDays);
        setNutritionDaysCompleted(nutritionRes.completedDays);
      } catch (e) {
        console.error("Failed to fetch current days", e);
      }
    }

    loadCurrentDays();
  }, [workoutData, nutritionData]);

  if (loading || !workoutData || !nutritionData || !workoutDaysCompleted || !nutritionDaysCompleted) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  const sortedDaysWorkout = sortDaysByNumber(workoutData.day_recommendations);
  const sortedDaysNutrition = sortDaysByNumber(nutritionData.day_recommendations);

  const currentDayWorkout = getCurrentDay(sortedDaysWorkout, workoutDaysCompleted!);
  const currentDayNutrition = getCurrentDay(sortedDaysNutrition, nutritionDaysCompleted!);

  const currentDayExercises = workoutData.day_exercises.filter((ex) => ex.day === currentDayWorkout.day);
  const currentDayMeals = nutritionData.day_meals.filter((ex) => ex.day === currentDayNutrition.day);

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
            Наблюдавайте телесния си състав и проследявайте фитнес напредъка си
          </p>

          <PageNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </motion.div>

      {currentPage === 1 && bmiData && bodyFatData && goalData && uid && nutrientData && chartData && (
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1"
            >
              <BodyCompositionCard bodyFatData={bodyFatData} />
              <NutrientStatsCard nutrientData={nutrientData} />
              <MacronutrientChartCard nutrientData={nutrientData} />
            </motion.div>
            {/*<WorkoutExercisesCard*/}
            {/*  day={currentDayWorkout.day}*/}
            {/*  exercises={currentDayExercises}*/}
            {/*  dayRecommendation={currentDayWorkout}*/}
            {/*  userId={uid}*/}
            {/*  generationId={currentDayWorkout.generation_id}*/}
            {/*/>*/}
            <MealPlanCard
              userId={uid}
              generationId={currentDayNutrition.generation_id}
              day={currentDayNutrition.day}
              meals={currentDayMeals}
              dayRecommendation={currentDayNutrition}
              onDayComplete={(nextDay) => console.log("Moving to:", nextDay)}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HealthProgressChart chartData={chartData} />
          </motion.div>
        </>
      )}

      {currentPage === 2 && uid && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6"
        >
          <WorkoutExercisesCard
            day={currentDayWorkout.day}
            exercises={currentDayExercises}
            dayRecommendation={currentDayWorkout}
            userId={uid}
            generationId={currentDayWorkout.generation_id}
          />
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Alert className="bg-destructive/10 group border-destructive/50 relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300">
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
