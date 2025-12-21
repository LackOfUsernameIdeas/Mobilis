"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, BicepsFlexed } from "lucide-react";

interface BodyCompositionCardProps {
  bodyFatMass: number;
  leanBodyMass: number;
}

export function BodyCompositionCard({ bodyFatMass, leanBodyMass }: BodyCompositionCardProps) {
  const total = bodyFatMass + leanBodyMass;
  const fatPercentage = (bodyFatMass / total) * 100;
  const leanPercentage = (leanBodyMass / total) * 100;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Телесен състав</CardTitle>
        <CardDescription>Разпределение на мазнини и мускули</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="bg-primary h-3 rounded-l-full" style={{ width: `${fatPercentage}%` }} />
          <div className="bg-accent h-3 rounded-r-full" style={{ width: `${leanPercentage}%` }} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Droplet className="text-primary h-4 w-4" />
              <span>Мазнини</span>
            </div>
            <p className="text-2xl font-bold">{bodyFatMass.toFixed(2)} кг</p>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <BicepsFlexed className="text-accent h-4 w-4" />
              <span>Мускули</span>
            </div>
            <p className="text-2xl font-bold">{leanBodyMass.toFixed(2)} кг</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
