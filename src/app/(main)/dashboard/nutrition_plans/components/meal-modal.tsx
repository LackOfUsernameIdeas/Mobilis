"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, ChefHat, Flame, Activity } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface MealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: any;
}

export default function MealModal({ open, onOpenChange, meal }: MealModalProps) {
  if (!meal) return null;

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  const totalTime = meal.prep_time + meal.cooking_time;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-foreground text-2xl text-pretty">{meal.recipe_name}</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="mr-1 h-3 w-3" />
                {meal.time}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <ChefHat className="mr-1 h-3 w-3" />
                {totalTime} мин общо
              </Badge>
              {meal.meal_id.includes("pre_workout") && (
                <Badge className="bg-blue-500 text-xs">
                  <Activity className="mr-1 h-3 w-3" />
                  Предтренировъчна
                </Badge>
              )}
              {meal.meal_id.includes("post_workout") && (
                <Badge className="bg-green-500 text-xs">
                  <Activity className="mr-1 h-3 w-3" />
                  Следтренировъчна
                </Badge>
              )}
            </div>
            <DialogDescription className="text-muted-foreground text-sm">{meal.description}</DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Macros Overview */}
          <Card className="border-border bg-muted/30 border">
            <CardContent className="grid grid-cols-4 gap-3 p-4">
              <div className="text-center">
                <div className="mb-1 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-foreground text-lg font-bold">{meal.macros.calories}</p>
                <p className="text-muted-foreground text-xs">kcal</p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-lg font-bold">{meal.macros.protein}g</p>
                <p className="text-muted-foreground text-xs">Протеини</p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-lg font-bold">{meal.macros.carbs}g</p>
                <p className="text-muted-foreground text-xs">Въглехидр.</p>
              </div>
              <div className="text-center">
                <p className="text-foreground text-lg font-bold">{meal.macros.fats}g</p>
                <p className="text-muted-foreground text-xs">Мазнини</p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Time Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-1 text-xs">Време за подготовка</p>
              <p className="text-foreground text-lg font-semibold">{meal.prep_time} мин</p>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="text-muted-foreground mb-1 text-xs">Време за готвене</p>
              <p className="text-foreground text-lg font-semibold">{meal.cooking_time} мин</p>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="text-foreground mb-3 text-lg font-semibold">Съставки</h3>
            <div className="space-y-2">
              {meal.ingredients.map((ingredient: any, idx: number) => (
                <div
                  key={idx}
                  className="hover:bg-muted/50 flex items-center justify-between rounded-lg p-2 transition-colors"
                >
                  <span className="text-foreground text-sm">{ingredient.name}</span>
                  <span className="text-muted-foreground text-sm font-medium">
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <h3 className="text-foreground mb-3 text-lg font-semibold">Начин на приготвяне</h3>
            <ol className="space-y-3">
              {meal.instructions.map((instruction: string, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <p className="text-foreground flex-1 text-sm">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
