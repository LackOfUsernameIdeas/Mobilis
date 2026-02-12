"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExerciseModal from "@/app/(main)/dashboard/workout_recommendations/components/exercise-modal";
import { useState, useEffect } from "react";
import { getDayProgress } from "@/lib/db/clients/get";
import { getOrCreateSession, markItemProgress, moveToNextDay } from "@/lib/db/clients/post";
import { Exercise, Status, WorkoutData, WorkoutExerciseProgress } from "../types";
import PrepSection from "@/app/(main)/dashboard/stats/components/prep";
import { formatExercise, getCurrentDayObject, sortDaysByNumber } from "@/app/(main)/dashboard/stats/helper_functions";
import { NoDataCard } from "@/app/(main)/dashboard/stats/components/no-data-card";

interface WorkoutExercisesCardProps {
  userId: string;
  workoutData: WorkoutData | null;
}

export function WorkoutExercisesCard({ workoutData, userId }: WorkoutExercisesCardProps) {
  if (!workoutData) {
    return <NoDataCard type="workout" />;
  }

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentDay, setCurrentDay] = useState<string>("Ден 1");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"current" | "history">("current");
  const [historyDay, setHistoryDay] = useState<string | null>(null);

  const sortedDaysWorkout = sortDaysByNumber(workoutData.day_recommendations);
  const currentDayWorkout = getCurrentDayObject(sortedDaysWorkout, currentDay);
  const maxDay = sortedDaysWorkout.length;
  const exercises = workoutData.day_exercises.filter((ex) => ex.day === currentDayWorkout.day);
  console.log("exercises", exercises);
  console.log("currentDay", currentDay);
  console.log("sortedDaysWorkout", sortedDaysWorkout);
  console.log("currentDayWorkout", currentDayWorkout);
  console.log("maxDay", maxDay);
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const generationId = currentDayWorkout.generation_id;
  const completionKey = `workout-session-completed:${generationId}`;
  const isSessionCompleted = typeof window !== "undefined" && localStorage.getItem(completionKey) === "true";
  const displayDay = viewMode === "history" && historyDay ? historyDay : currentDay;
  const displayDayWorkout = getCurrentDayObject(sortedDaysWorkout, displayDay);
  const displayExercises = workoutData.day_exercises.filter((ex) => ex.day === displayDayWorkout.day);

  if (isSessionCompleted) {
    return <NoDataCard type="workout" />;
  }

  const [exerciseStatus, setExerciseStatus] = useState<Record<number, Status>>(() =>
    exercises.reduce((acc, ex) => ({ ...acc, [ex.id]: "pending" }), {}),
  );
  const { warmup_duration_minutes, warmup_exercises, cooldown_duration_minutes, cooldown_exercises } =
    currentDayWorkout ?? {};

  useEffect(() => {
    if (isSessionCompleted) {
      setIsLoading(false);
      return;
    }

    if (!exercises.length) return;

    const loadProgress = async () => {
      try {
        const session = await getOrCreateSession("workout", userId, generationId, currentDay);

        setSessionId(session.id);

        if (!sessionId && session.current_day !== currentDay) {
          setCurrentDay(session.current_day);
          return;
        }

        const dayWorkoutIds = exercises.map((m) => m.id);
        const progress = await getDayProgress<WorkoutExerciseProgress>("workout", session.id, dayWorkoutIds);

        const statusMap: Record<number, Status> = {};
        exercises.forEach((ex) => {
          const progressEntry = progress.find((p) => p.day_exercise_id === ex.id);
          statusMap[ex.id] = progressEntry ? progressEntry.status : "pending";
        });

        setExerciseStatus(statusMap);
      } catch (error) {
        console.error("Error loading progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, [userId, generationId, exercises.length]);

  useEffect(() => {
    const initialStatus = exercises.reduce((acc, ex) => ({ ...acc, [ex.id]: "pending" }), {});
    setExerciseStatus(initialStatus);
  }, [exercises.map((ex) => ex.id).join(",")]);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleVideoFetched = (exerciseName: string, url: string) => {
    setVideoCache((prev) => ({
      ...prev,
      [exerciseName]: url,
    }));
  };

  const handleStatusChange = async (exerciseId: number, status: Status) => {
    if (!sessionId || status === "pending") return;

    try {
      setExerciseStatus((prev) => ({ ...prev, [exerciseId]: status }));

      await markItemProgress("workout", sessionId, userId, exerciseId, status);
    } catch (error) {
      console.error("Error updating exercise status:", error);
      setExerciseStatus((prev) => ({ ...prev, [exerciseId]: "pending" }));
    }
  };

  const handleNextDay = async () => {
    if (!sessionId || !allCompleted) return;

    const currentDayNumber = parseInt(currentDay.split(" ")[1], 10);
    const nextDay = `Ден ${currentDayNumber + 1}`;

    try {
      const result = await moveToNextDay("workout", sessionId, nextDay, maxDay);

      if (result.status === "completed") {
        localStorage.setItem(completionKey, "true");
        window.location.reload(); // <-- stupid!
        return;
      }

      setExerciseStatus({});
      setCurrentDay(nextDay);
    } catch (error) {
      console.error("Error moving to next day:", error);
    }
  };

  const handleViewPreviousDay = async () => {
    const dayToView = viewMode === "current" ? currentDay : historyDay!;
    const currentDayNumber = parseInt(dayToView.split(" ")[1], 10);

    if (currentDayNumber > 1) {
      const previousDay = `Ден ${currentDayNumber - 1}`;
      setHistoryDay(previousDay);
      setViewMode("history");

      if (sessionId) {
        const previousDayExercises = workoutData.day_exercises.filter(
          (m) => m.day === getCurrentDayObject(sortedDaysWorkout, previousDay).day,
        );
        const dayWorkoutIds = previousDayExercises.map((ex) => ex.id);
        const progress = await getDayProgress<WorkoutExerciseProgress>("workout", sessionId, dayWorkoutIds);

        const statusMap: Record<number, Status> = {};
        previousDayExercises.forEach((ex) => {
          const progressEntry = progress.find((p) => p.day_exercise_id === ex.id);
          statusMap[ex.id] = progressEntry ? progressEntry.status : "pending";
        });
        setExerciseStatus(statusMap);
      }
    }
  };

  const handleViewNextDay = async () => {
    if (!historyDay) return;

    const currentDayNumber = parseInt(historyDay.split(" ")[1], 10);
    const currentDayActualNumber = parseInt(currentDay.split(" ")[1], 10);

    if (currentDayNumber < currentDayActualNumber) {
      const nextDay = `Ден ${currentDayNumber + 1}`;

      if (nextDay === currentDay) {
        setViewMode("current");
        setHistoryDay(null);
        const dayWorkoutIds = exercises.map((ex) => ex.id);
        const progress = await getDayProgress<WorkoutExerciseProgress>("workout", sessionId!, dayWorkoutIds);
        const statusMap: Record<number, Status> = {};
        exercises.forEach((ex) => {
          const progressEntry = progress.find((p) => p.day_exercise_id === ex.id);
          statusMap[ex.id] = progressEntry ? progressEntry.status : "pending";
        });
        setExerciseStatus(statusMap);
      } else {
        setHistoryDay(nextDay);
        const nextDayExercises = workoutData.day_exercises.filter(
          (m) => m.day === getCurrentDayObject(sortedDaysWorkout, nextDay).day,
        );
        const dayWorkoutIds = nextDayExercises.map((m) => m.id);
        const progress = await getDayProgress<WorkoutExerciseProgress>("workout", sessionId!, dayWorkoutIds);
        const statusMap: Record<number, Status> = {};
        nextDayExercises.forEach((m) => {
          const progressEntry = progress.find((p) => p.day_exercise_id === m.id);
          statusMap[m.id] = progressEntry ? progressEntry.status : "pending";
        });
        setExerciseStatus(statusMap);
      }
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

  const allCompleted = Object.values(exerciseStatus).every((status) => status === "completed" || status === "skipped");

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
    <>
      {isSessionCompleted ? (
        <NoDataCard type="workout" />
      ) : (
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="text-muted-foreground h-5 w-5" />
                <CardTitle className="text-base font-medium">
                  {displayDay} - Упражнения {viewMode === "history" && "(Преглед)"}
                </CardTitle>
              </div>
              <Badge variant="outline">{exercises.length} упражнения</Badge>
            </div>
            <CardDescription>{totalSets} общо серии</CardDescription>
            <div className="mt-2 flex items-center justify-between">
              <button
                onClick={handleViewPreviousDay}
                disabled={parseInt((viewMode === "history" ? historyDay! : currentDay).split(" ")[1], 10) === 1}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  parseInt((viewMode === "history" ? historyDay! : currentDay).split(" ")[1], 10) > 1
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                }`}
              >
                ← Предишен ден
              </button>

              {viewMode === "history" && (
                <button
                  onClick={handleViewNextDay}
                  className="bg-muted hover:bg-muted/80 text-foreground rounded-lg px-3 py-1.5 text-sm transition"
                >
                  Следващ ден →
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <PrepSection title="Загрявка" duration={warmup_duration_minutes} items={warmup_exercises} />

              {displayExercises.map((exercise, index) => {
                const status = exerciseStatus[exercise.id] || "pending";
                return (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-r-lg border-l-2 p-3 transition ${getCardStyles(status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1" onClick={() => handleExerciseClick(exercise)}>
                        <p className="text-sm font-semibold">{exercise.exercise_name}</p>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-muted-foreground text-xs">{exercise.sets} серии</span>
                          <span className="text-muted-foreground text-xs">×</span>
                          <span className="text-muted-foreground text-xs">{exercise.reps} повторения</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {exercise.workout_exercises.category}
                        </Badge>

                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStatusChange(exercise.id, "completed")}
                            disabled={viewMode === "history"}
                            className={`rounded-full px-2 py-0.5 text-xs transition ${
                              viewMode === "history"
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : status === "completed"
                                  ? "bg-green-500 text-white"
                                  : "bg-green-100 text-green-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                            }`}
                          >
                            ✔
                          </button>

                          <button
                            onClick={() => handleStatusChange(exercise.id, "skipped")}
                            disabled={viewMode === "history"}
                            className={`rounded-full px-2 py-0.5 text-xs transition ${
                              viewMode === "history"
                                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                : status === "skipped"
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

              <PrepSection title="Разтягане" duration={cooldown_duration_minutes} items={cooldown_exercises} />
            </div>

            {viewMode === "current" && (
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
            )}

            {selectedExercise && (
              <ExerciseModal
                exercise={formatExercise(selectedExercise)}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                cachedVideoUrl={videoCache[selectedExercise.exercise_name]}
                onVideoFetched={handleVideoFetched}
              />
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
