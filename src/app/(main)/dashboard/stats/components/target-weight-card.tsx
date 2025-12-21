"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingDown, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TargetWeightCardProps {
  currentWeight: number;
  targetWeight?: number;
}

export function TargetWeightCard({ currentWeight, targetWeight }: TargetWeightCardProps) {
  if (targetWeight == null) {
    return (
      <Card className="h-full border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base font-medium">Целево тегло</CardTitle>
          </div>
          <CardDescription>Все още нямате зададена цел</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Задаването на целево тегло позволява проследяване на напредъка и по-точни здравни препоръки.
          </p>

          <Button asChild className="w-full">
            <Link href="/dashboard/workout_recommendations">Задай цел</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  const difference = currentWeight - targetWeight;
  const progress = Math.max(0, Math.min(100, (targetWeight / currentWeight) * 100));
  const isGaining = difference < 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="text-muted-foreground h-5 w-5" />
          <CardTitle className="text-base font-medium">Целево тегло</CardTitle>
        </div>
        <CardDescription>Напредък към вашата цел</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-3xl font-bold">{targetWeight} кг</p>
            <p className="text-muted-foreground mt-1 text-sm">Целево тегло</p>
          </div>
          <div className="text-right">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${difference > 0 ? "text-orange-600" : "text-green-600"}`}
            >
              {difference > 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
              <span>{Math.abs(difference).toFixed(1)} кг</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">{difference > 0 ? "до цел" : "над цел"}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-muted-foreground flex justify-between text-sm">
            <span>Текущо: {currentWeight} кг</span>
            <span>{Math.abs(difference).toFixed(1)} кг</span>
          </div>
          <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
            <motion.div
              className="from-primary to-chart-4 h-full rounded-full bg-gradient-to-r"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
