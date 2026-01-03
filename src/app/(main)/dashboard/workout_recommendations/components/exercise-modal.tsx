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
  onVideoFetched?: (exerciseName: string, url: string) => void;
  special?: boolean;
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

const MUSCLE_COLORS: Record<string, string> = {
  chest: "#E63946",
  front_delts: "#F1FA3C",
  side_delts: "#FF9F1C",
  rear_delts: "#8AC926",
  biceps: "#1982C4",
  triceps: "#6A4C93",
  forearms: "#FF6B6B",
  abs: "#FFBE0B",
  obliques: "#3A86FF",
  quadriceps: "#FF4D6D",
  adductors: "#06D6A0",
  calves: "#FFD166",
  traps: "#8338EC",
  lats: "#FF6700",
  lower_back: "#06B6D4",
  glutes: "#9D0208",
  hamstrings: "#FF5D8F",
};

export default function ExerciseModal({
  open,
  onOpenChange,
  exercise,
  cachedVideoUrl,
  onVideoFetched,
  special = false,
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
        if (onVideoFetched) {
          onVideoFetched(exercise.exercise_name, url);
        }
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
      <DialogContent className="max-h-[90vh] overflow-y-auto" style={{ maxWidth: "90vh", width: "90vh" }}>
        <DialogHeader>
          <DialogTitle className="text-foreground pr-8 text-2xl text-pretty">{exercise.exercise_name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Основна информация</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Exercise Details */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Серии x Повторения</p>
                <p className="text-foreground text-xl font-semibold">
                  {exercise.sets} x {exercise.reps}
                </p>
              </div>
            </div>
          </div>
          {/* Muscle Activation Section */}
          {exercise.muscle_activation && activeMuscles.length > 0 && (
            <div className="space-y-4">
              {/* Muscle Labels */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-muted-foreground mb-3 text-sm">
                  Мускулни групи, които се натоварват при изпълнение на упражнението:
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeMuscles.map((muscle) => (
                    <Badge
                      key={muscle}
                      variant="secondary"
                      className="px-3 py-1 text-sm text-white"
                      style={{ backgroundColor: MUSCLE_COLORS[muscle] }}
                    >
                      {muscleLabels[muscle] || muscle}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Visual Diagram */}
              <div className="bg-muted/30 rounded-lg p-14">
                <MuscleActivationDiagram muscleActivation={exercise.muscle_activation} MUSCLE_COLORS={MUSCLE_COLORS} />
              </div>
            </div>
          )}

          {/* Video Section */}
          {special != true && (
            <div className="space-y-3">
              <h4 className="text-foreground text-md font-semibold">🎥 Видео на упражнението</h4>
              {!youtubeUrl && !videoError && (
                <Button
                  onClick={handleFetchVideo}
                  disabled={loadingVideo}
                  className="w-full cursor-pointer"
                  variant="default"
                >
                  {loadingVideo ? "Зареждане на видео..." : "Зареди видео"}
                </Button>
              )}

              {videoError && (
                <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-4">
                  <p className="text-destructive text-md">
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
