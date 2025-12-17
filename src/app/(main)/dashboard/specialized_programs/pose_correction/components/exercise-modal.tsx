"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ExerciseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: {
    id: number;
    name: string;
    description: string;
    difficulty: string;
    categories: string[];
    targetArea: string;
    benefits: string[];
    youtubeId?: string;
    instructions?: string;
  };
}

type Difficulty = "Лесно" | "Средно" | "Трудно";

const difficultyMap: Record<Difficulty, string> = {
  Лесно: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
  Средно: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  Трудно: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
};

export default function ExerciseDetailModal({ open, onOpenChange, exercise }: ExerciseDetailModalProps) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (open) {
      setShowVideo(false);
    }
  }, [open]);

  const handleLoadVideo = () => {
    setShowVideo(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-pretty">{exercise.name}</DialogTitle>
          <DialogDescription>Детайли за упражнението</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exercise Details */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Целева зона</p>
                <p className="text-lg font-semibold">{exercise.targetArea}</p>
              </div>
            </div>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Трудност</p>
              <Badge className={difficultyMap[exercise.difficulty as Difficulty]}>{exercise.difficulty}</Badge>
            </div>
          </div>

          {/* Instructions */}
          {exercise.instructions && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Инструкции</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{exercise.instructions}</p>
            </div>
          )}

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Ползи</h4>
            <ul className="space-y-2">
              {exercise.benefits.map((benefit, idx) => (
                <li key={idx} className="text-muted-foreground flex items-start gap-2 text-sm">
                  <span className="mt-0.5 text-green-600 dark:text-green-400">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Категории</h4>
            <div className="flex flex-wrap gap-2">
              {exercise.categories.map((cat) => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>

          {/* Video Section */}
          {exercise.youtubeId && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Видео демонстрация</h4>
              {!showVideo ? (
                <Button onClick={handleLoadVideo} className="w-full" variant="default">
                  Зареди видео
                </Button>
              ) : (
                <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${exercise.youtubeId}`}
                    title={`${exercise.name} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 h-full w-full border-0"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
