"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NextWorkoutCardProps {
  day: string;
  focus: string;
  exercises: { name: string; sets: number; reps: string }[];
  duration?: number;
}

export function NextWorkoutCard({ day, focus, exercises, duration = 45 }: NextWorkoutCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="text-muted-foreground h-5 w-5" />
            <CardTitle className="text-base font-medium">Следваща тренировка</CardTitle>
          </div>
          <Badge variant="secondary">{day}</Badge>
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" />
            {focus}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {exercises.slice(0, 3).map((exercise, index) => (
            <div
              key={index}
              className="bg-muted/30 flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="font-medium">{exercise.name}</span>
              <span className="text-muted-foreground">
                {exercise.sets}x{exercise.reps}
              </span>
            </div>
          ))}
          {exercises.length > 3 && (
            <p className="text-muted-foreground pt-1 text-center text-xs">+{exercises.length - 3} още упражнения</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
