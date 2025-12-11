"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ResultsDisplayProps {
  category: "gym" | "calisthenics" | "yoga" | "running";
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
  running: "Препоръки за Бягане",
};

// Color mapping for muscle activation visualization
const muscleColors = {
  quadriceps: "#8B5CF6",
  hamstrings: "#EC4899",
  glutes: "#F59E0B",
  calves: "#10B981",
  chest: "#3B82F6",
  back: "#1E40AF",
  lats: "#1E40AF",
  biceps: "#06B6D4",
  triceps: "#F97316",
  forearms: "#EF4444",
  shoulders: "#8B5CF6",
  front_delts: "#8B5CF6",
  side_delts: "#7C3AED",
  rear_delts: "#6D28D9",
  traps: "#059669",
  rhomboids: "#047857",
  abs: "#FBBF24",
  lower_back: "#FBBF24",
  obliques: "#FCD34D",
};

const muscleGroups = [
  { key: "chest", label: "Chest", category: "upper" },
  { key: "front_delts", label: "Front Delts", category: "upper" },
  { key: "side_delts", label: "Side Delts", category: "upper" },
  { key: "rear_delts", label: "Rear Delts", category: "upper" },
  { key: "biceps", label: "Biceps", category: "upper" },
  { key: "triceps", label: "Triceps", category: "upper" },
  { key: "forearms", label: "Forearms", category: "upper" },
  { key: "traps", label: "Traps", category: "upper" },
  { key: "lats", label: "Lats", category: "upper" },
  { key: "rhomboids", label: "Rhomboids", category: "upper" },
  { key: "lower_back", label: "Lower Back", category: "core" },
  { key: "abs", label: "Abs", category: "core" },
  { key: "obliques", label: "Obliques", category: "core" },
  { key: "quadriceps", label: "Quads", category: "lower" },
  { key: "hamstrings", label: "Hamstrings", category: "lower" },
  { key: "glutes", label: "Glutes", category: "lower" },
  { key: "calves", label: "Calves", category: "lower" },
  { key: "adductors", label: "Adductors", category: "lower" },
];

