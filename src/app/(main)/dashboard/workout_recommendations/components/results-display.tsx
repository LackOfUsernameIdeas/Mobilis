"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseCard from "./exercise-card";
import ExerciseModal from "./exercise-modal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/app/utils/supabase/client";
import { Loader } from "../../_components/loader";

interface ResultsDisplayProps {
  category: "gym" | "calisthenics" | "yoga";
  answers: Record<string, any>;
  userStats?: {
    gender?: "male" | "female";
    height?: number;
    weight?: number;
    bmi: string;
    bodyFat: string;
    bodyFatMass: string;
    leanBodyMass: string;
  };
  onReset: () => void;
}

export default function ResultsDisplay({ category, answers, userStats, onReset }: ResultsDisplayProps) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Video URL cache - stores fetched URLs for this recommendation set
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRecommendations = async () => {
      setLoading(true);

      try {
        // Get the current user
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const response = await fetch("/api/get-model-response/workout-recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            category,
            answers,
            userStats,
          }),
        });

        if (!response.ok) {
          console.error("An error occurred while fetching recommendations");
        }

        const responseJson = await response.json();
        const workoutProgram = JSON.parse(responseJson);
        console.log("workoutProgram: ", workoutProgram);

        setRecommendations(workoutProgram);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleExerciseClick = (exercise: any) => {
    setSelectedExercise(exercise);
    setIsModalOpen(true);
  };

  // Function to update the video cache
  const handleVideoFetched = (exerciseName: string, url: string) => {
    setVideoCache((prev) => ({
      ...prev,
      [exerciseName]: url,
    }));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {loading ? (
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader />
        </div>
      ) : (
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
                          {recommendations.weekly_schedule.map((day: any, index: number) => (
                            <TabsTrigger
                              key={index}
                              value={index.toString()}
                              className="text-md cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                              <span className="hidden sm:inline">{day.day}</span>
                              <span className="sm:hidden">D{index + 1}</span>
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {recommendations.weekly_schedule.map((day: any, index: number) => (
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
                                      {day.warmup.exercises.map((ex: string, i: number) => (
                                        <li key={i}>{ex}</li>
                                      ))}
                                    </ul>
                                  </motion.div>
                                  {/* Workout */}
                                  <div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                      {day.workout.map((exercise: any, i: number) => (
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
                                      {day.cooldown.exercises.map((ex: string, i: number) => (
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
                      <h3 className="text-foreground relative mb-2 font-semibold">
                        ⚠️ Важни съображения за безопасност
                      </h3>
                      <ul className="text-foreground/90 text-md relative list-inside list-disc space-y-1">
                        {recommendations.safety_considerations.map((item: string, i: number) => (
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
                  <div className="text-foreground text-center">Нещо се обърка. Моля, опитайте отново.</div>{" "}
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
      )}
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
