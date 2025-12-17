"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchYouTubeEmbed } from "../helper_functions";
import MuscleActivationDiagram from "./muscle-activation-diagram";

interface ExerciseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: {
    exercise_name: string;
    sets: string;
    reps: string;
    rest?: string;
    tempo?: string;
    notes?: string;
    muscle_activation?: Record<string, boolean>;
  };
  cachedVideoUrl?: string;
  onVideoFetched: (exerciseName: string, url: string) => void;
}

const muscleLabels: Record<string, string> = {
  chest: "Гръдни мускули",
  front_delts: "Предни делтоиди мускули",
  side_delts: "Странични делтоиди мускули",
  rear_delts: "Задни делтоиди мускули",
  biceps: "Бицепси",
  triceps: "Трицепси",
  forearms: "Предмишници",
  traps: "Трапецовидни мускули",
  lats: "Широк гръбен мускул",
  lower_back: "Долна част на гърба",
  abs: "Централни коремни мускули (abs)",
  obliques: "Странични коремни мускули (obliques)",
  quadriceps: "Квадрицепси",
  hamstrings: "Задни бедрени мускули",
  glutes: "Седалищни мускули",
  calves: "Прасци",
  adductors: "Аддукторни мускули",
};

export default function ExerciseModal({
  open,
  onOpenChange,
  exercise,
  cachedVideoUrl,
  onVideoFetched,
}: ExerciseModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Load cached URL when modal opens
  useEffect(() => {
    if (open && cachedVideoUrl) {
      setYoutubeUrl(cachedVideoUrl);
    }
  }, [open, cachedVideoUrl]);

  const handleFetchVideo = async () => {
    setLoadingVideo(true);
    setVideoError(false);
    try {
      const url = await fetchYouTubeEmbed(exercise.exercise_name);
      if (url) {
        setYoutubeUrl(url);
        // Cache the URL in parent component
        onVideoFetched(exercise.exercise_name, url);
      } else {
        setVideoError(true);
      }
    } catch (error) {
      console.error("[v0] Error fetching video:", error);
      setVideoError(true);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset video state when closing (but keep in cache)
      setYoutubeUrl(null);
      setVideoError(false);
    }
    onOpenChange(newOpen);
  };

  const activeMuscles = exercise.muscle_activation
    ? Object.entries(exercise.muscle_activation)
        .filter(([_, isActive]) => isActive)
        .map(([key]) => key)
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl text-pretty">{exercise.exercise_name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Основна информация</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exercise Details */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Серии x Повторения</p>
                <p className="text-foreground text-lg font-semibold">
                  {exercise.sets} x {exercise.reps}
                </p>
              </div>
              {exercise.rest && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Почивка</p>
                  <p className="text-foreground text-lg font-semibold">{exercise.rest}</p>
                </div>
              )}
            </div>
            {exercise.tempo && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Темпо</p>
                <p className="text-foreground text-sm">{exercise.tempo}</p>
              </div>
            )}
            {exercise.notes && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Бележки</p>
                <p className="text-foreground text-sm">{exercise.notes}</p>
              </div>
            )}
          </div>

          {/* Muscle Activation Section */}
          {exercise.muscle_activation && activeMuscles.length > 0 && (
            <div className="space-y-4">
              {/* Muscle Labels */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground mb-3 text-xs">
                  Мускулни групи, които се натоварват при изпълнение на упражнението:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeMuscles.map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="secondary"
                      className="bg-[#8B4513] px-3 py-1 text-sm text-white hover:bg-[#654321]"
                    >
                      {muscleLabels[muscle] || muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Visual Diagram */}
              <div className="bg-muted/30 rounded-lg p-4">
                <MuscleActivationDiagram muscleActivation={exercise.muscle_activation} />
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-3">
            <h4 className="text-foreground text-sm font-semibold">🎥 Видео на упражнението</h4>
            {!youtubeUrl && !videoError && (
              <Button onClick={handleFetchVideo} disabled={loadingVideo} className="w-full" variant="default">
                {loadingVideo ? "Зареждане на видео..." : "Зареди видео"}
              </Button>
            )}

            {videoError && (
              <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-4">
                <p className="text-destructive text-sm">
                  Грешка при зареждане на видео. Моля, опитайте отново по-късно.
                </p>
              </div>
            )}

            {youtubeUrl && (
              <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingBottom: "56.25%" }}>
                <iframe
                  src={youtubeUrl}
                  title={`${exercise.exercise_name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute top-0 left-0 h-full w-full border-0"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
