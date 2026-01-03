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
import { FormAnswers, Question, QuestionOption } from "../types";
import { ANIMATION_VARIANTS, YOGA_FORM_TEXT, EASE_CURVE, NO_PREFERENCE_OPTION, YOGA_QUESTIONS } from "../constants";
import { handleExclusiveCheckbox } from "../helper_functions";

interface YogaFormProps {
  onSubmit: (answers: FormAnswers) => void;
  onBack: () => void;
}

interface YogaAnswers {
  mainGoal: string;
  yogaStyle: string;
  experience: string;
  frequency: number;
  warmupSavasana: string;
  focusAreas: string[];
  healthIssues: string;
  specificExercises: string;
}

export default function YogaForm({ onSubmit, onBack }: YogaFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<YogaAnswers>({
    mainGoal: "",
    yogaStyle: "",
    experience: "",
    frequency: 0,
    warmupSavasana: "",
    focusAreas: [],
    healthIssues: "",
    specificExercises: "",
  });

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      focusAreas: handleExclusiveCheckbox(prev.focusAreas, area, checked, NO_PREFERENCE_OPTION),
    }));
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = YOGA_QUESTIONS[currentQuestion].field;
    const answer = answers[currentField as keyof YogaAnswers];

    if (typeof answer === "string") return answer.trim() !== "";
    if (typeof answer === "number") return answer > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    return false;
  };

  const moveToNextQuestion = () => {
    if (isCurrentQuestionAnswered() && currentQuestion < YOGA_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCurrentQuestionAnswered()) {
      onSubmit(answers);
    }
  };

  const question = YOGA_QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === YOGA_QUESTIONS.length - 1;
  const progressPercentage = ((currentQuestion + 1) / YOGA_QUESTIONS.length) * 100;

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
                  aria-label={YOGA_FORM_TEXT.buttons.back}
                >
                  ←
                </button>
                <CardTitle className="text-foreground text-xl sm:text-2xl">{YOGA_FORM_TEXT.title}</CardTitle>
              </div>
              <span className="text-foreground text-xs sm:text-sm">
                Въпрос {currentQuestion + 1} от {YOGA_QUESTIONS.length}
              </span>
            </div>
            <motion.div className="bg-muted h-2 w-full overflow-hidden rounded-full">
              <motion.div
                className="bg-primary h-2 rounded-full"
                {...ANIMATION_VARIANTS.progressBar}
                animate={{ width: `${progressPercentage}%` }}
              />
            </motion.div>
            <CardDescription className="text-foreground text-xs sm:text-sm">
              {YOGA_FORM_TEXT.description}
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
                      value={answers[question.field as keyof YogaAnswers] as string}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="space-y-2 sm:space-y-3">
                        {(question.options as QuestionOption[])?.map((option, index) => (
                          <motion.div
                            key={option.value}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05, ease: EASE_CURVE }}
                          >
                            <Label
                              htmlFor={option.value}
                              className="hover:bg-muted/50 flex cursor-pointer flex-col items-start space-y-1 rounded-lg p-3 transition-colors"
                            >
                              <div className="flex items-start space-x-3">
                                <RadioGroupItem
                                  value={option.value}
                                  id={option.value}
                                  className="mt-0.5 h-4 w-4 flex-shrink-0"
                                />
                                <span className="text-foreground flex-1 text-sm font-medium">{option.label}</span>
                              </div>
                              {option.description && (
                                <span className="text-muted-foreground ml-7 text-xs">{option.description}</span>
                              )}
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}

                  {question.type === "radio-grid" && (
                    <RadioGroup
                      value={answers[question.field as keyof YogaAnswers]?.toString()}
                      onValueChange={(value) => handleChange(question.field, Number(value))}
                    >
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {(question.options as number[])?.map((day: number, index: number) => (
                          <motion.div
                            key={day}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: index * 0.05, ease: EASE_CURVE }}
                          >
                            <Label
                              htmlFor={`yoga-freq-${day}`}
                              className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                            >
                              <RadioGroupItem
                                value={day.toString()}
                                id={`yoga-freq-${day}`}
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
                      value={answers[question.field as keyof YogaAnswers] as string}
                      onValueChange={(value) => handleChange(question.field, value)}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                        {(question.options as QuestionOption[])?.map((option, index) => (
                          <motion.div
                            key={option.value}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.1, ease: EASE_CURVE }}
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

                  {question.type === "checkbox" && (
                    <div className="space-y-2 sm:space-y-3">
                      {(question.options as string[])?.map((area: string, index: number) => (
                        <motion.div
                          key={area}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05, ease: EASE_CURVE }}
                        >
                          <Label
                            htmlFor={`focus-${area}`}
                            className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                          >
                            <Checkbox
                              id={`focus-${area}`}
                              checked={answers.focusAreas.includes(area)}
                              onCheckedChange={(checked) => handleFocusAreaChange(area, !!checked)}
                              className="h-4 w-4 flex-shrink-0"
                            />
                            <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{area}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {question.type === "textarea" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: EASE_CURVE }}
                      className="space-y-3"
                    >
                      <Textarea
                        id={question.field}
                        placeholder={question.placeholder}
                        value={answers[question.field as keyof YogaAnswers] as string}
                        onChange={(e) => handleChange(question.field, e.target.value)}
                        disabled={answers[question.field as keyof YogaAnswers] === YOGA_FORM_TEXT.noIssues}
                        className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none text-xs disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.field}-none`}
                          checked={answers[question.field as keyof YogaAnswers] === YOGA_FORM_TEXT.noIssues}
                          onCheckedChange={(checked) => {
                            handleChange(question.field, !!checked ? YOGA_FORM_TEXT.noIssues : "");
                          }}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`${question.field}-none`}
                          className="text-foreground cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          {YOGA_FORM_TEXT.noIssues}
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
              transition={{ duration: 0.3, delay: 0.2, ease: EASE_CURVE }}
              className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3"
            >
              {currentQuestion > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="dark:text-foreground w-full cursor-pointer text-xs sm:flex-1 sm:text-sm"
                >
                  {YOGA_FORM_TEXT.buttons.back}
                </Button>
              )}
              {!isLastQuestion ? (
                <Button
                  type="button"
                  onClick={moveToNextQuestion}
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {YOGA_FORM_TEXT.buttons.next}
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isCurrentQuestionAnswered()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full cursor-pointer text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
                >
                  {YOGA_FORM_TEXT.buttons.submit}
                </Button>
              )}
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
