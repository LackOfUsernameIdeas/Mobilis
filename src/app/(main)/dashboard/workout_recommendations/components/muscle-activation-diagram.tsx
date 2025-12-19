import React, { useEffect, useRef } from "react";
import FrontMuscleScheme from "./muscle-scheme-front";
import BackMuscleScheme from "./muscle-scheme-back";

interface MuscleActivationDiagramProps {
  className?: string;
  muscleActivation: Record<string, boolean>;
  MUSCLE_COLORS: Record<string, string>;
}

export default function MuscleActivationDiagram({
  muscleActivation,
  MUSCLE_COLORS,
  className = "",
}: MuscleActivationDiagramProps) {
  const getMuscleColor = (muscle: string) => {
    return muscleActivation[muscle] ? MUSCLE_COLORS[muscle] : "#ffffff";
  };

  return (
    <div className={`flex items-start justify-center gap-8 ${className}`}>
      <div className="flex flex-col items-center">
        <FrontMuscleScheme getMuscleColor={getMuscleColor} />
      </div>

      <div className="flex flex-col items-center">
        <BackMuscleScheme getMuscleColor={getMuscleColor} />
      </div>
    </div>
  );
}
