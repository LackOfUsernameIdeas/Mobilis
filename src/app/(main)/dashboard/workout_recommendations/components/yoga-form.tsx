"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface YogaFormProps {
  onSubmit: (answers: Record<string, any>) => void;
  onBack: () => void;
}

export default function YogaForm({ onSubmit, onBack }: YogaFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: "",
    yogaStyle: "",
    experience: "",
    frequency: 0,
    warmupSavasana: "",
    focusAreas: [],
    healthIssues: "",
    specificExercises: "",
  });

  const focusAreaOptions = [
    "Гръбначен стълб и гръб",
    "Тазобедрени стави",
    "Рамене и врат",
    "Коремна мускулатура",
    "Крака и баланс",
    "Дишане и пранаяма",
    "Нямам предпочитания",
  ];

  const questions = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: [
        { value: "flexibility_balance", label: "Гъвкавост и баланс" },
        { value: "stress_relief", label: "Намаляване на стреса и релаксация" },
        { value: "strength_endurance", label: "Сила и издръжливост чрез йога" },
        { value: "mindfulness", label: "Осъзнатост и медитация" },
        { value: "posture", label: "Подобряване на стойката" },
        { value: "energy_boost", label: "Повишаване на енергията" },
      ],
    },
    {
      field: "yogaStyle",
      title: "Какъв стил йога предпочитате?",
      type: "radio",
      options: [
        { value: "hatha", label: "Hatha (по-бавно темпо, работа върху точната подредба на тялото)" },
        { value: "vinyasa", label: "Vinyasa (пози в последователност с плавни преходи и по-висока активност)" },
        { value: "yin", label: "Yin (дълго задържане на пози за по-дълбоко разтягане)" },
        { value: "power_yoga", label: "Power Yoga (по-динамична практика с акцент върху сила и контрол)" },
        { value: "restorative", label: "Restorative (леки пози с опора за по-добро отпускане)" },
        { value: "no_preference", label: "Нямам предпочитания" },
      ],
    },
    {
      field: "experience",
      title: "Какво е вашето ниво на опит в йогата?",
      type: "radio",
      options: [
        { value: "beginner", label: "Начинаещ - Тренирате от кратко време" },
        { value: "basic", label: "Базово ниво - Изпълнявате основни упражнения правилно" },
        { value: "intermediate", label: "Средно ниво - Познавате силните и слабите си страни" },
        { value: "advanced", label: "Напреднал - Работите с по-сложни програми" },
        { value: "expert", label: "Експерт - Имате дългогодишна практика" },
      ],
    },
    {
      field: "frequency",
      title: "Колко често бихте имали възможност да практикувате йога?",
      type: "radio-grid",
      options: [2, 3, 4, 5, 6, 7],
    },
    {
      field: "warmupSavasana",
      title: "Желаете ли програмата да включва препоръки за загряване преди практика и Shavasana (медитация) след нея?",
      type: "radio-horizontal",
      options: [
        { value: "yes", label: "Да" },
        { value: "no", label: "Не" },
      ],
    },
    {
      field: "focusAreas",
      title: "Има ли конкретна област на тялото или аспект, върху които желаете да се фокусирате предимно?",
      type: "checkbox",
      options: focusAreaOptions,
    },
    {
      field: "healthIssues",
      title: "Съществуват ли някакви здравословни проблеми, контузии или ограничения?",
      type: "textarea",
      placeholder: "напр. болки в кръста, проблеми със ставите, високо кръвно налягане",
    },
    {
      field: "specificExercises",
      title: "Има ли конкретни йога пози, които желаете да бъдат включени в програмата?",
      type: "textarea",
      placeholder: "напр. Downward Dog, Warrior poses, Tree Pose, Headstand",
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setAnswers((prev) => {
      // If "Нямам предпочитания" is being checked, clear all others
      if (area === "Нямам предпочитания" && checked) {
        return {
          ...prev,
          focusAreas: ["Нямам предпочитания"],
        };
      }

      // If any other area is being checked, remove "Нямам предпочитания"
      if (checked && prev.focusAreas.includes("Нямам предпочитания")) {
        return {
          ...prev,
          focusAreas: [area],
        };
      }

      // Normal checkbox behavior
      return {
        ...prev,
        focusAreas: checked ? [...prev.focusAreas, area] : prev.focusAreas.filter((a: string) => a !== area),
      };
    });
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;
    const answer = answers[currentField];

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

  console.log("Current Answers: ", answers);

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
              <CardTitle className="text-foreground text-xl sm:text-2xl">Въпросник за Йога</CardTitle>
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
      <CardContent>
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
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4 flex-shrink-0" />
                        <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{option.label}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "radio-grid" && (
                <RadioGroup
                  value={answers[question.field]?.toString()}
                  onValueChange={(value) => handleChange(question.field, Number(value))}
                >
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {(question.options as number[])?.map((day: number) => (
                      <Label
                        key={day}
                        htmlFor={`yoga-freq-${day}`}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                      >
                        <RadioGroupItem
                          value={day.toString()}
                          id={`yoga-freq-${day}`}
                          className="h-4 w-4 flex-shrink-0"
                        />
                        <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{day}x/седмица</span>
                      </Label>
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
                      <Label
                        key={option.value}
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
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "checkbox" && (
                <div className="space-y-2 sm:space-y-3">
                  {(question.options as string[])?.map((area: string) => (
                    <Label
                      key={area}
                      htmlFor={`focus-${area}`}
                      className="hover:bg-muted/50 flex cursor-pointer items-center space-x-2 rounded-lg p-2 transition-colors sm:space-x-3 sm:p-3"
                    >
                      <Checkbox
                        id={`focus-${area}`}
                        checked={answers.focusAreas.includes(area)}
                        onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                        className="h-4 w-4 flex-shrink-0"
                      />
                      <span className="text-foreground flex-1 text-xs font-normal sm:text-sm">{area}</span>
                    </Label>
                  ))}
                </div>
              )}

              {question.type === "textarea" && (
                <div className="space-y-3">
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
                      className="text-muted-foreground cursor-pointer text-xs font-normal sm:text-sm"
                    >
                      Няма
                    </Label>
                  </div>
                </div>
              )}
            </fieldset>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:mt-8 sm:flex-row sm:gap-3">
            {currentQuestion > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="w-full cursor-pointer text-xs sm:flex-1 sm:text-sm"
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
