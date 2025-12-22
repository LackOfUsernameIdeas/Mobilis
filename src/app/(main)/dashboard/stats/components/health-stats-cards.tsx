"use client";

import { Scale, Percent, Crosshair, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoalRecommendation } from "@/server/recommendedGoal";
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

interface HealthStatsCardsProps {
  bmiData: {
    bmi: number;
    health: string;
    healthy_bmi_range: string;
  };
  bodyFatData: {
    bodyFat: number;
    bodyFatMass: number;
    leanBodyMass: number;
  };
  goalData: GoalRecommendation;
}

const BODY_FAT_CATEGORY_BG: Record<string, string> = {
  critical: "Критично ниски",
  essential: "Основни",
  athletes: "Атлетични",
  fitness: "Фитнес",
  average: "Нормални",
  obese: "Затлъстяване",
};

const TOTAL_STEPS = 3;

export function HealthStatsCards({ bmiData, bodyFatData, goalData }: HealthStatsCardsProps) {
  const [step, setStep] = useState<number>(0);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const getBMIVariant = (category: string) => {
    if (category === "Normal") return "default";
    if (category.includes("Thinness") || category.includes("Obesity")) return "destructive";
    return "secondary";
  };

  const getBodyFatVariant = (category: string) => {
    if (category === "fitness" || category === "athletes") return "default";
    if (category === "critical" || category === "obese") return "destructive";
    return "secondary";
  };

  const getBMIDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      "Сериозно недохранване": "Тежка слабост - критичен здравен риск, изискващ незабавна медицинска намеса.",
      "Средно недохранване": "Умерена слабост - недостатъчно тегло, което трябва да се коригира.",
      "Леко недохранване": "Лека слабост - леко под нормалния диапазон на теглото.",
      Нормално: "Нормален диапазон на теглото, свързан с оптимални здравни резултати.",
      "Наднормено тегло": "Наднормено тегло - може да увеличи здравните рискове при повишена мастна тъкан.",
      "Затлъстяване I Клас": "Затлъстяване клас I - умерени здравни рискове.",
      "Затлъстяване II Клас": "Затлъстяване клас II - сериозни здравни рискове.",
      "Затлъстяване III Клас": "Затлъстяване клас III - много сериозни здравни рискове, изискващи медицинска намеса.",
    };
    return descriptions[category] || "Няма налична информация.";
  };

  const getBodyFatDescription = (category: string) => {
    const descriptions: Record<string, string> = {
      critical: "Критично ниско телесно мазнини - сериозни здравни рискове.",
      essential: "Основни нива на телесно мазнини, необходими за базисна физиологична функция.",
      athletes: "Атлетични нива на телесно мазнини, типични за състезателни спортисти.",
      fitness: "Фитнес-ориентирани нива на телесно мазнини, свързани с добро здраве.",
      average: "Средни нива на телесно мазнини в приемлив здравен диапазон.",
      obese: "Повишени нива на телесно мазнини, свързани с увеличени здравни рискове.",
    };
    return descriptions[category] || "Няма налична информация.";
  };
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
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
                Индекс на телесна маса (ИТМ)
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
                    <Button variant="ghost" size="icon" className="hover:bg-muted-foreground/25 h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Какво е ИТМ?</h4>
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          ИТМ (или BMI) e показател, който служи за определяне на нормалното, здравословно тегло при
                          хора с различен ръст и за диагностициране на затлъстяване и недохранване.
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Изчислява се по следната формула:
                        </p>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          <BlockMath math="\mathit{ИТМ} = \frac{\mathit{тегло\ (kg)}}{\mathit{ръст}^2\ \mathit{(m}^2\mathit{)}}" />
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
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">{bmiData.bmi}</CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Здравословен диапазон: {bmiData.healthy_bmi_range}
            </div>
          </CardFooter>
        </Card>
      </motion.div>

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
                Телесни мазнини
              </CardDescription>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    getBodyFatVariant(goalData.bodyFatCategory) === "destructive"
                      ? "border-destructive text-destructive"
                      : ""
                  }
                >
                  {BODY_FAT_CATEGORY_BG[goalData.bodyFatCategory] ?? goalData.bodyFatCategory}
                </Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted-foreground/25 h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Какво са телесните мазнини?</h4>
                      {step === 0 && (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Телесните мазнини са мастната тъкан в тялото, която служи за съхранение на енергия, защита
                            на органите и регулиране на хормоните.
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Процентът телесни мазнини (BF%) показва каква част от телесното тегло се състои от мазнини и
                            дава по-точна представа за здравето от ИТМ.
                          </p>
                        </div>
                      )}
                      {step === 1 && (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            Изчислява се по формулата на американските военноморски сили (ACE/Navy Method), която
                            използва обиколките на тялото:
                          </p>
                          {/* Male formula */}
                          <p className="text-muted-foreground text-sm leading-relaxed font-medium">За мъже:</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{BF\%} = 86.010 \cdot \log_{10}(\mathit{талия} - \mathit{врат}) - 70.041 \cdot \log_{10}(\mathit{височина}) + 36.76" />
                            </div>
                          </p>
                          {/* Female formula */}
                          <p className="text-muted-foreground text-sm leading-relaxed font-medium">За жени:</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{BF\%} = 163.205 \cdot \log_{10}(\mathit{талия} + \mathit{таз} - \mathit{врат}) - 97.684 \cdot \log_{10}(\mathit{височина}) - 78.387" />
                            </div>
                          </p>
                        </div>
                      )}
                      {step === 2 && (
                        <div className="space-y-3">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            След като се изчисли BF%, можем да определим:
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{Мазнинна\ маса\ (kg)} = \mathit{тегло\ (kg)} \times \frac{\mathit{BF\%}}{100}" />
                            </div>
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            <div className="max-w-full overflow-x-auto">
                              <BlockMath math="\mathit{Чиста\ маса\ (kg)} = \mathit{тегло\ (kg)} - \mathit{мазнинна\ маса\ (kg)}" />
                            </div>
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-2">
                        <button
                          className="text-muted-foreground flex items-center gap-1 text-sm disabled:opacity-50"
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
                          className="text-muted-foreground flex items-center gap-1 text-sm font-medium disabled:opacity-50"
                          onClick={next}
                          disabled={step === TOTAL_STEPS - 1}
                        >
                          Напред
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="space-y-2 border-t pt-4">
                        <p className="text-sm font-medium">
                          Вашата категория: {BODY_FAT_CATEGORY_BG[goalData.bodyFatCategory] ?? goalData.bodyFatCategory}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {getBodyFatDescription(goalData.bodyFatCategory)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Мазнинна маса:</span> {bodyFatData.bodyFatMass} кг
                        </p>
                        <p className="text-muted-foreground text-sm">
                          <span className="font-medium">Чиста маса:</span> {bodyFatData.leanBodyMass} кг
                        </p>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
              {bodyFatData.bodyFat}%
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">Мазнинна маса: {bodyFatData.bodyFatMass} кг</div>
          </CardFooter>
        </Card>
      </motion.div>

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
                  {goalData.goal.replace("_", " ").toUpperCase()}
                </Badge>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted-foreground/25 h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Вашата препоръчана цел</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Въз основа на вашия ИТМ и процент на телесни мазнини, препоръчваме следната цел за оптимизиране
                        на вашето здраве и физическа форма.
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
