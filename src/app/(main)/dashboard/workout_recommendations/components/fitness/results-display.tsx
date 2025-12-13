"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExerciseCard from "./exercise-card";
import ExerciseModal from "./exercise-modal";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  category: "gym" | "calisthenics" | "yoga";
  answers: Record<string, any>;
  userStats?: {
    gender?: "male" | "female";
    height?: number;
    weight?: number;
    bmi: string;
    bodyFat: string;
    fatMass: string;
    leanMass: string;
  };
  onReset: () => void;
}

const categoryTitles = {
  gym: "Препоръки за Фитнес",
  calisthenics: "Препоръки за Калистеника",
  yoga: "Препоръки за Йога",
};

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
        const response = await fetch("/api/get-model-response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
        console.log("answers: ", answers);

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
      <Card className="border-border bg-card">
        <CardHeader className="border-border bg-card/50 border-b">
          <CardTitle className="text-foreground text-xl sm:text-2xl">{categoryTitles[category]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {!loading && recommendations && (
            <div className="space-y-6">
              {/* Reset Button */}
              <div className="flex gap-2">
                <Button onClick={onReset} variant="outline" className="w-full bg-transparent">
                  Генерирайте отново
                </Button>
              </div>
              {/* Weekly Schedule */}
              {recommendations.weekly_schedule && (
                <div className="space-y-4">
                  <h3 className="text-foreground text-lg font-semibold">Седмична програма</h3>
                  <Tabs defaultValue="0" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                      {recommendations.weekly_schedule.map((day: any, index: number) => (
                        <TabsTrigger key={index} value={index.toString()} className="text-xs">
                          <span className="hidden sm:inline">{day.day}</span>
                          <span className="sm:hidden">D{index + 1}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {recommendations.weekly_schedule.map((day: any, index: number) => (
                      <TabsContent key={index} value={index.toString()} className="space-y-4">
                        <Card className="border-border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-foreground text-base">
                              {day.day} - {day.focus}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Warmup */}
                            <div>
                              <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
                                🔥 Загряване ({day.warmup.duration_minutes} мин)
                              </h4>
                              <ul className="text-foreground/80 list-inside list-disc space-y-1 text-sm">
                                {day.warmup.exercises.map((ex: string, i: number) => (
                                  <li key={i}>{ex}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Workout */}
                            <div>
                              <h4 className="text-muted-foreground mb-3 text-sm font-semibold">💪 Тренировка</h4>
                              <div className="grid gap-3 sm:grid-cols-2">
                                {day.workout.map((exercise: any, i: number) => (
                                  <ExerciseCard
                                    key={i}
                                    exercise={exercise}
                                    onClick={() => handleExerciseClick(exercise)}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Cooldown */}
                            <div>
                              <h4 className="text-muted-foreground mb-2 text-sm font-semibold">
                                ❄️ Разтягане ({day.cooldown.duration_minutes} мин)
                              </h4>
                              <ul className="text-foreground/80 list-inside list-disc space-y-1 text-sm">
                                {day.cooldown.exercises.map((ex: string, i: number) => (
                                  <li key={i}>{ex}</li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}

              {/* Safety Considerations */}
              {recommendations.safety_considerations && recommendations.safety_considerations.length > 0 && (
                <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-4">
                  <h3 className="text-foreground mb-2 font-semibold">⚠️ Важни съображения за безопасност</h3>
                  <ul className="text-foreground/90 list-inside list-disc space-y-1 text-sm">
                    {recommendations.safety_considerations.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
