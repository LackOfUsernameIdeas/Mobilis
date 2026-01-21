"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader } from "../../_components/loader";
import ExerciseCard from "./exercise-card";
import ExerciseModal from "./exercise-modal";
import { fetchWorkoutRecommendations } from "../helper_functions";
import { Category, FormAnswers, UserStats, WorkoutRecommendations, Exercise } from "../types";
import { getBrowserClient } from "@/lib/db/clients/browser";
import { RESULTS_LOADING_TEXT } from "../constants";

interface ResultsDisplayProps {
  category: Category;
  answers: FormAnswers;
  userStats?: UserStats | null;
  onReset: () => void;
}

export default function ResultsDisplay({ category, answers, userStats, onReset }: ResultsDisplayProps) {
  const [recommendations, setRecommendations] = useState<WorkoutRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRecommendations = async () => {
      setLoading(true);

      try {
        const supabase = getBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const workoutProgram = await fetchWorkoutRecommendations(user.id, category as string, answers, userStats);

        console.log("workoutProgram: ", workoutProgram);
        setRecommendations(workoutProgram);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category, answers, userStats]);

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

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader text={RESULTS_LOADING_TEXT} />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.4,
          ease: [0.21, 0.47, 0.32, 0.98],
        }}
      >
        <Card className="border-border bg-card group relative overflow-hidden border-2 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <CardContent className="relative space-y-4 sm:space-y-6">
            {recommendations ? (
              <div className="space-y-6">
                {/* Weekly Schedule */}
                {recommendations.weekly_schedule && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="space-y-4"
                  >
                    <h1 className="text-foreground text-3xl font-semibold">Седмична програма</h1>
                    <Tabs defaultValue="0" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                        {recommendations.weekly_schedule.map((day, index) => (
                          <TabsTrigger
                            key={index}
                            value={index.toString()}
                            className="text-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10 dark:text-foreground/80 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] dark:data-[state=active]:text-black"
                          >
                            <span className="hidden sm:inline">{day.day}</span>
                            <span className="sm:hidden">D{index + 1}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {recommendations.weekly_schedule.map((day, index) => (
                        <TabsContent key={index} value={index.toString()} className="mt-4">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: [0.21, 0.47, 0.32, 0.98],
                            }}
                          >
                            <Card className="border-border group relative overflow-hidden border-2 transition-all duration-300">
                              <div className="absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                              <CardHeader className="relative">
                                <CardTitle className="text-foreground text-2xl">
                                  {day.day} - {day.focus}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="relative space-y-4">
                                {/* Warmup */}
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.2,
                                    ease: [0.21, 0.47, 0.32, 0.98],
                                  }}
                                  className="border-primary/30 bg-primary/5 rounded-md border-l-3 p-3"
                                >
                                  <h4 className="text-foreground group-hover:text-foreground text-md mb-2 font-semibold transition-colors duration-300">
                                    🔥 Загряване ({day.warmup.duration_minutes} мин)
                                  </h4>
                                  <ul className="text-foreground/80 text-md list-inside list-disc space-y-1">
                                    {day.warmup.exercises.map((ex, i) => (
                                      <li key={i}>{ex}</li>
                                    ))}
                                  </ul>
                                </motion.div>

                                {/* Workout */}
                                <div>
                                  <div className="grid gap-3 md:grid-cols-2">
                                    {day.workout.map((exercise, i) => (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.3,
                                          delay: 0.15 + i * 0.05,
                                          ease: [0.21, 0.47, 0.32, 0.98],
                                        }}
                                      >
                                        <ExerciseCard
                                          exercise={exercise}
                                          onClick={() => handleExerciseClick(exercise)}
                                        />
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>

                                {/* Cooldown */}
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.2,
                                    ease: [0.21, 0.47, 0.32, 0.98],
                                  }}
                                  className="border-primary/30 bg-primary/5 rounded-md border-l-3 p-3"
                                >
                                  <h4 className="text-foreground group-hover:text-foreground text-md mb-2 font-semibold transition-colors duration-300">
                                    ❄️ Разтягане ({day.cooldown.duration_minutes} мин)
                                  </h4>
                                  <ul className="text-foreground/80 text-md list-inside list-disc space-y-1">
                                    {day.cooldown.exercises.map((ex, i) => (
                                      <li key={i}>{ex}</li>
                                    ))}
                                  </ul>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </motion.div>
                )}

                {/* Safety Considerations */}
                {recommendations.safety_considerations && recommendations.safety_considerations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="bg-destructive/10 group border-destructive/50 relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300"
                  >
                    <h3 className="text-foreground relative mb-2 font-semibold">⚠️ Важни съображения за безопасност</h3>
                    <ul className="text-foreground/90 text-md relative list-inside list-disc space-y-1">
                      {recommendations.safety_considerations.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={onReset}
                    className="text-md hover:shadow-primary/20 w-full cursor-pointer hover:shadow-lg"
                  >
                    Генерирайте отново
                  </Button>
                </motion.div>
              </div>
            ) : (
              <>
                <div className="text-foreground text-center">Нещо се обърка. Моля, опитайте отново.</div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  className="flex gap-2"
                >
                  <Button
                    onClick={onReset}
                    className="text-md hover:shadow-primary/20 w-full cursor-pointer hover:shadow-lg"
                  >
                    Генерирайте отново
                  </Button>
                </motion.div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {selectedExercise && (
        <ExerciseModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          exercise={selectedExercise}
          cachedVideoUrl={videoCache[selectedExercise.exercise_name]}
          onVideoFetched={handleVideoFetched}
        />
      )}
    </div>
  );
}
