"use client";

import type React from "react";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";

interface GymCalisthenicsFormProps {
  onSubmit: (answers: Record<string, any>) => void;
  isCategoryGym: boolean;
  usersWeight: number;
  usersGoal: string;
  onBack: () => void;
}

export default function GymCalisthenicsForm({
  onSubmit,
  isCategoryGym,
  usersWeight,
  usersGoal,
  onBack,
}: GymCalisthenicsFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: usersGoal,
    experience: "",
    frequency: 0,
    warmupCooldown: "",
    muscleGroups: [],
    targetWeight: "",
    targetWeightValue: "",
    healthIssues: "",
    specificExercises: "",
  });

  const muscleGroupOptions = ["Гърди", "Гръб", "Рамене", "Ръце", "Корем", "Крака", "Нямам предпочитания"];

  const questions = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: [
        {
          value: "cut",
          label: "Cut (Загуба на мазнини)",
          description: "Тренировки, насочени към изгаряне на телесните мазнини",
        },
        {
          value: "aggressive_cut",
          label: "Aggressive Cut (Екстремна загуба на мазнини)",
          description: "Интензивни тренировки за бързо изгаряне на телесните мазнини",
        },
        {
          value: "lean_bulk",
          label: "Lean Bulk (Покачване на мускулна маса)",
          description: "Тренировки, насочени към постепенно и контролирано покачване на мускулна маса",
        },
        {
          value: "dirty_bulk",
          label: "Dirty Bulk (Интензивно покачване на маса)",
          description: "Интензивни тренировки за бързо набавяне на маса - мускулна и мастна",
        },
        {
          value: "recomposition",
          label: "Recomposition (Телесна рекомпозиция)",
          description:
            "Тренировки, насочени към едновременното изгаряне на телесните мазнини и покачване на мускулна маса",
        },
        {
          value: "maintenance",
          label: "Maintenance (Поддържане на текущата форма)",
          description: "Тренировки за запазване на текущото тегло и форма",
        },
        {
          value: "aesthetic",
          label: "Aesthetic (Естетика и пропорции)",
          description: "Тренировки, насочени към постигане на естетичен външен вид и балансирани пропорции",
        },
        {
          value: "strength",
          label: "Strength (Максимална сила)",
          description: "Тренировки с фокус върху максимална сила и силови показатели",
        },
      ],
    },
    {
      field: "experience",
      title: "Какво е вашето ниво на опит в тренировките?",
      type: "radio",
      options: [
        {
          value: "beginner",
          label: "Начинаещ",
          description: "Тренирате от кратко време",
        },
        {
          value: "basic",
          label: "Базово ниво",
          description: "Изпълнявате основни упражнения правилно",
        },
        {
          value: "intermediate",
          label: "Средно ниво",
          description: "Познавате силните и слабите си страни",
        },
        {
          value: "advanced",
          label: "Напреднал",
          description: "Работите с по-сложни програми",
        },
        {
          value: "expert",
          label: "Експерт",
          description: "Имате дългогодишна практика",
        },
      ],
    },
    {
      field: "frequency",
      title: "Колко често бихте имали възможност да тренирате?",
      type: "radio-grid",
      options: [2, 3, 4, 5, 6, 7],
    },
    {
      field: "warmupCooldown",
      title: "Желаете ли програмата да включва препоръки за загряване преди тренировка и разтягане след нея?",
      type: "radio-horizontal",
      options: [
        { value: "yes", label: "Да" },
        { value: "no", label: "Не" },
      ],
    },
    {
      field: "muscleGroups",
      title: "Има ли конкретна мускулна група, върху която желаете да се фокусирате предимно?",
      type: "checkbox",
      options: muscleGroupOptions,
    },
    {
      field: "targetWeight",
      title: "Има ли конкретно целево тегло, до което желаете да стигнете?",
      type: "target-weight",
      currentWeight: usersWeight,
    },
    {
      field: "healthIssues",
      title: "Съществуват ли някакви здравословни проблеми, контузии или ограничения?",
      type: "textarea",
      placeholder: "напр. болки в кръста, проблеми със ставите, сърдечни заболявания",
    },
    {
      field: "specificExercises",
      title: "Има ли конкретни упражнения, които желаете да бъдат включени в програмата?",
      type: "textarea",
      placeholder: "напр. Bench Press, Deadlift, Squats, Pull-ups",
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => {
      // If changing targetWeight to "no", clear the targetWeightValue
      if (field === "targetWeight" && value === "no") {
        return {
          ...prev,
          [field]: value,
          targetWeightValue: null,
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleMuscleGroupChange = (group: string, checked: boolean) => {
    setAnswers((prev) => {
      // If "Нямам предпочитания" is being checked, clear all others
      if (group === "Нямам предпочитания" && checked) {
        return {
          ...prev,
          muscleGroups: ["Нямам предпочитания"],
        };
      }

      // If any other group is being checked, remove "Нямам предпочитания"
      if (checked && prev.muscleGroups.includes("Нямам предпочитания")) {
        return {
          ...prev,
          muscleGroups: [group],
        };
      }

      // Normal checkbox behavior
      return {
        ...prev,
        muscleGroups: checked ? [...prev.muscleGroups, group] : prev.muscleGroups.filter((g: string) => g !== group),
      };
    });
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;
    const answer = answers[currentField];

    if (currentField === "targetWeight") {
      if (answer === "no") return true;
      if (answer === "yes") {
        return answers.targetWeightValue && answers.targetWeightValue.trim() !== "";
      }
      return false;
    }

    if (typeof answer === "string") return answer.trim() !== "";
    if (typeof answer === "number") return answer > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    return false;
  };

  const moveToNextQuestion = () => {
    if (isCurrentQuestionAnswered()) {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentQuestionAnswered()) {
      onSubmit(answers);
    }
  };

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      <Card className="border-border bg-card">
        <CardHeader className="border-border bg-card/50 border-b">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="text-foreground cursor-pointer text-xl transition-colors sm:text-2xl"
                  aria-label="Назад"
                >
                  ←
                </button>
                <CardTitle className="text-foreground text-xl sm:text-2xl">
                  Въпросник за {isCategoryGym ? "фитнес" : "калистенични"} препоръки
                </CardTitle>
              </div>
              <span className="text-foreground text-xs sm:text-sm">
                Въпрос {currentQuestion + 1} от {questions.length}
              </span>
            </div>
            <motion.div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              />
            </motion.div>
            <CardDescription className="text-foreground text-xs sm:text-sm">
              Отговорете на няколко въпроса, за да получите персонализирани препоръки
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <fieldset className="space-y-3 sm:space-y-4">
                  <Label className="text-foreground text-sm font-semibold sm:text-base">{question.title}</Label>

                  {question.type === "radio" && (
                    <RadioGroup
                      value={answers[question.field]}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {question.options?.map((option: any, index: number) => {
                          const isRecommended = question.field === "mainGoal" && option.value === usersGoal;
                          return (
                            <motion.div
                              key={option.value}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                                ease: [0.21, 0.47, 0.32, 0.98],
                              }}
                            >
                              <Label
                                htmlFor={option.value}
                                className={`hover:bg-muted/50 flex cursor-pointer flex-col items-start space-y-1 rounded-lg p-3 transition-colors ${
                                  isRecommended ? "border-primary bg-primary/5 hover:bg-primary/10 border-2" : ""
                                }`}
                              >
                                <div className="flex w-full items-start justify-between space-x-3">
                                  <div className="flex flex-1 items-start space-x-3">
                                    <RadioGroupItem
                                      value={option.value}
                                      id={option.value}
                                      className="mt-0.5 h-4 w-4 flex-shrink-0"
                                    />
                                    <span className="text-foreground flex-1 text-sm font-medium">{option.label}</span>
                                  </div>
                                  {isRecommended && (
                                    <span className="bg-primary text-primary-foreground flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                                      Препоръчителна цел
                                    </span>
                                  )}
                                </div>
                                {option.description && (
                                  <span className="text-muted-foreground ml-7 text-xs">{option.description}</span>
                                )}
                              </Label>
                            </motion.div>
                          );
                        })}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "radio-grid" && (
                    <RadioGroup
                      value={answers[question.field]?.toString()}
                      onValueChange={(value) => handleChange(question.field, Number(value))}
                    >
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {(question.options as number[])?.map((day: number, index: number) => (
                          <motion.div
                            key={day}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.05,
                              ease: [0.21, 0.47, 0.32, 0.98],
                            }}
                          >
                            <Label
                              htmlFor={`freq-${day}`}
                              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                            >
                              <RadioGroupItem
                                value={day.toString()}
                                id={`freq-${day}`}
                                className="h-4 w-4 flex-shrink-0"
                              />
                              <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">
                                {day}x/седмица
                              </span>
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "radio-horizontal" && (
                    <RadioGroup
                      value={answers[question.field]?.toString()}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                        {question.options?.map((option: any, index: number) => (
                          <motion.div
                            key={option.value}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.1,
                              ease: [0.21, 0.47, 0.32, 0.98],
                            }}
                          >
                            <Label
                              htmlFor={`${question.field}-${option.value}`}
                              className="flex cursor-pointer items-center space-x-2 sm:space-x-3"
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={`${question.field}-${option.value}`}
                                className="h-4 w-4 flex-shrink-0"
                              />
                              <span className="text-foreground text-xs font-normal sm:text-sm">{option.label}</span>
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "target-weight" && (
                    <div className="space-y-4">
                      {/* Current Weight Display */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      >
                        <div className="bg-muted/50 border-border group hover:border-primary/30 relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300">
                          <div className="from-primary/5 to-primary/0 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="relative flex items-center gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                              <Scale className="text-primary h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs">Текущо тегло</p>
                              <p className="text-foreground text-lg font-semibold">{usersWeight} кг</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Radio Options */}
                      <RadioGroup
                        value={answers.targetWeight}
                        onValueChange={(value) => handleChange("targetWeight", value)}
                      >
                        <div className="space-y-3">
                          {[
                            { value: "yes", label: "Да, имам целево тегло" },
                            { value: "no", label: "Не, нямам конкретно целево тегло" },
                          ].map((option, index) => (
                            <motion.div
                              key={option.value}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: 0.1 + index * 0.1,
                                ease: [0.21, 0.47, 0.32, 0.98],
                              }}
                            >
                              <Label
                                htmlFor={`target-${option.value}`}
                                className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                              >
                                <RadioGroupItem
                                  value={option.value}
                                  id={`target-${option.value}`}
                                  className="h-4 w-4 flex-shrink-0"
                                />
                                <span className="text-foreground flex-1 text-sm font-normal">{option.label}</span>
                              </Label>
                            </motion.div>
                          ))}
                        </div>
                      </RadioGroup>

                      {/* Target Weight Input */}
                      <AnimatePresence>
                        {answers.targetWeight === "yes" && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                            className="space-y-2"
                          >
                            <Label htmlFor="target-weight-value" className="text-foreground text-xs">
                              Въведете целевото си тегло
                            </Label>
                            <div className="relative">
                              <Input
                                id="target-weight-value"
                                type="text"
                                inputMode="decimal"
                                placeholder="напр. 75.5"
                                value={answers.targetWeightValue || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  // Allow only numbers and one dot, max 3 digits before decimal, max 2 after
                                  if (value === "" || /^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                                    const numericValue = parseFloat(value);
                                    if (isNaN(numericValue) || numericValue <= 200) {
                                      handleChange("targetWeightValue", value);
                                    }
                                  }
                                }}
                                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                              />
                              <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                                кг
                              </span>
                            </div>
                            {answers.targetWeightValue && (
                              <p className="text-muted-foreground text-xs">
                                {parseFloat(answers.targetWeightValue) > usersWeight
                                  ? `+${(parseFloat(answers.targetWeightValue) - usersWeight).toFixed(1)} кг от текущото тегло`
                                  : `${(parseFloat(answers.targetWeightValue) - usersWeight).toFixed(1)} кг от текущото тегло`}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {question.type === "checkbox" && (
                    <div className="space-y-2 sm:space-y-3">
                      {(question.options as string[])?.map((group: string, index: number) => (
                        <motion.div
                          key={group}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.05,
                            ease: [0.21, 0.47, 0.32, 0.98],
                          }}
                        >
                          <Label
                            htmlFor={`muscle-${group}`}
                            className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                          >
                            <Checkbox
                              id={`muscle-${group}`}
                              checked={answers.muscleGroups.includes(group)}
                              onCheckedChange={(checked) => handleMuscleGroupChange(group, checked as boolean)}
                              className="h-4 w-4 flex-shrink-0"
                            />
                            <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{group}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {question.type === "textarea" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="space-y-3"
                    >
                      <Textarea
                        id={question.field}
                        placeholder={question.placeholder}
                        value={answers[question.field]}
                        onChange={(e) => handleChange(question.field, e.target.value)}
                        disabled={answers[question.field] === "Няма"}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.field}-none`}
                          checked={answers[question.field] === "Няма"}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleChange(question.field, "Няма");
                            } else {
                              handleChange(question.field, "");
                            }
                          }}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`${question.field}-none`}
                          className="text-foreground cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          Няма
                        </Label>
                      </div>
                    </motion.div>
                  )}
                </fieldset>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3"
            >
              {currentQuestion > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="dark:text-foreground w-full cursor-pointer text-xs sm:flex-1 sm:text-sm"
                >
                  Назад
                </Button>
              )}
              {!isLastQuestion ? (
                <Button
                  type="button"
                  onClick={moveToNextQuestion}
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  Напред
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  Получи моите препоръки
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
