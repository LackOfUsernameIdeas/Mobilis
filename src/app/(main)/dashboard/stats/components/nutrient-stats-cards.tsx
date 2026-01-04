"use client";

import { Flame, TrendingUp, Apple, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import type { NutrientData } from "../types";

interface NutrientStatsCardProps {
  nutrientData: NutrientData;
}

export function NutrientStatsCard({ nutrientData }: NutrientStatsCardProps) {
  const calorieDelta = nutrientData.calories - nutrientData.tdee;

  const calorieStatus =
    calorieDelta === 0
      ? {
          label: "Поддръжка",
          variant: "outline",
        }
      : calorieDelta < 0
        ? {
            label: `Дефицит: ${Math.abs(calorieDelta)} kcal`,
            variant: "destructive",
          }
        : {
            label: `Излишък: ${calorieDelta} kcal`,
            variant: "secondary",
          };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="mx-auto flex h-full flex-col">
        <CardHeader className="space-y-6 pb-8">
          <div className="flex items-center justify-between">
            <CardDescription className="flex items-center gap-2">
              <Apple className="size-4" />
              Целеви калории
            </CardDescription>
            <Badge variant="outline" className="border-chart-1 text-chart-1">
              {calorieStatus.label}
            </Badge>
          </div>

          <div className="space-y-4">
            <CardTitle className="text-5xl font-semibold tabular-nums">{nutrientData.calories} kcal</CardTitle>

            <p className="text-muted-foreground text-sm font-medium">Целева стойност за деня</p>
          </div>
        </CardHeader>

        <div className="grid grid-cols-2 border-t px-6 text-center">
          <div className="h-full space-y-2 border-r py-6 pr-6">
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <Flame className="size-4" />
              BMR
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted-foreground/25 hover:text-popover-foreground/75 h-6 w-6"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Какво е BMR?</h4>
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Базален метаболизъм (BMR) е количеството калории, което тялото ви изгаря в пълен покой за
                        поддържане на жизненоважни функции.
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Изчислява се по формулата на Mifflin-St Jeor:
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        <div className="max-w-full overflow-x-auto">
                          <BlockMath math="\mathit{BMR} = 10 \times \mathit{тегло} + 6.25 \times \mathit{ръст} - 5 \times \mathit{възраст} + 5" />
                        </div>
                      </p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm font-medium">Вашият BMR: {nutrientData.bmr} kcal</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Това е базата, върху която се изчислява дневният ви разход.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="pt-1">
              <div className="text-2xl font-semibold tabular-nums">{nutrientData.bmr}</div>
              <p className="text-muted-foreground text-xs">kcal / ден</p>
            </div>
          </div>
          <div className="h-full space-y-2 py-6 pl-6">
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <TrendingUp className="size-4" />
              TDEE
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-muted-foreground/25 hover:text-popover-foreground/75 h-6 w-6"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Какво е TDEE?</h4>
                    <div className="space-y-3">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        TDEE (Total Daily Energy Expenditure) е общият брой калории, които изгаряте за един ден,
                        включително активност и тренировки.
                      </p>
                      <p className="text-muted-foreground text-sm leading-relaxed">Изчислява се чрез:</p>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        <div className="max-w-full overflow-x-auto">
                          <BlockMath math="\mathit{TDEE} = \mathit{BMR} \times \mathit{коефициент\ на\ активност}" />
                        </div>
                      </p>
                    </div>
                    <div className="border-t pt-2">
                      <p className="text-sm font-medium">Вашият TDEE: {nutrientData.tdee} kcal</p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Това е ориентирът за поддръжка, дефицит или излишък.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="pt-1">
              <div className="text-2xl font-semibold tabular-nums">{nutrientData.tdee}</div>
              <p className="text-muted-foreground text-xs">kcal / ден</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
