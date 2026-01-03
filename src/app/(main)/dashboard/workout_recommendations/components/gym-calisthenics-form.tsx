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
import { FormAnswers, Question, QuestionOption } from "../types";
import {
  MUSCLE_GROUP_OPTIONS,
  GYM_GOAL_OPTIONS,
  EXPERIENCE_OPTIONS,
  FREQUENCY_OPTIONS,
  YES_NO_OPTIONS,
  GYM_FORM_TEXT,
  ANIMATION_VARIANTS,
  NO_PREFERENCE_OPTION,
} from "../constants";
import { calculateWeightDifference, handleExclusiveCheckbox } from "../helper_functions";

interface GymCalisthenicsFormProps {
  onSubmit: (answers: FormAnswers) => void;
  isCategoryGym: boolean;
  usersWeight?: number;
  usersGoal?: string;
  onBack: () => void;
}

interface GymCalisthenicsAnswers {
  mainGoal: string;
  experience: string;
  frequency: number;
  warmupCooldown: string;
  muscleGroups: string[];
  targetWeight: string;
  targetWeightValue: string;
  healthIssues: string;
  specificExercises: string;
}

export default function GymCalisthenicsForm({
  onSubmit,
  isCategoryGym,
  usersWeight = 0,
  usersGoal = "",
  onBack,
}: GymCalisthenicsFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<GymCalisthenicsAnswers>({
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

  const questions: Question[] = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: GYM_GOAL_OPTIONS,
    },
    {
      field: "experience",
      title: "Какво е вашето ниво на опит в тренировките?",
      type: "radio",
      options: EXPERIENCE_OPTIONS,
    },
    {
      field: "frequency",
      title: "Колко често бихте имали възможност да тренирате?",
      type: "radio-grid",
      options: FREQUENCY_OPTIONS,
    },
    {
      field: "warmupCooldown",
      title: "Желаете ли програмата да включва препоръки за загряване преди тренировка и разтягане след нея?",
      type: "radio-horizontal",
      options: YES_NO_OPTIONS,
    },
    {
      field: "muscleGroups",
      title: "Има ли конкретна мускулна група, върху която желаете да се фокусирате предимно?",
      type: "checkbox",
      options: MUSCLE_GROUP_OPTIONS,
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
      placeholder: GYM_FORM_TEXT.healthIssuesPlaceholder,
    },
    {
      field: "specificExercises",
      title: "Има ли конкретни упражнения, които желаете да бъдат включени в програмата?",
      type: "textarea",
      placeholder: GYM_FORM_TEXT.specificExercisesPlaceholder,
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => {
      if (field === "targetWeight" && value === "no") {
        return {
          ...prev,
          [field]: value,
          targetWeightValue: "",
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleMuscleGroupChange = (group: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      muscleGroups: handleExclusiveCheckbox(prev.muscleGroups, group, checked, NO_PREFERENCE_OPTION),
    }));
  };

  const handleNumericInput = (value: string) => {
    if (value === "" || /^\d{0,3}(\.\d{0,2})?$/.test(value)) {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue) || numericValue <= 200) {
        handleChange("targetWeightValue", value);
      }
    }
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;
    const answer = answers[currentField as keyof GymCalisthenicsAnswers];

    if (currentField === "targetWeight") {
      if (answer === "no") return true;
      if (answer === "yes") {
        return !!(answers.targetWeightValue && answers.targetWeightValue.trim() !== "");
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
    <motion.div {...ANIMATION_VARIANTS.fadeIn}>
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
                  {GYM_FORM_TEXT.title(isCategoryGym)}
                </CardTitle>
              </div>
              <span className="text-foreground text-xs sm:text-sm">
                Въпрос {currentQuestion + 1} от {questions.length}
              </span>
            </div>
            <motion.div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <motion.div
                className="bg-primary h-2 rounded-full"
                {...ANIMATION_VARIANTS.progressBar}
                animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </motion.div>
            <CardDescription className="text-foreground text-xs sm:text-sm">
              {GYM_FORM_TEXT.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion} {...ANIMATION_VARIANTS.slideIn}>
                <fieldset className="space-y-3 sm:space-y-4">
                  <Label className="text-foreground text-sm font-semibold sm:text-base">{question.title}</Label>

                  {question.type === "radio" && (
                    <RadioGroup
                      value={answers[question.field as keyof GymCalisthenicsAnswers] as string}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {(question.options as QuestionOption[])?.map((option, index) => {
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
                                      {GYM_FORM_TEXT.recommendedBadge}
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
                      value={answers[question.field as keyof GymCalisthenicsAnswers]?.toString()}
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
                      value={answers[question.field as keyof GymCalisthenicsAnswers]?.toString()}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                        {(question.options as QuestionOption[])?.map((option, index) => (
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
                              <p className="text-muted-foreground text-xs">
                                {GYM_FORM_TEXT.targetWeight.currentWeight}
                              </p>
                              <p className="text-foreground text-lg font-semibold">
                                {usersWeight} {GYM_FORM_TEXT.targetWeight.unit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      <RadioGroup
                        value={answers.targetWeight}
                        onValueChange={(value) => handleChange("targetWeight", value)}
                      >
                        <div className="space-y-3">
                          {[
                            { value: "yes", label: GYM_FORM_TEXT.targetWeight.yes },
                            { value: "no", label: GYM_FORM_TEXT.targetWeight.no },
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
                              {GYM_FORM_TEXT.targetWeight.inputLabel}
                            </Label>
                            <div className="relative">
                              <Input
                                id="target-weight-value"
                                type="text"
                                inputMode="decimal"
                                placeholder={GYM_FORM_TEXT.targetWeight.inputPlaceholder}
                                value={answers.targetWeightValue || ""}
                                onChange={(e) => handleNumericInput(e.target.value)}
                                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                              />
                              <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                                {GYM_FORM_TEXT.targetWeight.unit}
                              </span>
                            </div>
                            {answers.targetWeightValue && (
                              <p className="text-muted-foreground text-xs">
                                {calculateWeightDifference(parseFloat(answers.targetWeightValue), usersWeight)}
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
                              onCheckedChange={(checked) => handleMuscleGroupChange(group, !!checked)}
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
                        value={answers[question.field as keyof GymCalisthenicsAnswers] as string}
                        onChange={(e) => handleChange(question.field, e.target.value)}
                        disabled={answers[question.field as keyof GymCalisthenicsAnswers] === GYM_FORM_TEXT.noIssues}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.field}-none`}
                          checked={answers[question.field as keyof GymCalisthenicsAnswers] === GYM_FORM_TEXT.noIssues}
                          onCheckedChange={(checked) => {
                            if (!!checked) {
                              handleChange(question.field, GYM_FORM_TEXT.noIssues);
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
                          {GYM_FORM_TEXT.noIssues}
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
                  {GYM_FORM_TEXT.buttons.back}
                </Button>
              )}
              {!isLastQuestion ? (
                <Button
                  type="button"
                  onClick={moveToNextQuestion}
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {GYM_FORM_TEXT.buttons.next}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {GYM_FORM_TEXT.buttons.submit}
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
