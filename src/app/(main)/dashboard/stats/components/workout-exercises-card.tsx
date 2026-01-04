"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ExerciseModal from "@/app/(main)/dashboard/workout_recommendations/components/exercise-modal";
import { useState, useEffect } from "react";
import { getDayProgress } from "@/lib/db/clients/get";
import { getOrCreateWorkoutSession, markExerciseProgress, moveToNextDay } from "@/lib/db/clients/post";

interface Exercise {
  id: number;
  generation_id: number;
  day: string;
  exercise_id: number;
  sets: number;
  reps: string;
  workout_exercises: {
    category: string;
    muscle_activation: any;
  };
}

interface WorkoutExerciseProgress {
  id: string;
  session_id: string;
  user_id: string;
  day_exercise_id: number;
  status: "completed" | "skipped";
  completed_at: string;
}

interface WorkoutExercisesCardProps {
  day: string;
  exercises: Exercise[];
  userId: string;
  generationId: number;
  onDayComplete?: (nextDay: string) => void;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Понеделник",
  tuesday: "Вторник",
  wednesday: "Сряда",
  thursday: "Четвъртък",
  friday: "Петък",
  saturday: "Събота",
  sunday: "Неделя",
};

const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function format(exercise: any) {
  return {
    exercise_name: exercise.exercise_id,
    sets: String(exercise.sets),
    reps: exercise.reps,
    muscle_activation: exercise.workout_exercises?.muscle_activation,
  };
}

type ExerciseStatus = "pending" | "completed" | "skipped";

export function WorkoutExercisesCard({
  day,
  exercises,
  userId,
  generationId,
  onDayComplete,
}: WorkoutExercisesCardProps) {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [exerciseStatus, setExerciseStatus] = useState<Record<number, ExerciseStatus>>(() =>
    exercises.reduce((acc, ex) => ({ ...acc, [ex.id]: "pending" }), {}),
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const session = await getOrCreateWorkoutSession(userId, generationId, day);
        setSessionId(session.id);

        const dayExerciseIds = exercises.map((ex) => ex.id);
        const progress: WorkoutExerciseProgress[] = await getDayProgress(session.id, dayExerciseIds);

        const statusMap: Record<number, ExerciseStatus> = {};
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
  }, [userId, generationId, day, exercises]);

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (exerciseId: number, status: ExerciseStatus) => {
    if (!sessionId || status === "pending") return;

    try {
      setExerciseStatus((prev) => ({ ...prev, [exerciseId]: status }));

      await markExerciseProgress(sessionId, userId, exerciseId, status);
    } catch (error) {
      console.error("Error updating exercise status:", error);
      setExerciseStatus((prev) => ({ ...prev, [exerciseId]: "pending" }));
    }
  };

  const handleNextDay = async () => {
    if (!sessionId || !allCompleted) return;

    try {
      const currentDayIndex = DAY_ORDER.indexOf(day.toLowerCase());
      const nextDayIndex = (currentDayIndex + 1) % DAY_ORDER.length;
      const nextDay = DAY_ORDER[nextDayIndex];

      await moveToNextDay(sessionId, nextDay);

      if (onDayComplete) {
        onDayComplete(nextDay);
      }
    } catch (error) {
      console.error("Error moving to next day:", error);
    }
  };

  const getCardStyles = (status: ExerciseStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-50 border-green-400";
      case "skipped":
        return "bg-red-50 border-red-400 line-through text-muted-foreground";
      default:
        return "bg-muted/50 border-chart-1 hover:bg-muted";
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base font-medium">{DAY_LABELS[day.toLowerCase()] || day} - Упражнения</CardTitle>
          </div>
          <Badge variant="outline">{exercises.length} упражнения</Badge>
        </div>
        <CardDescription>{totalSets} общо серии</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const status = exerciseStatus[exercise.id] || "pending";
            return (
              <div
                key={index}
                className={`cursor-pointer rounded-r-lg border-l-2 p-3 transition ${getCardStyles(status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1" onClick={() => handleExerciseClick(exercise)}>
                    <p className="text-sm font-semibold">{exercise.exercise_id}</p>
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
                        className={`rounded-full px-2 py-0.5 text-xs transition ${
                          status === "completed" ? "bg-green-500 text-white" : "bg-green-100 text-green-700"
                        }`}
                      >
                        ✔
                      </button>
                      <button
                        onClick={() => handleStatusChange(exercise.id, "skipped")}
                        className={`rounded-full px-2 py-0.5 text-xs transition ${
                          status === "skipped" ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
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

        {selectedExercise && (
          <ExerciseModal exercise={format(selectedExercise)} open={isModalOpen} onOpenChange={setIsModalOpen} special />
        )}
      </CardContent>
    </Card>
  );
}
