"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MealModal from "./meal-modal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/app/utils/supabase/client";
import { Loader } from "../../_components/loader";
import { Clock, Utensils, Flame, Activity } from "lucide-react";

interface ResultsDisplayProps {
  category: "nutrition";
  answers: Record<string, any>;
  userStats?: {
    gender?: "male" | "female";
    height?: number;
    weight?: number;
    age?: number;
    bmi: string;
    bodyFat: string;
    bodyFatMass: string;
    leanBodyMass: string;
  };
  onReset: () => void;
}

interface NutritionMeal {
  meal_id: string;
  name: string;
  meal_type: string;
  time: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  instructions: string[];
  prep_time: number;
  cooking_time: number;
}

interface DayPlan {
  day: string;
  total_macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: NutritionMeal[];
}

interface NutritionPlan {
  weekly_plan: DayPlan[];
  nutrition_tips: string[];
}

export default function ResultsDisplay({ category, answers, userStats, onReset }: ResultsDisplayProps) {
  const [recommendations, setRecommendations] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [selectedMeal, setSelectedMeal] = useState<NutritionMeal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchRecommendations = async () => {
      setLoading(true);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error("User not authenticated");
          return;
        }

        const response = await fetch("/api/get-model-response/nutrition-plans", {
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
          return;
        }

        const responseJson = await response.json();
        const nutritionPlan = JSON.parse(responseJson);
        console.log("nutritionPlan: ", nutritionPlan);

        setRecommendations(nutritionPlan);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleMealClick = (meal: NutritionMeal) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const getMealIcon = (mealType: string) => {
    if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") {
      return <Activity className="h-4 w-4" />;
    }
    return <Utensils className="h-4 w-4" />;
  };

  const getMealBadgeBg = (mealType: string) => {
    if (mealType === "pre_workout_snack" || mealType === "post_workout_snack") return "bg-primary";
    return "bg-foreground";
  };

  const mealTypeTranslations: Record<string, string> = {
    breakfast: "Закуска",
    morning_snack: "Предиобедна закуска",
    lunch: "Обяд",
    afternoon_snack: "Следобедна закуска",
    pre_workout_snack: "Предтренировъчно ястие",
    post_workout_snack: "Следтренировъчно ястие",
    dinner: "Вечеря",
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
                  {/* Header Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.1,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2">
                      <h1 className="text-foreground text-3xl font-semibold">Седмичен хранителен план</h1>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.2,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="border-primary/30 bg-primary/5 rounded-md border-l-3 p-4"
                    >
                      <h3 className="text-foreground mb-3 text-lg font-semibold">
                        Предпочетени стойности на макроси за ден:
                      </h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">Калории</p>
                          <p className="text-foreground text-lg font-semibold">{answers.calories} kcal</p>
                        </div>
                        <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">Протеини</p>
                          <p className="text-foreground text-lg font-semibold">{answers.protein}g</p>
                        </div>
                        <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">Въглехидрати</p>
                          <p className="text-foreground text-lg font-semibold">{answers.carbs}g</p>
                        </div>
                        <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                          <p className="text-muted-foreground text-xs">Мазнини</p>
                          <p className="text-foreground text-lg font-semibold">{answers.fats}g</p>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Weekly Plan */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.3,
                      ease: [0.21, 0.47, 0.32, 0.98],
                    }}
                    className="space-y-4"
                  >
                    <Tabs defaultValue="0" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
                        {recommendations.weekly_plan.map((day: DayPlan, idx: number) => (
                          <TabsTrigger
                            key={idx}
                            value={idx.toString()}
                            className="text-md data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground hover:bg-primary/10 dark:text-foreground/80 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm active:scale-[0.98] dark:data-[state=active]:text-black"
                          >
                            <span className="hidden sm:inline">{day.day}</span>
                            <span className="sm:hidden">D{idx + 1}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {recommendations.weekly_plan.map((day: DayPlan, dayIdx: number) => (
                        <TabsContent key={dayIdx} value={dayIdx.toString()} className="mt-4">
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
                              <CardContent className="relative space-y-4">
                                {/* Meals Grid */}
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {day.meals.map((meal: NutritionMeal, mealIdx: number) => (
                                    <motion.div
                                      key={mealIdx}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{
                                        duration: 0.3,
                                        delay: 0.15 + mealIdx * 0.05,
                                        ease: [0.21, 0.47, 0.32, 0.98],
                                      }}
                                    >
                                      <Card
                                        className="border-border hover:border-primary/50 group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                        onClick={() => handleMealClick(meal)}
                                      >
                                        <CardHeader className="pb-3">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <div className="mb-1 flex items-center gap-2">
                                                {getMealIcon(meal.meal_type)}
                                                <CardTitle className="text-foreground text-sm">
                                                  {mealTypeTranslations[meal.meal_type]}
                                                </CardTitle>
                                              </div>
                                              <Badge
                                                className={`flex items-center gap-1 text-xs ${getMealBadgeBg(
                                                  meal.meal_type,
                                                )}`}
                                              >
                                                <Clock className="h-3 w-3" />
                                                {meal.time}
                                              </Badge>
                                              <p className="text-muted-foreground mt-1 text-[10px]">*ориентировъчно</p>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="space-y-2 pb-4">
                                          <p className="text-muted-foreground line-clamp-2 text-xs">
                                            {meal.description}
                                          </p>
                                          <div className="bg-muted/50 grid grid-cols-2 gap-2 rounded p-2 text-xs">
                                            <div>
                                              <span className="text-muted-foreground">Cal: </span>
                                              <span className="text-foreground font-medium">
                                                {meal.macros.calories}
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">P: </span>
                                              <span className="text-foreground font-medium">
                                                {meal.macros.protein}g
                                              </span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">C: </span>
                                              <span className="text-foreground font-medium">{meal.macros.carbs}g</span>
                                            </div>
                                            <div>
                                              <span className="text-muted-foreground">F: </span>
                                              <span className="text-foreground font-medium">{meal.macros.fats}g</span>
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </motion.div>
                                  ))}
                                </div>
                                {/* Day Summary */}
                                <motion.div
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: 0.1,
                                    ease: [0.21, 0.47, 0.32, 0.98],
                                  }}
                                  className="border-primary/30 bg-primary/5 rounded-md border-l-3 p-3"
                                >
                                  <h3 className="text-foreground mb-2 font-semibold">
                                    Общо стойности на макроси за деня:
                                  </h3>
                                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                                      <p className="text-muted-foreground text-xs">Калории</p>
                                      <p className="text-foreground font-semibold">{day.total_macros.calories} kcal</p>
                                    </div>
                                    <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                                      <p className="text-muted-foreground text-xs">Протеини</p>
                                      <p className="text-foreground font-semibold">{day.total_macros.protein}g</p>
                                    </div>
                                    <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                                      <p className="text-muted-foreground text-xs">Въглехидрати</p>
                                      <p className="text-foreground font-semibold">{day.total_macros.carbs}g</p>
                                    </div>
                                    <div className="bg-background/80 dark:bg-muted/50 rounded-lg p-3">
                                      <p className="text-muted-foreground text-xs">Мазнини</p>
                                      <p className="text-foreground font-semibold">{day.total_macros.fats}g</p>
                                    </div>
                                  </div>
                                </motion.div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </motion.div>

                  {recommendations.nutrition_tips && recommendations.nutrition_tips.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: 0.35,
                        ease: [0.21, 0.47, 0.32, 0.98],
                      }}
                      className="border-primary/30 bg-primary/5 rounded-md border-l-3 p-4"
                    >
                      <h3 className="text-foreground mb-2 font-semibold">💡 Хранителни съвети:</h3>
                      <ul className="text-foreground/80 text-md space-y-1">
                        {recommendations.nutrition_tips.map((tip: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Reset Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.4,
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
      )}

      {selectedMeal && <MealModal open={isModalOpen} onOpenChange={setIsModalOpen} meal={selectedMeal} />}
    </div>
  );
}
