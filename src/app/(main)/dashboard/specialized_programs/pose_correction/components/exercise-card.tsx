"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { DIFFICULTY_MAP, ANIMATION_VARIANTS } from "../constants";
import type { Exercise } from "../types";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onOpenModal: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, index, onOpenModal }: ExerciseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.2 + index * 0.05,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-xl">{exercise.name}</CardTitle>
              <p className="text-muted-foreground text-sm">{exercise.bgName}</p>
            </div>
            <Badge className={DIFFICULTY_MAP[exercise.difficulty]}>{exercise.difficulty}</Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col space-y-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            <span>{exercise.targetArea}</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Категории:</div>
            <div className="flex flex-wrap gap-2">
              {exercise.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Ползи:</div>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {exercise.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Стъпки:</div>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {exercise.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-primary font-medium">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <Button className="mt-auto w-full cursor-pointer" onClick={() => onOpenModal(exercise)}>
            Виж упражнението
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
