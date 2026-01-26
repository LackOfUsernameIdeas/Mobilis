"use client";

import { Flame, TrendingUp, Apple, Info, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BlockMath } from "react-katex";
import { useState } from "react";
import type { NutrientData } from "../types";

interface NutrientStatsCardProps {
  nutrientData: NutrientData;
}

export function NutrientStatsCard({ nutrientData }: NutrientStatsCardProps) {
  const [bmrStep, setBmrStep] = useState(0);
  const [tdeeStep, setTdeeStep] = useState(0);
  const BMR_TOTAL_STEPS = 2;
  const TDEE_TOTAL_STEPS = 2;

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
                    className="hover:bg-muted-foreground/25 hover:text-popover-foreground/75 h-6 w-6 cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Какво е BMR?</h4>
                    {bmrStep === 0 && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          BMR (Базов метаболизъм) е общото количество енергия, което е нужно на тялото, за да поддържа
                          жизнените си функции.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Дори когато сме в покой, тялото ни работи неуморно и извършва множество различни процеси,
                          които ни поддържат живи. Това са процесите на храносмилане, дишане, кръвообращение, поддържане
                          на телесната температура, клетъчно делене и т.н. Всички тези процеси изискват определено
                          количество енергия, за да могат да протичат оптимално.
                        </p>
                      </div>
                    )}
                    {bmrStep === 1 && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Базовият метаболизъм, подобно на BF%, се изчислява по различен начин за двата пола.
                        </p>
                        <p className="text-foreground text-sm leading-relaxed font-medium">За мъже:</p>
                        <div className="text-foreground text-sm leading-relaxed">
                          <div className="max-w-full overflow-x-auto">
                            <BlockMath math="\mathit{BMR} = 10 \times \mathit{тегло\ (kg)} + 6.25 \times \mathit{височина\ (cm)} - 5 \times \mathit{възраст} + 5" />
                          </div>
                        </div>
                        <p className="text-foreground text-sm leading-relaxed font-medium">За жени:</p>
                        <div className="text-foreground text-sm leading-relaxed">
                          <div className="max-w-full overflow-x-auto">
                            <BlockMath math="\mathit{BMR} = 10 \times \mathit{тегло\ (kg)} + 6.25 \times \mathit{височина\ (cm)} - 5 \times \mathit{възраст} - 161" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <button
                        className="text-foreground flex cursor-pointer items-center gap-1 text-sm disabled:opacity-50"
                        onClick={() => setBmrStep(Math.max(0, bmrStep - 1))}
                        disabled={bmrStep === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                      </button>

                      <span className="text-muted-foreground text-xs">
                        {bmrStep + 1} / {BMR_TOTAL_STEPS}
                      </span>

                      <button
                        className="text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium disabled:opacity-50"
                        onClick={() => setBmrStep(Math.min(BMR_TOTAL_STEPS - 1, bmrStep + 1))}
                        disabled={bmrStep === BMR_TOTAL_STEPS - 1}
                      >
                        Напред
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-medium">Вашият BMR: {nutrientData.bmr} kcal</p>
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
                    className="hover:bg-muted-foreground/25 hover:text-popover-foreground/75 h-6 w-6 cursor-pointer"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Какво е TDEE?</h4>
                    {tdeeStep === 0 && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          TDEE (Общ дневен енергиен разход) е количеството калории, от което човек има нужда в текущото
                          си състояние и изразходва на ден, докато извършва всички дейности в ежедневието си.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Докато BMR посочва калориите, които тялото изгаря в пълен покой за жизненоважни функции и се
                          счита за долна граница на прием, TDEE е резултат от:
                        </p>
                        <div className="text-foreground text-sm leading-relaxed">
                          <div className="max-w-full overflow-x-auto">
                            <BlockMath math="\mathit{TDEE} = \mathit{BMR} \times \mathit{степен\ на\ физическа\ активност}" />
                          </div>
                        </div>
                      </div>
                    )}
                    {tdeeStep === 1 && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          TDEE представлява точката на поддръжка - калориите, при които телесното тегло остава стабилно.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          За да постигнем желаните промени в композицията на тялото, е необходимо да се придържаме към
                          целенасочено отклонение от това равновесие - калориен дефицит или калориен суфицит. Величината
                          и посоката на отклонението определят естеството на промяната.
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <button
                        className="text-foreground flex cursor-pointer items-center gap-1 text-sm disabled:opacity-50"
                        onClick={() => setTdeeStep(Math.max(0, tdeeStep - 1))}
                        disabled={tdeeStep === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                      </button>

                      <span className="text-muted-foreground text-xs">
                        {tdeeStep + 1} / {TDEE_TOTAL_STEPS}
                      </span>

                      <button
                        className="text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium disabled:opacity-50"
                        onClick={() => setTdeeStep(Math.min(TDEE_TOTAL_STEPS - 1, tdeeStep + 1))}
                        disabled={tdeeStep === TDEE_TOTAL_STEPS - 1}
                      >
                        Напред
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-medium">Вашият TDEE: {nutrientData.tdee} kcal</p>
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
