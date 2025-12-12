"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

interface RunningFormProps {
  onSubmit: (answers: Record<string, any>) => void;
  onBack: () => void;
}

export default function RunningForm({ onSubmit, onBack }: RunningFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: "",
    experience: "",
    frequency: "",
    warmupCooldown: "",
    terrain: "",
    healthIssues: "",
  });

  const questions = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: [
        { value: "weight_loss", label: "Отслабване" },
        { value: "endurance", label: "Издръжливост" },
        { value: "5k_race", label: "Подготовка за 5 км състезание" },
        { value: "10k_race", label: "Подготовка за 10 км състезание" },
        { value: "half_marathon", label: "Подготовка за полумаратон" },
        { value: "marathon", label: "Подготовка за маратон" },
        { value: "speed", label: "Подобряване на скоростта" },
        { value: "general_fitness", label: "Обща кондиция" },
      ],
    },
    {
      field: "experience",
      title: "Какво е вашето ниво на опит в бягането?",
      type: "radio",
      options: [
        { value: "beginner", label: "Начинаещ - Току-що започвате или бягате рядко" },
        { value: "basic", label: "Базово ниво - Можете да бягате 20-30 минути без прекъсване" },
        { value: "intermediate", label: "Средно ниво - Бягате редовно 5-10 км комфортно" },
        { value: "advanced", label: "Напреднал - Бягате редовно 10+ км и участвате в състезания" },
        { value: "expert", label: "Експерт - Имате дългогодишна практика" },
      ],
    },
    {
      field: "frequency",
      title: "Колко често бихте имали възможност да бягате?",
      type: "radio-grid",
      options: [2, 3, 4, 5, 6, 7],
    },
    {
      field: "warmupCooldown",
      title: "Желаете ли програмата да включва препоръки за загряване преди бягане и разтягане след него?",
      type: "radio-horizontal",
      options: [
        { value: "yes", label: "Да" },
        { value: "no", label: "Не" },
      ],
    },
    {
      field: "terrain",
      title: "Какъв терен предпочитате за тренировки?",
      type: "radio",
      options: [
        { value: "street_park", label: "Улица/Парк" },
        { value: "track", label: "Писта" },
        { value: "mountain", label: "Планини" },
        { value: "treadmill", label: "Пътека за бягане" },
        { value: "no_terrain_pref", label: "Нямам предпочитания" },
      ],
    },
    {
      field: "healthIssues",
      title: "Съществуват ли някакви здравословни проблеми, контузии или ограничения?",
      type: "textarea",
      placeholder: "напр. болки в коленете, проблеми със ставите, астма... или 'Няма'",
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;
    const answer = answers[currentField];

    if (typeof answer === "string") return answer.trim() !== "";
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
    <Card className="border-border bg-card">
      <CardHeader className="border-border bg-card/50 border-b">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Назад"
              >
                ←
              </button>
              <CardTitle className="text-foreground text-xl sm:text-2xl">Анкета за Бягане</CardTitle>
            </div>
            <span className="text-muted-foreground text-xs sm:text-sm">
              Въпрос {currentQuestion + 1} от {questions.length}
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Отговорете на няколко въпроса, за да получите персонализирани препоръки
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-6 sm:pt-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div key={currentQuestion} className="animate-fade-in">
            <fieldset className="space-y-3 sm:space-y-4">
              <Label className="text-foreground text-sm font-semibold sm:text-base">{question.title}</Label>

              {question.type === "radio" && (
                <RadioGroup
                  value={answers[question.field]}
                  onValueChange={(value) => handleChange(question.field, value)}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {question.options?.map((option: any) => (
                      <div
                        key={option.value}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4 flex-shrink-0" />
                        <Label
                          htmlFor={option.value}
                          className="text-foreground flex-1 cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "radio-grid" && (
                <RadioGroup
                  value={answers[question.field]}
                  onValueChange={(value) => handleChange(question.field, value)}
                >
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {(question.options as number[])?.map((day: number) => (
                      <div
                        key={day}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                      >
                        <RadioGroupItem
                          value={day.toString()}
                          id={`run-freq-${day}`}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`run-freq-${day}`}
                          className="text-foreground flex-1 cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          {day}x/седмица
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "radio-horizontal" && (
                <RadioGroup
                  value={answers[question.field]}
                  onValueChange={(value) => handleChange(question.field, value)}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    {question.options?.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-2 sm:space-x-3">
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.field}-${option.value}`}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <Label
                          htmlFor={`${question.field}-${option.value}`}
                          className="text-foreground cursor-pointer text-xs font-normal sm:text-sm"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "textarea" && (
                <Textarea
                  id={question.field}
                  placeholder={question.placeholder}
                  value={answers[question.field]}
                  onChange={(e) => handleChange(question.field, e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none text-xs sm:text-sm"
                />
              )}
            </fieldset>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            {currentQuestion > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="w-full text-xs sm:flex-1 sm:text-sm"
              >
                Назад
              </Button>
            )}
            {!isLastQuestion ? (
              <Button
                type="button"
                onClick={moveToNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
              >
                Напред
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
              >
                Получи моите препоръки
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
