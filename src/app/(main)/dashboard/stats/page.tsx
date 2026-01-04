"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { HealthProgressChart } from "@/app/(main)/dashboard/stats/components/health-progress-chart";
import { HealthStatsCards } from "@/app/(main)/dashboard/stats/components/health-stats-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Loader } from "../_components/loader";
import { BodyCompositionCard } from "@/app/(main)/dashboard/stats/components/body-composition-card";
import {
  fetchUserMetrics,
  fetchUserMeasurements,
  fetchUserWorkoutOverview,
  fetchBodyFatWeightHistory,
} from "@/lib/db/clients/get";
import { WorkoutExercisesCard } from "@/app/(main)/dashboard/stats/components/workout-exercises-card";
import { NutrientStatsCard } from "@/app/(main)/dashboard/stats/components/nutrient-stats-cards";
import { MacronutrientChartCard } from "@/app/(main)/dashboard/stats/components/macronutrient-chart-card";

export default function HomePage() {
  const [uid, setUID] = useState<any>(null);
  const [bmiData, setBmiData] = useState<any>(null);
  const [bodyFatData, setBodyFatData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [nutrientData, setNutrientData] = useState<any>(null);
  const [measurements, setMeasurements] = useState<any>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [workoutData, setWorkoutData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHealthData() {
      try {
        const metrics = await fetchUserMetrics(true);
        const measurements = await fetchUserMeasurements();
        const chartData = await fetchBodyFatWeightHistory();
        const workout = await fetchUserWorkoutOverview();

        setUID(metrics.userId);
        setBmiData(metrics.bmiData);
        setBodyFatData(metrics.bodyFatData);
        setGoalData(metrics.goalData);
        setNutrientData(metrics.nutrientData);
        setMeasurements(measurements);
        setChartData(chartData);
        setWorkoutData(workout);
      } catch (error) {
        console.error("[v0] Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadHealthData();
  }, []);

  if (loading || !workoutData) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  // temp proof of concept
  const sortedDays = [...workoutData.day_recommendations].sort((a, b) => {
    const aNum = Number(a.day.replace("Ден ", ""));
    const bNum = Number(b.day.replace("Ден ", ""));
    return aNum - bNum;
  });

  const completedDays = ["Ден 1"]; // user finished day 1

  function getCurrentDay(sortedDays: any[], completedDays: string[]) {
    for (const day of sortedDays) {
      if (!completedDays.includes(day.day)) {
        return day;
      }
    }

    return sortedDays[sortedDays.length - 1];
  }

  const currentDay = getCurrentDay(sortedDays, completedDays);

  const currentDayExercises = workoutData.day_exercises.filter((ex) => ex.day === currentDay.day);

  console.log("ts pmo: ", currentDay, currentDayExercises);
  console.log("mes: ", measurements);
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

          {/* PAGINATION INLINE */}
          <div className="ml-auto flex items-center gap-2">
            {[1, 2].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page as 1 | 2)}
                className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all ${
                  currentPage === page
                    ? "bg-muted-foreground text-background shadow-sm"
                    : "bg-muted/20 text-muted-foreground hover:bg-muted/40"
                } `}
              >
                {page === 1 && <ChevronLeft className="h-4 w-4" />}
                <span>Страница {page}</span>
                {page === 2 && <ChevronRight className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {currentPage === 1 && bmiData && bodyFatData && goalData && (
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
              <BodyCompositionCard bodyFatMass={bodyFatData.bodyFatMass} leanBodyMass={bodyFatData.leanBodyMass} />
              <NutrientStatsCard nutrientData={nutrientData} />
              <MacronutrientChartCard
                protein={nutrientData.protein}
                fats={nutrientData.fats}
                carbs={nutrientData.carbs}
              />
            </motion.div>
            <WorkoutExercisesCard
              day={currentDay.day}
              exercises={currentDayExercises}
              userId={uid}
              generationId={currentDay.generation_id}
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

      {currentPage === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid gap-6"
        >
          {/* Add whatever you want here for the second page */}
          {/*<TargetWeightCard currentWeight={measurements?.weight} targetWeight={mockData.targetWeight.target} />*/}
          {/*<MeasurementsCard measurements={measurements} />*/}
          <WorkoutExercisesCard
            day={currentDay.day}
            exercises={currentDayExercises}
            userId={uid}
            generationId={currentDay.generation_id}
          />
          {/*<NextWorkoutCard*/}
          {/*  day={mockData.nextWorkout.day}*/}
          {/*  focus={mockData.nextWorkout.focus}*/}
          {/*  exercises={mockData.nextWorkout.exercises}*/}
          {/*/>*/}
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
