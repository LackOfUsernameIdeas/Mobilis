import React, { useEffect, useRef } from "react";
import FrontMuscleScheme from "./muscle-scheme-front";
import BackMuscleScheme from "./muscle-scheme-back";

interface MuscleActivationDiagramProps {
  muscleActivation: Record<string, boolean>;
  className?: string;
}

export default function MuscleActivationDiagram({ muscleActivation, className = "" }: MuscleActivationDiagramProps) {
  return (
    <div className={`flex items-start justify-center gap-8 ${className}`}>
      <div className="flex flex-col items-center">
        <h4 className="mb-2 text-sm font-semibold">Отпред</h4>
        <FrontMuscleScheme muscleActivation={muscleActivation} fillColor={"#8B4513"} />
      </div>

      <div className="flex flex-col items-center">
        <h4 className="mb-2 text-sm font-semibold">Отзад</h4>
        <BackMuscleScheme muscleActivation={muscleActivation} fillColor={"#8B4513"} />
      </div>
    </div>
  );
}