function MuscleActivationMap({ muscleActivation }: { muscleActivation: Record<string, boolean> }) {
  const activeMuscles = Object.entries(muscleActivation)
    .filter(([_, isActive]) => isActive)
    .map(([key]) => key);

  if (activeMuscles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h5 className="text-muted-foreground text-sm font-semibold">Muscle Activation</h5>
        <div className="flex flex-wrap gap-2">
          {muscleGroups.map((muscle) => {
            const isActive = activeMuscles.includes(muscle.key);
            return (
              <Badge
                key={muscle.key}
                variant={isActive ? "default" : "outline"}
                className={isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                style={
                  isActive
                    ? {
                        backgroundColor: muscleColors[muscle.key as keyof typeof muscleColors] || "#6B7280",
                        color: "white",
                      }
                    : {}
                }
              >
                {muscle.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ResultsDisplay({ category, answers, userStats, onReset }: ResultsDisplayProps) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        // const response = await fetch("/api/get-model-response", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     category,
        //     answers,
        //     userStats,
        //   }),
        // });

        // const responseJson = await response.json();
        const responseJson =
          '{"program_overview":{"goal":"recomposition","estimated_time_per_session":"60-75 минути"},"weekly_schedule":[{"day":"Понеделник","focus":"Горна част на тялото – тласкане (гърди, рамене, трицепс)","warmup":{"duration_minutes":10,"exercises":["5 минути бързо ходене или леко кардио на кростренажор","Arm Circles","Shoulder Dislocations с ластик","Push-ups (на колене) – 2 серии по 10 повторения"]},"workout":[{"exercise_name":"Barbell Bench Press","sets":3,"reps":"8-10","muscle_activation":{"chest":true,"front_delts":true,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":true,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Incline Dumbbell Press","sets":3,"reps":"8-12","muscle_activation":{"chest":true,"front_delts":true,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":true,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Seated Dumbbell Shoulder Press","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":true,"side_delts":true,"rear_delts":false,"biceps":false,"triceps":true,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Lateral Raise","sets":3,"reps":"10-15","muscle_activation":{"chest":false,"front_delts":false,"side_delts":true,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":true,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Cable Triceps Pushdown","sets":3,"reps":"10-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":true,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Overhead Dumbbell Triceps Extension","sets":2,"reps":"10-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":true,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}}],"cooldown":{"duration_minutes":10,"exercises":["Doorway Chest Stretch – 2 серии по 20-30 секунди на ръка","Standing Triceps Stretch – 2 серии по 20-30 секунди на ръка","Neck Stretch – 2 серии по 20 секунди във всяка посока","Леко разклащане на ръце и рамене"]}},{"day":"Вторник","focus":"Долна част на тялото (крака и седалище) + корекция на стойката","warmup":{"duration_minutes":10,"exercises":["5 минути леко кардио (велоергометър или бързо ходене)","Bodyweight Squat – 2 серии по 10 повторения","Leg Swings (напред-назад и встрани)","Glute Bridges – 2 серии по 10 повторения"]},"workout":[{"exercise_name":"Leg Press","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":true,"hamstrings":true,"glutes":true,"calves":false,"adductors":true}},{"exercise_name":"Goblet Squat","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":true,"hamstrings":true,"glutes":true,"calves":false,"adductors":true}},{"exercise_name":"Romanian Deadlift","sets":3,"reps":"8-10","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":true,"traps":true,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":false,"quadriceps":false,"hamstrings":true,"glutes":true,"calves":false,"adductors":false}},{"exercise_name":"Leg Curl (Machine)","sets":3,"reps":"10-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":true,"glutes":true,"calves":false,"adductors":false}},{"exercise_name":"Leg Extension (Machine)","sets":2,"reps":"10-15","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":true,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Standing Calf Raise","sets":3,"reps":"10-15","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":true,"adductors":false}}],"cooldown":{"duration_minutes":10,"exercises":["Standing Quadriceps Stretch – 2 серии по 20-30 секунди на крак","Standing Hamstring Stretch – 2 серии по 20-30 секунди на крак","Calf Stretch на стена – 2 серии по 20-30 секунди на крак","Леко разтягане на кръста в поза „дете“ (Child’s Pose) – 2 серии по 30 секунди"]}},{"day":"Четвъртък","focus":"Горна част на тялото – дърпане (гръб, бицепс, задна рамо)","warmup":{"duration_minutes":10,"exercises":["5 минути леко кардио (гребен тренажор или ходене)","Arm Circles (по-широки движения назад)","Scapular Retraction на лост или машина – 2 серии по 10 повторения","Band Pull-Aparts – 2 серии по 12 повторения"]},"workout":[{"exercise_name":"Lat Pulldown","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":true,"biceps":true,"triceps":false,"forearms":true,"traps":true,"lats":true,"rhomboids":true,"lower_back":false,"abs":true,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Seated Cable Row","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":true,"biceps":true,"triceps":false,"forearms":true,"traps":true,"lats":true,"rhomboids":true,"lower_back":true,"abs":true,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Dumbbell Row","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":true,"biceps":true,"triceps":false,"forearms":true,"traps":true,"lats":true,"rhomboids":true,"lower_back":true,"abs":true,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Face Pull","sets":3,"reps":"12-15","muscle_activation":{"chest":false,"front_delts":false,"side_delts":true,"rear_delts":true,"biceps":true,"triceps":false,"forearms":true,"traps":true,"lats":false,"rhomboids":true,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Barbell Curl","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":true,"triceps":false,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Incline Dumbbell Curl","sets":2,"reps":"10-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":true,"triceps":false,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":false,"abs":false,"obliques":false,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}}],"cooldown":{"duration_minutes":10,"exercises":["Lat Stretch на лост – 2 серии по 20-30 секунди","Cross-Body Shoulder Stretch – 2 серии по 20-30 секунди на ръка","Biceps Stretch на стена – 2 серии по 20-30 секунди","Дълбоко дишане и отпускане на горната част на тялото в наклон напред"]}},{"day":"Петък","focus":"Долна част + core (корем и стабилизация)","warmup":{"duration_minutes":10,"exercises":["5 минути леко кардио (велоергометър или пътека)","Bodyweight Lunge – 2 серии по 8 повторения на крак","Glute Bridges – 2 серии по 10 повторения","Hip Circles и динамично разтягане на бедрата"]},"workout":[{"exercise_name":"Barbell Squat","sets":3,"reps":"6-8","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":true,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":true,"hamstrings":true,"glutes":true,"calves":true,"adductors":true}},{"exercise_name":"Walking Lunge","sets":2,"reps":"10 стъпки на крак","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":true,"hamstrings":true,"glutes":true,"calves":true,"adductors":true}},{"exercise_name":"Back Extension","sets":2,"reps":"10-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":false,"traps":false,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":false,"quadriceps":false,"hamstrings":true,"glutes":true,"calves":false,"adductors":false}},{"exercise_name":"Plank","sets":3,"reps":"20-40 секунди","muscle_activation":{"chest":false,"front_delts":true,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":true,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":true,"hamstrings":false,"glutes":true,"calves":false,"adductors":false}},{"exercise_name":"Hanging Leg Raise","sets":3,"reps":"8-12","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":true,"traps":false,"lats":false,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}},{"exercise_name":"Cable Woodchopper","sets":2,"reps":"10-12 на страна","muscle_activation":{"chest":false,"front_delts":false,"side_delts":false,"rear_delts":false,"biceps":false,"triceps":false,"forearms":true,"traps":false,"lats":true,"rhomboids":false,"lower_back":true,"abs":true,"obliques":true,"quadriceps":false,"hamstrings":false,"glutes":false,"calves":false,"adductors":false}}],"cooldown":{"duration_minutes":10,"exercises":["Standing Hamstring Stretch – 2 серии по 20-30 секунди на крак","Hip Flexor Stretch (напад) – 2 серии по 20-30 секунди на крак","Glute Stretch (седнал, крак върху коляно) – 2 серии по 20-30 секунди на страна","Леко усукване на торса в седеж за разпускане на кръста"]}}],"safety_considerations":["Като начинаещ започни с по-леки тежести и оставяй 2-3 повторения в резерв (без да стигаш до отказ).","Фокусирай се върху правилната техника преди увеличаване на тежестта – ако е възможно, помоли треньор в залата да ти покаже основните упражнения (Squat, Bench Press, Romanian Deadlift).","Загрявай ставите и мускулите добре преди всяка тренировка и не пропускай разтягането след нея, за да намалиш риска от травми.","При болка в ставите (особено колена, рамене, кръст) намали тежестта, съкрати диапазона на движение или замени упражнението и при нужда се консултирай със специалист.","Почивай минимум 48 часа между тренировки за една и съща мускулна група и осигури 7-8 часа сън за оптимално възстановяване.","Поддържай стегнат корем (core) и не задържай дъха прекалено дълго, за да избегнеш рязко покачване на кръвното налягане.","Започвай и спирай движенията контролирано, без резки подскоци и „мятане“ на тежестите."]}';
        const workoutProgram = JSON.parse(responseJson);
        console.log("workoutProgram: ", workoutProgram);

        // if (!response.ok) {
        //   setError("An error occurred while fetching recommendations");
        // }
        setRecommendations(workoutProgram);
      } catch (err) {
        setError("Failed to fetch recommendations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [category, answers, userStats]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="border-border bg-card/50 border-b">
          <CardTitle className="text-foreground text-xl sm:text-2xl">{categoryTitles[category]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 sm:space-y-6 sm:pt-8">
          {loading && (
            <div className="bg-primary/10 border-primary/30 rounded-lg border p-4 sm:p-6">
              <div className="animate-pulse space-y-3">
                <div className="bg-primary/20 h-4 w-3/4 rounded"></div>
                <div className="bg-primary/20 h-4 w-full rounded"></div>
                <div className="bg-primary/20 h-4 w-5/6 rounded"></div>
              </div>
              <p className="text-primary/70 mt-4 text-xs sm:text-sm">Генериране на персонализирани препоръки...</p>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-3 sm:p-4">
              <p className="text-destructive/90 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {!loading && recommendations && (
            <div className="space-y-6">
              {/* Program Overview */}
              {recommendations.program_overview && (
                <div className="bg-primary/10 border-primary/30 rounded-lg border p-4">
                  <h3 className="text-foreground mb-3 font-semibold">Преглед на програмата</h3>
                  <div className="space-y-2">
                    <p className="text-foreground/90 text-sm">
                      <span className="font-medium">Цел:</span> {recommendations.program_overview.goal}
                    </p>
                    <p className="text-foreground/90 text-sm">
                      <span className="font-medium">Време за тренировка:</span>{" "}
                      {recommendations.program_overview.estimated_time_per_session} минути
                    </p>
                  </div>
                </div>
              )}

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
                              <div className="space-y-3">
                                {day.workout.map((exercise: any, i: number) => (
                                  <div key={i} className="bg-muted/50 border-border rounded-lg border p-3">
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                      <p className="text-foreground flex-1 text-sm font-medium">
                                        {exercise.exercise_name}
                                      </p>
                                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                                        {exercise.sets}x{exercise.reps}
                                      </Badge>
                                    </div>

                                    {exercise.muscle_activation && (
                                      <MuscleActivationMap muscleActivation={exercise.muscle_activation} />
                                    )}
                                  </div>
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

              {/* Reset Button */}
              <div className="flex gap-2">
                <Button onClick={onReset} variant="outline" className="w-full bg-transparent">
                  Генерирайте отново
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
