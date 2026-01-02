"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";
import { fetchNutrientRecommendations, validateNumericInput, calculateWeightDifference } from "../helper_functions";
import {
  CUISINE_OPTIONS,
  GOAL_OPTIONS,
  TRAINING_TIME_OPTIONS,
  INPUT_LIMITS,
  ANIMATION_VARIANTS,
  FORM_TEXT,
} from "../constants";
import type { FormAnswers, NutritionFormProps, FormQuestion, QuestionOption } from "../types";

export default function NutritionForm({ onSubmit, usersStats }: NutritionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<FormAnswers>({
    mainGoal: usersStats?.goal || "",
    trainingTime: "",
    targetWeight: "",
    targetWeightValue: "",
    healthIssues: "",
    cuisinePreference: [],
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    const fetchNutrientsForGoal = async () => {
      if (answers.mainGoal && usersStats) {
        try {
          const recommendations = await fetchNutrientRecommendations({
            height: usersStats.height || 0,
            weight: usersStats.weight || 0,
            age: usersStats.age || 0,
            gender: usersStats.gender || "male",
            activityLevel: usersStats.activityLevel || "moderate",
            goal: answers.mainGoal,
          });

          if (recommendations) {
            setAnswers((prev) => ({
              ...prev,
              calories: recommendations.calories.toString(),
              protein: recommendations.protein.toString(),
              carbs: recommendations.carbs.toString(),
              fats: recommendations.fats.toString(),
            }));
          }
        } catch (error) {
          console.error("Error fetching recommendations for goal:", error);
        }
      }
    };

    fetchNutrientsForGoal();
  }, [answers.mainGoal, usersStats]);

  const questions: FormQuestion[] = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: GOAL_OPTIONS,
    },
    {
      field: "trainingTime",
      title: "По кое време намирате (или бихте желали да намирате) възможност да тренирате?",
      type: "radio",
      options: TRAINING_TIME_OPTIONS,
    },
    {
      field: "targetWeight",
      title: "Има ли конкретно целево тегло, до което желаете да стигнете?",
      type: "target-weight",
      currentWeight: usersStats?.weight,
    },
    {
      field: "healthIssues",
      title: "Съществуват ли здравословни проблеми, алергии или други особености, свързани с храненето ви?",
      type: "textarea",
      placeholder: FORM_TEXT.healthIssuesPlaceholder,
    },
    {
      field: "nutrients",
      title: "Какви стойности на дневни нутриенти желаете?",
      type: "nutrients",
      description: FORM_TEXT.nutrients.description,
    },
    {
      field: "cuisinePreference",
      title: "Ястия от каква кухня предпочитате?",
      type: "checkbox",
      options: Array.from(CUISINE_OPTIONS),
    },
  ];

  const handleChange = (field: keyof FormAnswers, value: any) => {
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

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const noPreferenceOption = "Нямам предпочитания";

    setAnswers((prev) => {
      if (cuisine === noPreferenceOption && checked) {
        return {
          ...prev,
          cuisinePreference: [noPreferenceOption],
        };
      }

      if (checked && prev.cuisinePreference.includes(noPreferenceOption)) {
        return {
          ...prev,
          cuisinePreference: [cuisine],
        };
      }

      return {
        ...prev,
        cuisinePreference: checked
          ? [...prev.cuisinePreference, cuisine]
          : prev.cuisinePreference.filter((c) => c !== cuisine),
      };
    });
  };

  const handleNumericInput = (field: keyof FormAnswers, value: string, limitKey: keyof typeof INPUT_LIMITS) => {
    const limit = INPUT_LIMITS[limitKey];
    if (validateNumericInput(value, limit.pattern, limit.max)) {
      handleChange(field, value);
    }
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;

    if (currentField === "targetWeight") {
      const answer = answers.targetWeight;
      if (answer === "no") return true;
      if (answer === "yes") {
        return !!answers.targetWeightValue && answers.targetWeightValue.trim() !== "";
      }
      return false;
    }

    if (currentField === "nutrients") {
      return !!answers.calories && !!answers.protein && !!answers.carbs && !!answers.fats;
    }

    const answer = answers[currentField as keyof FormAnswers];
    if (typeof answer === "string") return answer.trim() !== "";
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
              <CardTitle className="text-foreground text-xl sm:text-2xl">{FORM_TEXT.title}</CardTitle>
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
            <CardDescription className="text-foreground text-xs sm:text-sm">{FORM_TEXT.description}</CardDescription>
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
                      value={answers[question.field as keyof FormAnswers] as string}
                      onValueChange={(value) => handleChange(question.field as keyof FormAnswers, value)}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {(question.options as QuestionOption[])?.map((option, index) => {
                          const isRecommended = question.field === "mainGoal" && option.value === usersStats?.goal;

                          return (
                            <motion.div
                              key={option.value}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.2,
                                delay: index * 0.05,
                                ease: [0.21, 0.47, 0.32, 0.98] as any,
                              }}
                            >
                              <Label
                                htmlFor={option.value}
                                className={`hover:bg-muted/50 flex cursor-pointer flex-col items-start space-y-1 rounded-lg p-3 transition-colors ${
                                  isRecommended ? "border-primary bg-primary/5 hover:bg-primary/10 border-2" : ""
                                }`}
                              >
                                <div className="flex w-full items-start justify-between space-x-3">
                                  <div className="flex flex-1 items-center space-x-3">
                                    <RadioGroupItem
                                      value={option.value}
                                      id={option.value}
                                      className="h-4 w-4 flex-shrink-0"
                                    />
                                    <span className="text-foreground flex-1 text-sm font-medium">{option.label}</span>
                                  </div>
                                  {isRecommended && (
                                    <span className="bg-primary text-primary-foreground flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium">
                                      {FORM_TEXT.recommendedBadge}
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

                  {question.type === "target-weight" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="space-y-4"
                    >
                      <div className="bg-muted/50 border-border group hover:border-primary/30 relative overflow-hidden rounded-lg border-2 p-4 transition-all duration-300">
                        <div className="from-primary/5 to-primary/0 absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        <div className="relative flex items-center gap-3">
                          <div className="bg-primary/10 rounded-full p-2">
                            <Scale className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">{FORM_TEXT.targetWeight.currentWeight}</p>
                            <p className="text-foreground text-lg font-semibold">
                              {usersStats?.weight} {FORM_TEXT.targetWeight.unit}
                            </p>
                          </div>
                        </div>
                      </div>

                      <RadioGroup
                        value={answers.targetWeight}
                        onValueChange={(value) => handleChange("targetWeight", value)}
                      >
                        <div className="space-y-3">
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                          >
                            <Label
                              htmlFor="target-yes"
                              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                            >
                              <RadioGroupItem value="yes" id="target-yes" className="h-4 w-4 flex-shrink-0" />
                              <span className="text-foreground flex-1 text-sm font-normal">
                                {FORM_TEXT.targetWeight.yes}
                              </span>
                            </Label>
                          </motion.div>

                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                          >
                            <Label
                              htmlFor="target-no"
                              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                            >
                              <RadioGroupItem value="no" id="target-no" className="h-4 w-4 flex-shrink-0" />
                              <span className="text-foreground flex-1 text-sm font-normal">
                                {FORM_TEXT.targetWeight.no}
                              </span>
                            </Label>
                          </motion.div>
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
                              {FORM_TEXT.targetWeight.inputLabel}
                            </Label>
                            <div className="relative">
                              <Input
                                id="target-weight-value"
                                type="text"
                                inputMode="decimal"
                                placeholder={FORM_TEXT.targetWeight.inputPlaceholder}
                                value={answers.targetWeightValue}
                                onChange={(e) =>
                                  handleNumericInput("targetWeightValue", e.target.value, "targetWeight")
                                }
                                className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                              />
                              <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                                {FORM_TEXT.targetWeight.unit}
                              </span>
                            </div>
                            {answers.targetWeightValue && usersStats?.weight && (
                              <p className="text-muted-foreground text-xs">
                                {calculateWeightDifference(parseFloat(answers.targetWeightValue), usersStats?.weight)}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {question.type === "checkbox" && (
                    <div className="space-y-2 sm:space-y-3">
                      {(question.options as string[])?.map((cuisine, index) => (
                        <motion.div
                          key={cuisine}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.05,
                            ease: [0.21, 0.47, 0.32, 0.98] as any,
                          }}
                        >
                          <Label
                            htmlFor={`cuisine-${cuisine}`}
                            className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                          >
                            <Checkbox
                              id={`cuisine-${cuisine}`}
                              checked={answers.cuisinePreference.includes(cuisine)}
                              onCheckedChange={(checked) => handleCuisineChange(cuisine, checked as boolean)}
                              className="h-4 w-4 flex-shrink-0"
                            />
                            <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{cuisine}</span>
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
                        value={answers[question.field as keyof FormAnswers] as string}
                        onChange={(e) => handleChange(question.field as keyof FormAnswers, e.target.value)}
                        disabled={answers[question.field as keyof FormAnswers] === FORM_TEXT.noHealthIssues}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.field}-none`}
                          checked={answers[question.field as keyof FormAnswers] === FORM_TEXT.noHealthIssues}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleChange(question.field as keyof FormAnswers, FORM_TEXT.noHealthIssues);
                            } else {
                              handleChange(question.field as keyof FormAnswers, "");
                            }
                          }}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`${question.field}-none`}
                          className="text-foreground cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          {FORM_TEXT.noHealthIssues}
                        </Label>
                      </div>
                    </motion.div>
                  )}

                  {question.type === "nutrients" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                      className="space-y-4"
                    >
                      <p className="text-muted-foreground text-xs sm:text-sm">{question.description}</p>

                      <div className="space-y-3 sm:space-y-4">
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.05, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                        >
                          <Label htmlFor="calories" className="text-foreground mb-2 block text-xs sm:text-sm">
                            {FORM_TEXT.nutrients.calories}
                          </Label>
                          <div className="relative">
                            <Input
                              id="calories"
                              type="text"
                              inputMode="decimal"
                              placeholder="напр. 2000"
                              value={answers.calories}
                              onChange={(e) => handleNumericInput("calories", e.target.value, "calories")}
                              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-16 text-sm"
                            />
                            <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                              kcal
                            </span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.1, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                        >
                          <Label htmlFor="protein" className="text-foreground mb-2 block text-xs sm:text-sm">
                            {FORM_TEXT.nutrients.protein}
                          </Label>
                          <div className="relative">
                            <Input
                              id="protein"
                              type="text"
                              inputMode="decimal"
                              placeholder="напр. 150"
                              value={answers.protein}
                              onChange={(e) => handleNumericInput("protein", e.target.value, "protein")}
                              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                            />
                            <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">g</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                        >
                          <Label htmlFor="carbs" className="text-foreground mb-2 block text-xs sm:text-sm">
                            {FORM_TEXT.nutrients.carbs}
                          </Label>
                          <div className="relative">
                            <Input
                              id="carbs"
                              type="text"
                              inputMode="decimal"
                              placeholder="напр. 200"
                              value={answers.carbs}
                              onChange={(e) => handleNumericInput("carbs", e.target.value, "carbs")}
                              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                            />
                            <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">g</span>
                          </div>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] as any }}
                        >
                          <Label htmlFor="fats" className="text-foreground mb-2 block text-xs sm:text-sm">
                            {FORM_TEXT.nutrients.fats}
                          </Label>
                          <div className="relative">
                            <Input
                              id="fats"
                              type="text"
                              inputMode="decimal"
                              placeholder="напр. 65"
                              value={answers.fats}
                              onChange={(e) => handleNumericInput("fats", e.target.value, "fats")}
                              className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                            />
                            <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">g</span>
                          </div>
                        </motion.div>
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
                  {FORM_TEXT.buttons.back}
                </Button>
              )}
              {!isLastQuestion ? (
                <Button
                  type="button"
                  onClick={moveToNextQuestion}
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {FORM_TEXT.buttons.next}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {FORM_TEXT.buttons.submit}
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
