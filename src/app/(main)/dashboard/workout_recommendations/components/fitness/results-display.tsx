"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ResultsDisplayProps {
  category: "gym" | "yoga" | "running";
  answers: Record<string, any>;
  onReset: () => void;
}

const categoryTitles = {
  gym: "Gym & Calisthenics Recommendations",
  yoga: "Yoga Recommendations",
  running: "Running Recommendations",
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
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader className="border-border bg-card/50 border-b">
          <CardTitle className="text-foreground text-2xl">{categoryTitles[category]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-8">
          <div className="bg-primary/10 border-primary/30 rounded-lg border p-4">
            <p className="text-primary/90 text-sm">
              ℹ️ Currently displaying your submitted answers. AI recommendations will be generated here soon.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(answers).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) {
                return null;
              }
              return (
                <div key={key} className="border-border border-b pb-4 last:border-b-0">
                  <dt className="text-muted-foreground mb-2 text-sm font-semibold">{formatKey(key)}</dt>
                  <dd className="text-foreground text-base leading-relaxed">{formatValue(value)}</dd>
                </div>
              );
            })}
          </div>

          <Button
            onClick={onReset}
            variant="outline"
            className="border-border text-foreground hover:bg-muted w-full bg-transparent"
          >
            Start Over
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
