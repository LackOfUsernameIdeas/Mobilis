"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ExerciseCardProps {
  exercise: {
    exercise_name: string;
    sets: string;
    reps: string;
    muscle_activation?: Record<string, boolean>;
  };
  onClick: () => void;
}

export default function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  // Count active muscles
  const activeMuscleCount = exercise.muscle_activation
    ? Object.values(exercise.muscle_activation).filter(Boolean).length
    : 0;

  return (
    <Card
      className="border-border hover:border-primary/50 group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <h4 className="text-foreground text-md line-clamp-2 leading-tight font-semibold">
              {exercise.exercise_name}
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {exercise.sets}x{exercise.reps}
              </Badge>
              {activeMuscleCount > 0 && (
                <span className="text-muted-foreground text-sm">
                  {activeMuscleCount} {activeMuscleCount === 1 ? "мускул" : "мускула"}
                </span>
              )}
            </div>
          </div>
          <div className="text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
