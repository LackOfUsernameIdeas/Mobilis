"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchYouTubeEmbed } from "../../helper_functions";

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
}

const muscleColors = {
  quadriceps: "#8B5CF6",
  hamstrings: "#EC4899",
  glutes: "#F59E0B",
  calves: "#10B981",
  chest: "#3B82F6",
  back: "#1E40AF",
  lats: "#1E40AF",
  biceps: "#06B6D4",
  triceps: "#F97316",
  forearms: "#EF4444",
  shoulders: "#8B5CF6",
  front_delts: "#8B5CF6",
  side_delts: "#7C3AED",
  rear_delts: "#6D28D9",
  traps: "#059669",
  rhomboids: "#047857",
  abs: "#FBBF24",
  lower_back: "#FBBF24",
  obliques: "#FCD34D",
  adductors: "#A855F7",
};

const muscleLabels: Record<string, string> = {
  quadriceps: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  chest: "Chest",
  back: "Back",
  lats: "Lats",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  shoulders: "Shoulders",
  front_delts: "Front Delts",
  side_delts: "Side Delts",
  rear_delts: "Rear Delts",
  traps: "Traps",
  rhomboids: "Rhomboids",
  abs: "Abs",
  lower_back: "Lower Back",
  obliques: "Obliques",
  adductors: "Adductors",
};

export default function ExerciseModal({ open, onOpenChange, exercise }: ExerciseModalProps) {
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const handleFetchVideo = async () => {
    setLoadingVideo(true);
    setVideoError(false);
    try {
      const url = await fetchYouTubeEmbed(exercise.exercise_name);
      if (url) {
        setYoutubeUrl(url);
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
      // Reset video state when closing
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground text-xl text-pretty">{exercise.exercise_name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">Detailed exercise information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Exercise Details */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Sets x Reps</p>
                <p className="text-foreground text-lg font-semibold">
                  {exercise.sets} x {exercise.reps}
                </p>
              </div>
              {exercise.rest && (
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Rest</p>
                  <p className="text-foreground text-lg font-semibold">{exercise.rest}</p>
                </div>
              )}
            </div>
            {exercise.tempo && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Tempo</p>
                <p className="text-foreground text-sm">{exercise.tempo}</p>
              </div>
            )}
            {exercise.notes && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">Notes</p>
                <p className="text-foreground text-sm">{exercise.notes}</p>
              </div>
            )}
          </div>

          {/* Muscle Activation */}
          {activeMuscles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-foreground text-sm font-semibold">Muscle Activation</h4>
              <div className="flex flex-wrap gap-2">
                {activeMuscles.map((muscle) => (
                  <Badge
                    key={muscle}
                    className="text-white"
                    style={{
                      backgroundColor: muscleColors[muscle as keyof typeof muscleColors] || "#6B7280",
                    }}
                  >
                    {muscleLabels[muscle] || muscle}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Video Section */}
          <div className="space-y-3">
            <h4 className="text-foreground text-sm font-semibold">Exercise Video</h4>
            {!youtubeUrl && !videoError && (
              <Button onClick={handleFetchVideo} disabled={loadingVideo} className="w-full" variant="default">
                {loadingVideo ? "Loading video..." : "Load Exercise Video"}
              </Button>
            )}

            {videoError && (
              <div className="bg-destructive/10 border-destructive/30 rounded-lg border p-4">
                <p className="text-destructive text-sm">Failed to load video. Please try again later.</p>
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
