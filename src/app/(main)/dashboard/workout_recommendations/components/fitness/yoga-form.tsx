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
}

export default function YogaForm({ onSubmit }: YogaFormProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({
    mainGoal: "",
    yogaStyle: "",
    experience: "",
    frequency: "",
    warmupSavasana: "",
    focusAreas: [],
    injuries: "",
    poses: "",
  });

  const focusAreaOptions = [
    "Spine and Back",
    "Hips",
    "Shoulders and Neck",
    "Core",
    "Legs and Balance",
    "Breathing and Pranayama",
    "No preference",
  ];

  const questions = [
    {
      field: "mainGoal",
      title: "What is your main goal?",
      type: "radio",
      options: [
        { value: "flexibility_balance", label: "Flexibility and Balance" },
        { value: "stress_relief", label: "Stress Relief and Relaxation" },
        { value: "strength_endurance", label: "Strength and Endurance through Yoga" },
        { value: "mindfulness", label: "Mindfulness and Meditation" },
        { value: "posture", label: "Posture and Alignment" },
        { value: "energy_boost", label: "Energy Boost" },
      ],
    },
    {
      field: "yogaStyle",
      title: "What yoga style do you prefer?",
      type: "radio",
      options: [
        { value: "hatha", label: "Hatha (Slow pace, focus on alignment)" },
        { value: "vinyasa", label: "Vinyasa (Flowing sequence, higher activity)" },
        { value: "yin", label: "Yin (Long holds, deep stretching)" },
        { value: "power_yoga", label: "Power Yoga (Dynamic, strength-focused)" },
        { value: "restorative", label: "Restorative (Gentle, supportive)" },
        { value: "no_preference", label: "No preference" },
      ],
    },
    {
      field: "experience",
      title: "What is your experience level?",
      type: "radio",
      options: [
        { value: "beginner", label: "Beginner - Just starting out" },
        { value: "advanced_beginner", label: "Advanced Beginner - Doing basic poses correctly" },
        { value: "intermediate", label: "Intermediate - Know your strengths and weaknesses" },
        { value: "advanced", label: "Advanced - Working with complex sequences" },
        { value: "expert", label: "Expert - Years of consistent practice" },
      ],
    },
    {
      field: "frequency",
      title: "How often can you practice per week?",
      type: "radio-grid",
      options: [2, 3, 4, 5, 6, 7],
    },
    {
      field: "warmupSavasana",
      title: "Include warm-up and Savasana recommendations?",
      type: "radio-horizontal",
      options: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
    },
    {
      field: "focusAreas",
      title: "Which areas do you want to focus on?",
      type: "checkbox",
      options: focusAreaOptions,
    },
    {
      field: "injuries",
      title: "Any health issues or injuries?",
      type: "textarea",
      placeholder: "e.g., back pain, joint problems, high blood pressure... or 'None'",
    },
    {
      field: "poses",
      title: "Any specific poses you want included?",
      type: "textarea",
      placeholder: "e.g., Downward Dog, Warrior poses, Tree Pose, Headstand... or 'No preference'",
    },
  ];

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFocusAreaChange = (area: string, checked: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      focusAreas: checked ? [...prev.focusAreas, area] : prev.focusAreas.filter((a: string) => a !== area),
    }));
  };

  const isCurrentQuestionAnswered = (): boolean => {
    const currentField = questions[currentQuestion].field;
    const answer = answers[currentField];

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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-2xl">Yoga Questionnaire</CardTitle>
            <span className="text-muted-foreground text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="bg-muted h-2 w-full rounded-full">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
          <CardDescription>Answer a few questions to get personalized recommendations</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div key={currentQuestion} className="animate-fade-in">
            <fieldset className="space-y-4">
              <Label className="text-foreground text-base font-semibold">{question.title}</Label>

              {question.type === "radio" && (
                <RadioGroup
                  value={answers[question.field]}
                  onValueChange={(value) => handleChange(question.field, value)}
                >
                  <div className="space-y-3">
                    {question.options?.map((option: any) => (
                      <div
                        key={option.value}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="h-4 w-4" />
                        <Label
                          htmlFor={option.value}
                          className="text-foreground flex-1 cursor-pointer text-sm font-normal"
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
                  <div className="grid grid-cols-2 gap-3">
                    {(question.options as number[])?.map((day: number) => (
                      <div
                        key={day}
                        className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                      >
                        <RadioGroupItem value={day.toString()} id={`yoga-freq-${day}`} className="h-4 w-4" />
                        <Label
                          htmlFor={`yoga-freq-${day}`}
                          className="text-foreground flex-1 cursor-pointer text-sm font-normal"
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
                  <div className="flex gap-6">
                    {question.options?.map((option: any) => (
                      <div key={option.value} className="flex items-center space-x-3">
                        <RadioGroupItem
                          value={option.value}
                          id={`${question.field}-${option.value}`}
                          className="h-4 w-4"
                        />
                        <Label
                          htmlFor={`${question.field}-${option.value}`}
                          className="text-foreground cursor-pointer text-sm font-normal"
                        >
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}

              {question.type === "checkbox" && (
                <div className="space-y-3">
                  {(question.options as string[])?.map((area: string) => (
                    <div
                      key={area}
                      className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg p-3 transition-colors"
                    >
                      <Checkbox
                        id={`focus-${area}`}
                        checked={answers.focusAreas.includes(area)}
                        onCheckedChange={(checked) => handleFocusAreaChange(area, checked as boolean)}
                        className="h-4 w-4"
                      />
                      <Label
                        htmlFor={`focus-${area}`}
                        className="text-foreground flex-1 cursor-pointer text-sm font-normal"
                      >
                        {area}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "textarea" && (
                <Textarea
                  id={question.field}
                  placeholder={question.placeholder}
                  value={answers[question.field]}
                  onChange={(e) => handleChange(question.field, e.target.value)}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-24 resize-none"
                />
              )}
            </fieldset>
          </div>

          <div className="mt-8 flex gap-3">
            {currentQuestion > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            {!isLastQuestion ? (
              <Button
                type="button"
                onClick={moveToNextQuestion}
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!isCurrentQuestionAnswered()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
