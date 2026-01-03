"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { HealthProgressChart } from "@/app/(main)/dashboard/stats/components/health-progress-chart";
import { HealthStatsCards } from "@/app/(main)/dashboard/stats/components/health-stats-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Loader } from "../_components/loader";
import { BodyCompositionCard } from "@/app/(main)/dashboard/stats/components/body-composition-card";
import { MeasurementsCard } from "@/app/(main)/dashboard/stats/components/measurements-card";
import { TargetWeightCard } from "@/app/(main)/dashboard/stats/components/target-weight-card";
import { NextWorkoutCard } from "@/app/(main)/dashboard/stats/components/next-workout-card";
import { getBrowserClient } from "@/lib/db/clients/browser";

// temp for visual stuff, listed below where to grab from supabase, just ain't done the logic yet
const mockData = {
  measurements: {
    //user_measurements
    neck: 38,
    waist: 82,
    hip: 98,
  },
  targetWeight: {
    current: 78.0, //user_measurements.weight
    target: undefined, //workout_user_preferences.targetWeight
  },
  nextWorkout: {
    //workout_day_recommendations
    day: "Понеделник",
    focus: "Гърди и трицепс",
    exercises: [
      //workout_day_exercises
      { name: "Лег с щанга", sets: 4, reps: "8-10" },
      { name: "Лег с дъмбели на наклон", sets: 3, reps: "10-12" },
      { name: "Разперки с кабел", sets: 3, reps: "12-15" },
      { name: "Разгъвания със скакалки", sets: 3, reps: "10-12" },
      { name: "Френски лег", sets: 3, reps: "10-12" },
    ],
  },
};

export default function HomePage() {
  const [bmiData, setBmiData] = useState<any>(null);
  const [bodyFatData, setBodyFatData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHealthData() {
      try {
        // Get the current user
        const supabase = getBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const response = await fetch(`/api/user-metrics?userId=${user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch health data");
        }

        const metrics = await response.json();

        setBmiData(metrics.bmiData);
        setBodyFatData(metrics.bodyFatData);
        setGoalData(metrics.goalData);
      } catch (error) {
        console.error("[v0] Error fetching health data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchHealthData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-background @container/main flex min-h-screen flex-col gap-6 p-6 md:gap-8 md:p-10 lg:p-12">
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-5xl">Здравно табло</h1>
        <p className="text-muted-foreground text-lg text-pretty md:text-xl">
          Наблюдавайте телесния си състав и проследявайте фитнес напредъка си
        </p>
      </motion.div>

      {bmiData && bodyFatData && goalData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <HealthStatsCards bmiData={bmiData} bodyFatData={bodyFatData} goalData={goalData} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
          >
            <BodyCompositionCard bodyFatMass={bodyFatData.bodyFatMass} leanBodyMass={bodyFatData.leanBodyMass} />
            <TargetWeightCard
              currentWeight={mockData.targetWeight.current}
              targetWeight={mockData.targetWeight.target}
            />
            {/*these are gonna go somewhere else, they're just here temporarily*/}
            {/*<MeasurementsCard*/}
            {/*  neck={mockData.measurements.neck}*/}
            {/*  waist={mockData.measurements.waist}*/}
            {/*  hip={mockData.measurements.hip}*/}
            {/*/>*/}
            {/*<NextWorkoutCard*/}
            {/*  day={mockData.nextWorkout.day}*/}
            {/*  focus={mockData.nextWorkout.focus}*/}
            {/*  exercises={mockData.nextWorkout.exercises}*/}
            {/*/>*/}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <HealthProgressChart />
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
