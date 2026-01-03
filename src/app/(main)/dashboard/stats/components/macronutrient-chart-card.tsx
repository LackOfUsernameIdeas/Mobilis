"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, Droplets, Wheat } from "lucide-react";

interface MacronutrientChartCardProps {
  protein: number;
  fats: number;
  carbs: number;
}

export function MacronutrientChartCard({ protein, fats, carbs }: MacronutrientChartCardProps) {
  const total = protein + fats + carbs;
  const proteinPercentage = (protein / total) * 100;
  const fatsPercentage = (fats / total) * 100;
  const carbsPercentage = (carbs / total) * 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Макронутриенти</CardTitle>
        <CardDescription>Разпределение на дневния прием</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-1">
          <div
            className="bg-chart-2 h-3 rounded-l-full"
            style={{ width: `${proteinPercentage}%` }}
            title={`Протеини: ${proteinPercentage.toFixed(1)}%`}
          />
          <div
            className="bg-chart-1 h-3"
            style={{ width: `${fatsPercentage}%` }}
            title={`Мазнини: ${fatsPercentage.toFixed(1)}%`}
          />
          <div
            className="bg-chart-5 h-3 rounded-r-full"
            style={{ width: `${carbsPercentage}%` }}
            title={`Въглехидрати: ${carbsPercentage.toFixed(1)}%`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Beef className="text-chart-2 h-4 w-4" />
              <span>Протеини</span>
            </div>
            <p className="text-2xl font-bold">{protein}г</p>
            <p className="text-muted-foreground text-xs">{proteinPercentage.toFixed(0)}%</p>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Droplets className="text-chart-4 h-4 w-4" />
              <span>Мазнини</span>
            </div>
            <p className="text-2xl font-bold">{fats}г</p>
            <p className="text-muted-foreground text-xs">{fatsPercentage.toFixed(0)}%</p>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Wheat className="text-chart-5 h-4 w-4" />
              <span>Въглехидрати</span>
            </div>
            <p className="text-2xl font-bold">{carbs}г</p>
            <p className="text-muted-foreground text-xs">{carbsPercentage.toFixed(0)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
