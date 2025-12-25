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

export default function ResultsDisplay({ category, answers, userStats, onReset }: ResultsDisplayProps) {
  const [recommendations, setRecommendations] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
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

  const handleMealClick = (meal: any) => {
    setSelectedMeal(meal);
    setIsModalOpen(true);
  };

  const getMealIcon = (mealId: string) => {
    if (mealId.includes("pre_workout") || mealId.includes("post_workout")) {
      return <Activity className="h-4 w-4" />;
    }
    return <Utensils className="h-4 w-4" />;
  };

  const getMealBadgeBg = (mealId: string) => {
    if (mealId.includes("pre_workout") || mealId.includes("post_workout")) return "bg-primary";
    return "bg-foreground";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {loading ? (
        <div className="flex min-h-[80vh] items-center justify-center">
          <Loader />
        </div>
      ) : recommendations ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="space-y-6"
        >
          {/* Header Card */}
          <Card className="border-border bg-card border-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
                <Flame className="h-6 w-6 text-orange-500" />
                Вашият персонализиран хранителен план
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-foreground mb-2 text-lg font-semibold">Предпочетени стойности на макроси на ден:</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Калории</p>
                  <p className="text-foreground text-lg font-semibold">{answers.calories} kcal</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Протеини</p>
                  <p className="text-foreground text-lg font-semibold">{answers.protein}g</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Въглехидрати</p>
                  <p className="text-foreground text-lg font-semibold">{answers.carbs}g</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Мазнини</p>
                  <p className="text-foreground text-lg font-semibold">{answers.fats}g</p>
                </div>
              </div>

              {recommendations.nutrition_tips && recommendations.nutrition_tips.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="text-foreground mb-2 font-semibold">Хранителни съвети:</h3>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    {recommendations.nutrition_tips.map((tip: string, idx: number) => (
                      <li key={idx} className="flex gap-2">
                        <span>•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weekly Plan Tabs */}
          <Card className="border-border bg-card border-2">
            <CardContent className="p-4 sm:p-6">
              <Tabs defaultValue="day-0" className="w-full">
                <TabsList className="bg-muted grid w-full grid-cols-7 gap-1">
                  {recommendations.weekly_plan.map((day: any, idx: number) => (
                    <TabsTrigger
                      key={idx}
                      value={`day-${idx}`}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                    >
                      {day.day}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {recommendations.weekly_plan.map((day: any, dayIdx: number) => (
                  <TabsContent key={dayIdx} value={`day-${dayIdx}`} className="space-y-4 pt-4">
                    {/* Day Summary */}
                    <h3 className="text-foreground mb-2 text-lg font-semibold">Общо стойности на макроси за деня:</h3>
                    <div className="bg-muted/30 grid grid-cols-2 gap-3 rounded-lg p-3 sm:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground text-xs">Калории</p>
                        <p className="text-foreground font-semibold">{day.total_macros.calories} kcal</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Протеини</p>
                        <p className="text-foreground font-semibold">{day.total_macros.protein}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Въглехидрати</p>
                        <p className="text-foreground font-semibold">{day.total_macros.carbs}g</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Мазнини</p>
                        <p className="text-foreground font-semibold">{day.total_macros.fats}g</p>
                      </div>
                    </div>

                    {/* Meals Grid */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {day.meals.map((meal: any, mealIdx: number) => (
                        <Card
                          key={mealIdx}
                          className="border-border hover:border-primary/50 group cursor-pointer transition-all duration-200 hover:shadow-md"
                          onClick={() => handleMealClick(meal)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center gap-2">
                                  {getMealIcon(meal.meal_id)}
                                  <CardTitle className="text-foreground text-sm">{meal.name}</CardTitle>
                                </div>
                                <Badge className={`flex items-center gap-1 text-xs ${getMealBadgeBg(meal.meal_id)}`}>
                                  <Clock className="h-3 w-3" />
                                  {meal.time}
                                </Badge>
                                <p className="text-muted-foreground mt-1 text-[10px]">*ориентировъчно</p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 pb-4">
                            <p className="text-muted-foreground line-clamp-2 text-xs">{meal.description}</p>
                            <div className="bg-muted/50 grid grid-cols-2 gap-2 rounded p-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Cal: </span>
                                <span className="text-foreground font-medium">{meal.macros.calories}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">P: </span>
                                <span className="text-foreground font-medium">{meal.macros.protein}g</span>
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
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="flex justify-center">
            <Button onClick={onReset} className="text-md hover:shadow-primary/20 w-full cursor-pointer hover:shadow-lg">
              Генерирайте отново
            </Button>
          </div>
        </motion.div>
      ) : (
        <Card className="border-border bg-card border-2">
          <CardContent className="flex min-h-[40vh] items-center justify-center p-6">
            <p className="text-muted-foreground">Не успяхме да генерираме препоръки. Моля, опитайте отново.</p>
          </CardContent>
        </Card>
      )}

      {selectedMeal && <MealModal open={isModalOpen} onOpenChange={setIsModalOpen} meal={selectedMeal} />}
    </div>
  );
}
