"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  category: "gym" | "calisthenics" | "yoga" | "running";
  answers: Record<string, any>;
  onReset: () => void;
}

const categoryTitles = {
  gym: "Препоръки за Фитнес",
  calisthenics: "Препоръки за Калистеника",
  yoga: "Препоръки за Йога",
  running: "Препоръки за Бягане",
};

export default function ResultsDisplay({ category, answers, onReset }: ResultsDisplayProps) {
  const formatKey = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "string") {
      return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
    }
    return value;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="border-border bg-card/50 border-b">
          <CardTitle className="text-foreground text-xl sm:text-2xl">{categoryTitles[category]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6 sm:space-y-6 sm:pt-8">
          <div className="bg-primary/10 border-primary/30 rounded-lg border p-3 sm:p-4">
            <p className="text-primary/90 text-xs sm:text-sm">
              ℹ️ Прилагате вашите отговори. AI препоръките ще бъдат генерирани скоро.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {Object.entries(answers).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              return (
                <div key={key} className="border-border border-b pb-3 last:border-b-0 sm:pb-4">
                  <dt className="text-muted-foreground mb-1 text-xs font-semibold sm:mb-2 sm:text-sm">
                    {formatKey(key)}
                  </dt>
                  <dd className="text-foreground text-sm leading-relaxed sm:text-base">{formatValue(value)}</dd>
                </div>
              );
            })}
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="border-border text-foreground hover:bg-muted w-full bg-transparent text-xs sm:text-sm"
          >
            Начало
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
