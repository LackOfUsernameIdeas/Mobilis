"use client";

import { Scale, Percent, Crosshair, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useState } from "react";
import { BlockMath } from "react-katex";
import { getBMIVariant, getBMIDescription, getBodyFatDescription } from "../helper_functions";
import { GOAL_TO_BG } from "../constants";
import type { BMIData, BodyFatData, GoalData } from "../types";

interface HealthStatsCardsProps {
  bmiData: BMIData;
  bodyFatData: BodyFatData;
  goalData: GoalData;
}

const TOTAL_STEPS = 3;

export function HealthStatsCards({ bmiData, bodyFatData, goalData }: HealthStatsCardsProps) {
  const [step, setStep] = useState<number>(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-1 @5xl/main:grid-cols-3">
      {/* BMI Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="h-full"
      >
        <Card className="@container/card flex h-full flex-col">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <CardDescription className="mb-0 flex items-center gap-2">
                <Scale className="size-4" />
                BMI (Индекс на телесна маса)
              </CardDescription>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    getBMIVariant(bmiData.health) === "destructive" ? "border-destructive text-destructive" : ""
                  }
                >
                  {bmiData.health}
                </Badge>
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
                    <div className="space-y-2">
                      <h4 className="font-semibold">Какво е BMI?</h4>
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          BMI e медико-биологичен показател, който служи за определяне на съотношението между теглото и
                          ръста на човек.
                        </p>
                        <p className="text-foreground text-sm leading-relaxed">
                          Неговата стойност се изчислява по формулата:
                        </p>
                        <div className="text-foreground text-sm leading-relaxed">
                          <BlockMath math="\mathit{BMI} = \frac{\mathit{тегло\ (kg)}}{\left[\; \mathit{ръст\ (m)} \;\right]^2}" />
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Получената числова стойност се сравнява със стандартизирани клинични диапазони, установени от
                          Световната здравна организация (СЗО) въз основа на епидемиологични изследвания на милиони
                          хора, които определят категориите на телесно състояние
                        </p>
                      </div>
                      <div className="border-t pt-2">
                        <p className="text-sm font-medium">Вашата категория: {bmiData.health}</p>
                        <p className="text-muted-foreground mt-1 text-sm">{getBMIDescription(bmiData.health)}</p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-5xl">{bmiData.bmi}</CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Здравословен диапазон: {bmiData.healthy_bmi_range}
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Body Fat Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="h-full"
      >
        <Card className="@container/card flex h-full flex-col">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <CardDescription className="mb-0 flex items-center gap-2">
                <Percent className="size-4" />
                BF% (процент телесни мазнини)
              </CardDescription>
              <div className="flex items-center gap-2">
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
                      <h4 className="font-semibold">Какво е BF%?</h4>
                      {step === 0 && (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            BF% е медико-биологичен показател, който отразява относителното съдържание на телесни
                            мазнини в организма, спрямо общата телесна маса.
                          </p>
                        </div>
                      )}
                      {step === 1 && (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            За изчисляването се използва U.S. Navy метод (Navy Body Fat Formula). Методът използва
                            обиколки на различни части на тялото, както и ръст:
                          </p>
                          <p className="text-foreground text-sm leading-relaxed font-medium">За мъже:</p>
                          <div className="text-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{BF\%} = 86.01 \cdot \log_{10}(\mathit{талия} - \mathit{врат}) - 70.041 \cdot \log_{10}(\mathit{височина}) + 36.76" />
                            </div>
                          </div>
                          <p className="text-foreground text-sm leading-relaxed font-medium">За жени:</p>
                          <div className="text-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{BF\%} = 163.205 \cdot \log_{10}(\mathit{талия} + \mathit{таз} - \mathit{врат}) - 97.684 \cdot \log_{10}(\mathit{височина}) - 78.387" />
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Получената стойност се сравнява със стандартизираните диапазони на Американския съвет за
                            упражнения (ACE), които класифицират телесното състояние въз основа на научни изследвания в
                            областта на спортната медицина и хранителната физиология
                          </p>
                        </div>
                      )}
                      {step === 2 && (
                        <div>
                          <p className="text-muted-foreground text-sm leading-relaxed">Съвместно с BF% се определят:</p>
                          <div className="text-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{BFM\ (Мастна\ телесна\  маса)} = \mathit{тегло\ (kg)} \times \frac{\mathit{BF\%}}{100}" />
                            </div>
                          </div>
                          <div className="text-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{LBM\ (Чиста\ телесна\  маса)} = \mathit{тегло\ (kg)} - \mathit{BFM\ (kg)}" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2">
                        <button
                          className="text-foreground flex cursor-pointer items-center gap-1 text-sm disabled:opacity-50"
                          onClick={prev}
                          disabled={step === 0}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Назад
                        </button>

                        <span className="text-muted-foreground text-xs">
                          {step + 1} / {TOTAL_STEPS}
                        </span>

                        <button
                          className="text-foreground flex cursor-pointer items-center gap-1 text-sm font-medium disabled:opacity-50"
                          onClick={next}
                          disabled={step === TOTAL_STEPS - 1}
                        >
                          Напред
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <p className="text-sm font-medium">Вашето състояние:</p>
                        <p className="text-muted-foreground text-sm">
                          {getBodyFatDescription(goalData.bodyFatCategory)}
                        </p>
                        <p className="text-foreground text-sm">
                          <span className="font-medium">BFM (Мастна телесна маса):</span> {bodyFatData.bodyFatMass} кг
                        </p>
                        <p className="text-foreground text-sm">
                          <span className="font-medium">LBM (Чиста телесна маса):</span> {bodyFatData.leanBodyMass} кг
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-5xl">
              {bodyFatData.bodyFat}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              BFM (Мастна телесна маса): {bodyFatData.bodyFatMass} кг
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Goal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="h-full"
      >
        <Card className="@container/card flex h-full flex-col">
          <CardHeader className="flex-1">
            <div className="mb-2 flex items-center justify-between">
              <CardDescription className="mb-0 flex items-center gap-2">
                <Crosshair className="size-4" />
                Препоръчана цел
              </CardDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-chart-1 text-chart-1">
                  {GOAL_TO_BG[goalData.goal]}
                </Badge>
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
                    <div className="space-y-2">
                      <h4 className="font-semibold">Вашата препоръчана цел</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Въз основа на текущото физическо състояние – според здравните показатели, системата предоставя
                        индивидуално съобразена насока, която всеки да има възможност да следва. Целта е по-лесно
                        ориентиране в съставянето на режими и тренировки, с които да се постига ефективен краен
                        резултат.
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold text-pretty @[250px]/card:text-3xl">
              {goalData.goalName}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="line-clamp-1 cursor-pointer text-left leading-relaxed font-medium hover:underline">
                  {goalData.reasoning}
                </button>
              </DialogTrigger>
              <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                  <DialogTitle>{goalData.goalName}</DialogTitle>
                  <DialogDescription className="pt-2 text-left leading-relaxed">{goalData.reasoning}</DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
