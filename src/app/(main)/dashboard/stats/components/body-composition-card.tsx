"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, BicepsFlexed } from "lucide-react";
import type { BodyFatData } from "../types";

interface BodyCompositionCardProps {
  bodyFatData: BodyFatData;
}

export function BodyCompositionCard({ bodyFatData }: BodyCompositionCardProps) {
  const total = bodyFatData.bodyFatMass + bodyFatData.leanBodyMass;
  const fatPercentage = (bodyFatData.bodyFatMass / total) * 100;
  const leanPercentage = (bodyFatData.leanBodyMass / total) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Телесен състав</CardTitle>
        <CardDescription>Разпределение на мазнини и мускули</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="bg-chart-1 h-3 rounded-l-full" style={{ width: `${fatPercentage}%` }} />
          <div className="bg-chart-2 h-3 rounded-r-full" style={{ width: `${leanPercentage}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Droplets className="text-chart-1 h-4 w-4" />
              <span>Мазнини</span>
            </div>
            <p className="text-2xl font-bold">{bodyFatData.bodyFatMass.toFixed(2)} кг</p>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <BicepsFlexed className="text-chart-2 h-4 w-4" />
              <span>Мускули</span>
            </div>
            <p className="text-2xl font-bold">{bodyFatData.leanBodyMass.toFixed(2)} кг</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
