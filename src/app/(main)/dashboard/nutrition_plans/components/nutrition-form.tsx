"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Scale, Utensils } from "lucide-react";

interface NutritionFormProps {
  onSubmit: (answers: Record<string, any>) => void;
  usersWeight: number;
}

export default function NutritionForm({ onSubmit, usersWeight }: NutritionFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: "",
    trainingTime: "",
    targetWeight: "",
    targetWeightValue: "",
    healthIssues: "",
    cuisinePreference: [],
    macroPreference: "",
  });

  const cuisineOptions = ["Българска", "Испанска", "Италианска", "Френска", "Нямам предпочитания"];

  const questions = [
    {
      field: "mainGoal",
      title: "Каква е вашата основна цел?",
      type: "radio",
      options: [
        {
          value: "cut",
          label: "Cut (Загуба на мазнини)",
          description: "Хранене, насочено към понижаване на телесните мазнини",
        },
        {
          value: "aggressive_cut",
          label: "Aggressive Cut (Интензивна загуба на мазнини)",
          description: "Хранене за бързо понижаване на телесните мазнини",
        },
        {
          value: "lean_bulk",
          label: "Lean Bulk (Покачване на мускулна маса)",
          description: "Хранене, насочено към постепенно и контролирано покачване на мускулна маса",
        },
        {
          value: "dirty_bulk",
          label: "Dirty Bulk (Интензивно покачване на маса)",
          description: "Хранене с висок калориен прием за бързо набавяне на маса",
        },
        {
          value: "recomposition",
          label: "Recomposition",
          description:
            "Хранене, насочено към едновременното понижаване на телесните мазнини и постепенното покачване на мускулна маса",
        },
        {
          value: "maintenance",
          label: "Maintenance (Поддържане)",
          description: "Хранене за запазване на текущото тегло и форма",
        },
        {
          value: "aesthetic",
          label: "Aesthetic (Естетика и пропорции)",
          description: "Хранене, насочено към постигане на естетичен външен вид и балансирани пропорции",
        },
        {
          value: "strength",
          label: "Strength (Максимална сила)",
          description: "Хранене с фокус върху максимална сила и силови показатели",
        },
      ],
    },
    {
      field: "trainingTime",
      title: "Кога горе-долу намирате време да тренирате?",
      type: "time-picker",
      placeholder: "Изберете час",
    },
    {
      field: "targetWeight",
      title: "Има ли конкретно целево тегло, до което желаете да стигнете?",
      type: "target-weight",
      currentWeight: usersWeight,
    },
    {
      field: "healthIssues",
      title: "Съществуват ли здравословни проблеми, алергии или други особености, свързани с храненето ви?",
      type: "textarea",
      placeholder:
        "напр. алергия към ядки, лактозна непоносимост, стомашни проблеми, високо кръвно налягане, религиозни ограничения",
    },
    {
      field: "cuisinePreference",
      title: "Ястия от каква кухня предпочитате?",
      type: "checkbox",
      options: cuisineOptions,
    },
    {
      field: "macroPreference",
      title: "Какъв тип хранителен режим предпочитате?",
      type: "macro-preference",
      // This will show recommended macros based on the selected goal
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => {
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

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setAnswers((prev) => {
      if (cuisine === "Нямам предпочитания" && checked) {
        return {
          ...prev,
          cuisinePreference: ["Нямам предпочитания"],
        };
      }

      if (checked && prev.cuisinePreference.includes("Нямам предпочитания")) {
        return {
          ...prev,
          cuisinePreference: [cuisine],
        };
      }

      return {
        ...prev,
        cuisinePreference: checked
          ? [...prev.cuisinePreference, cuisine]
          : prev.cuisinePreference.filter((c: string) => c !== cuisine),
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
    <Card className="border-border bg-card">
      <CardHeader className="border-border bg-card/50 border-b">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
            <div className="flex items-center gap-3">
              <Utensils className="text-primary h-6 w-6" />
              <CardTitle className="text-foreground text-xl sm:text-2xl">Въпросник за хранителни препоръки</CardTitle>
            </div>
            <span className="text-foreground text-xs sm:text-sm">
              Въпрос {currentQuestion + 1} от {questions.length}
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardDescription className="text-foreground text-xs sm:text-sm">
            Отговорете на няколко въпроса, за да получите персонализирани хранителни препоръки
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
                        className="hover:bg-muted/50 flex cursor-pointer flex-col items-start space-y-1 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4 flex-shrink-0" />
                          <span className="text-foreground flex-1 text-sm font-medium">{option.label}</span>
                        </div>
                        {option.description && (
                          <span className="text-muted-foreground ml-7 text-xs">{option.description}</span>
                        )}
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "time-picker" && (
                <div className="space-y-2">
                  <Input
                    id={question.field}
                    type="time"
                    value={answers[question.field]}
                    onChange={(e) => handleChange(question.field, e.target.value)}
                    className="bg-input border-border text-foreground text-sm"
                  />
                  <p className="text-muted-foreground text-xs">
                    Това ще помогне за по-добро планиране на храненията около тренировката
                  </p>
                </div>
              )}

              {question.type === "target-weight" && (
                <div className="space-y-4">
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

                  <RadioGroup
                    value={answers.targetWeight}
                    onValueChange={(value) => handleChange("targetWeight", value)}
                  >
                    <div className="space-y-3">
                      <Label
                        htmlFor="target-yes"
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                      >
                        <RadioGroupItem value="yes" id="target-yes" className="h-4 w-4 flex-shrink-0" />
                        <span className="text-foreground flex-1 text-sm font-normal">Да, имам целево тегло</span>
                      </Label>

                      <Label
                        htmlFor="target-no"
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                      >
                        <RadioGroupItem value="no" id="target-no" className="h-4 w-4 flex-shrink-0" />
                        <span className="text-foreground flex-1 text-sm font-normal">
                          Не, нямам конкретно целево тегло
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>

                  {answers.targetWeight === "yes" && (
                    <div className="animate-fade-in space-y-2">
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
                            if (value === "" || /^\d{0,3}(\.\d{0,2})?$/.test(value)) {
                              const numericValue = parseFloat(value);
                              if (isNaN(numericValue) || numericValue <= 200) {
                                handleChange("targetWeightValue", value);
                              }
                            }
                          }}
                          className="bg-input border-border text-foreground placeholder:text-muted-foreground pr-12 text-sm"
                        />
                        <span className="text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">кг</span>
                      </div>
                      {answers.targetWeightValue && (
                        <p className="text-muted-foreground text-xs">
                          {parseFloat(answers.targetWeightValue) > usersWeight
                            ? `+${(parseFloat(answers.targetWeightValue) - usersWeight).toFixed(1)} кг от текущото тегло`
                            : `${(parseFloat(answers.targetWeightValue) - usersWeight).toFixed(1)} кг от текущото тегло`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="space-y-2 sm:space-y-3">
                  {(question.options as string[])?.map((cuisine: string) => (
                    <Label
                      key={cuisine}
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
                      className="text-foreground cursor-pointer text-xs font-normal sm:text-sm"
                    >
                      Няма
                    </Label>
                  </div>
                </div>
              )}

              {question.type === "macro-preference" && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
                    <p className="text-foreground mb-2 text-sm font-medium">
                      Препоръчителни дневни стойности според вашата цел:{" "}
                      {answers.mainGoal
                        ? (questions[0].options as Array<{ value: string; label: string; description: string }>)?.find(
                            (o) => o.value === answers.mainGoal,
                          )?.label
                        : "Не е избрана"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      По-долу можете да изберете препоръчително съотношение на макронутриенти или да коригирате по ваша
                      преценка.
                    </p>
                  </div>

                  <RadioGroup
                    value={answers.macroPreference}
                    onValueChange={(value) => handleChange("macroPreference", value)}
                  >
                    <div className="space-y-3">
                      <Label
                        htmlFor="macro-balanced"
                        className="hover:bg-muted/50 flex cursor-pointer flex-col space-y-1 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="balanced" id="macro-balanced" className="h-4 w-4 flex-shrink-0" />
                          <span className="text-foreground flex-1 text-sm font-medium">Балансиран режим</span>
                        </div>
                        <span className="text-muted-foreground ml-7 text-xs">
                          Протеини: 30% | Въглехидрати: 40% | Мазнини: 30%
                        </span>
                      </Label>

                      <Label
                        htmlFor="macro-high-protein"
                        className="hover:bg-muted/50 flex cursor-pointer flex-col space-y-1 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem
                            value="high_protein"
                            id="macro-high-protein"
                            className="h-4 w-4 flex-shrink-0"
                          />
                          <span className="text-foreground flex-1 text-sm font-medium">Високо протеинов режим</span>
                        </div>
                        <span className="text-muted-foreground ml-7 text-xs">
                          Протеини: 40% | Въглехидрати: 35% | Мазнини: 25%
                        </span>
                      </Label>

                      <Label
                        htmlFor="macro-low-carb"
                        className="hover:bg-muted/50 flex cursor-pointer flex-col space-y-1 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="low_carb" id="macro-low-carb" className="h-4 w-4 flex-shrink-0" />
                          <span className="text-foreground flex-1 text-sm font-medium">Нисковъглехидратен режим</span>
                        </div>
                        <span className="text-muted-foreground ml-7 text-xs">
                          Протеини: 35% | Въглехидрати: 25% | Мазнини: 40%
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
