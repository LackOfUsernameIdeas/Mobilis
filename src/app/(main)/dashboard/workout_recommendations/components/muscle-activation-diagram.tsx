import React from "react";

interface MuscleActivationDiagramProps {
  muscleActivation: Record<string, boolean>;
  className?: string;
}

export default function MuscleActivationDiagram({ muscleActivation, className = "" }: MuscleActivationDiagramProps) {
  const getColor = (isActive: boolean) => (isActive ? "#8B4513" : "#E5E7EB");
  const getStroke = (isActive: boolean) => (isActive ? "#654321" : "#9CA3AF");

  return (
    <div className={`flex items-start justify-center gap-8 ${className}`}>
      {/* Front View */}
      <div className="flex flex-col items-center">
        <h4 className="text-foreground mb-2 text-sm font-semibold">Отпред</h4>
      </div>

      {/* Back View */}
      <div className="flex flex-col items-center">
        <h4 className="text-foreground mb-2 text-sm font-semibold">Отзад</h4>
      </div>
    </div>
  );
}
