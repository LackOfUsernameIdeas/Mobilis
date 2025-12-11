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
}

export default function RunningForm({ onSubmit }: RunningFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: "",
    experience: "",
    frequency: "",
    warmupCooldown: "",
    terrain: "",
    injuries: "",
  });

  const questions = [
    {
      field: "mainGoal",
      title: "What is your main goal?",
      type: "radio",
      options: [
        { value: "weight_loss", label: "Weight Loss" },
        { value: "endurance", label: "Endurance" },
        { value: "5k_race", label: "5K Race Preparation" },
        { value: "10k_race", label: "10K Race Preparation" },
        { value: "half_marathon", label: "Half Marathon Preparation" },
        { value: "marathon", label: "Marathon Preparation" },
        { value: "speed", label: "Speed Improvement" },
        { value: "general_fitness", label: "General Fitness" },
      ],
    },
    {
      field: "experience",
      title: "What is your experience level?",
      type: "radio",
      options: [
        { value: "beginner", label: "Beginner - Just starting or run rarely" },
        { value: "advanced_beginner", label: "Advanced Beginner - Can run 20-30 minutes non-stop" },
        { value: "intermediate", label: "Intermediate - Run 5-10K comfortably regularly" },
        { value: "advanced", label: "Advanced - Run 10+ km regularly, participate in races" },
        { value: "expert", label: "Expert - Years of practice, advanced training" },
      ],
    },
    {
      field: "frequency",
      title: "How often can you run per week?",
      type: "radio-grid",
      options: [2, 3, 4, 5, 6, 7],
    },
    {
      field: "warmupCooldown",
      title: "Include warm-up and cool-down recommendations?",
      type: "radio-horizontal",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      field: "terrain",
      title: "What terrain do you prefer?",
      type: "radio",
      options: [
        { value: "street_park", label: "Street/Park" },
        { value: "track", label: "Track" },
        { value: "mountain", label: "Mountain" },
        { value: "treadmill", label: "Treadmill" },
        { value: "no_terrain_pref", label: "No preference" },
      ],
    },
    {
      field: "injuries",
      title: "Any health issues or injuries?",
      type: "textarea",
      placeholder: "e.g., knee pain, joint problems, asthma... or 'None'",
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
            <CardTitle className="text-foreground text-xl sm:text-2xl">Running Questionnaire</CardTitle>
            <span className="text-muted-foreground text-xs sm:text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Answer a few questions to get personalized recommendations
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
                          {day}x/week
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
                Back
              </Button>
            )}
            {!isLastQuestion ? (
              <Button
                type="button"
                onClick={moveToNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1 sm:text-sm"
              >
                Get My Recommendations
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
