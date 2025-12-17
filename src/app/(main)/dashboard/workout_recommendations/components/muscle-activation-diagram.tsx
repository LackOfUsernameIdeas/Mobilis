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
        <svg width="180" height="380" viewBox="0 0 180 380" className="drop-shadow-md">
          {/* Head */}
          <ellipse cx="90" cy="25" rx="20" ry="25" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />

          {/* Neck */}
          <rect x="80" y="45" width="20" height="15" fill="#FCD9B8" stroke="#8B7355" strokeWidth="1" />

          {/* Traps */}
          <path
            d="M 70 60 L 50 75 L 65 80 L 80 65 Z"
            fill={getColor(muscleActivation.traps)}
            stroke={getStroke(muscleActivation.traps)}
            strokeWidth="2"
          />
          <path
            d="M 110 60 L 130 75 L 115 80 L 100 65 Z"
            fill={getColor(muscleActivation.traps)}
            stroke={getStroke(muscleActivation.traps)}
            strokeWidth="2"
          />

          {/* Chest */}
          <path
            d="M 65 80 L 50 75 L 45 110 L 70 120 Z"
            fill={getColor(muscleActivation.chest)}
            stroke={getStroke(muscleActivation.chest)}
            strokeWidth="2"
          />
          <path
            d="M 115 80 L 130 75 L 135 110 L 110 120 Z"
            fill={getColor(muscleActivation.chest)}
            stroke={getStroke(muscleActivation.chest)}
            strokeWidth="2"
          />

          {/* Front Delts */}
          <ellipse
            cx="43"
            cy="85"
            rx="12"
            ry="18"
            fill={getColor(muscleActivation.front_delts)}
            stroke={getStroke(muscleActivation.front_delts)}
            strokeWidth="2"
          />
          <ellipse
            cx="137"
            cy="85"
            rx="12"
            ry="18"
            fill={getColor(muscleActivation.front_delts)}
            stroke={getStroke(muscleActivation.front_delts)}
            strokeWidth="2"
          />

          {/* Side Delts */}
          <ellipse
            cx="35"
            cy="85"
            rx="8"
            ry="16"
            fill={getColor(muscleActivation.side_delts)}
            stroke={getStroke(muscleActivation.side_delts)}
            strokeWidth="2"
          />
          <ellipse
            cx="145"
            cy="85"
            rx="8"
            ry="16"
            fill={getColor(muscleActivation.side_delts)}
            stroke={getStroke(muscleActivation.side_delts)}
            strokeWidth="2"
          />

          {/* Abs */}
          <rect
            x="70"
            y="120"
            width="40"
            height="50"
            rx="5"
            fill={getColor(muscleActivation.abs)}
            stroke={getStroke(muscleActivation.abs)}
            strokeWidth="2"
          />
          <line x1="90" y1="125" x2="90" y2="165" stroke={getStroke(muscleActivation.abs)} strokeWidth="1.5" />
          <line x1="72" y1="135" x2="108" y2="135" stroke={getStroke(muscleActivation.abs)} strokeWidth="1.5" />
          <line x1="72" y1="145" x2="108" y2="145" stroke={getStroke(muscleActivation.abs)} strokeWidth="1.5" />
          <line x1="72" y1="155" x2="108" y2="155" stroke={getStroke(muscleActivation.abs)} strokeWidth="1.5" />

          {/* Obliques */}
          <path
            d="M 68 130 L 55 140 L 60 165 L 70 165 Z"
            fill={getColor(muscleActivation.obliques)}
            stroke={getStroke(muscleActivation.obliques)}
            strokeWidth="2"
          />
          <path
            d="M 112 130 L 125 140 L 120 165 L 110 165 Z"
            fill={getColor(muscleActivation.obliques)}
            stroke={getStroke(muscleActivation.obliques)}
            strokeWidth="2"
          />

          {/* Biceps */}
          <ellipse
            cx="35"
            cy="120"
            rx="10"
            ry="25"
            fill={getColor(muscleActivation.biceps)}
            stroke={getStroke(muscleActivation.biceps)}
            strokeWidth="2"
          />
          <ellipse
            cx="145"
            cy="120"
            rx="10"
            ry="25"
            fill={getColor(muscleActivation.biceps)}
            stroke={getStroke(muscleActivation.biceps)}
            strokeWidth="2"
          />

          {/* Forearms */}
          <path
            d="M 30 145 L 25 180 L 35 182 L 40 147 Z"
            fill={getColor(muscleActivation.forearms)}
            stroke={getStroke(muscleActivation.forearms)}
            strokeWidth="2"
          />
          <path
            d="M 150 145 L 155 180 L 145 182 L 140 147 Z"
            fill={getColor(muscleActivation.forearms)}
            stroke={getStroke(muscleActivation.forearms)}
            strokeWidth="2"
          />

          {/* Hips/Pelvis */}
          <path
            d="M 60 170 L 55 190 L 70 200 L 90 195 L 110 200 L 125 190 L 120 170 Z"
            fill="#FCD9B8"
            stroke="#8B7355"
            strokeWidth="2"
          />

          {/* Quadriceps */}
          <path
            d="M 65 200 L 60 260 L 70 265 L 75 205 Z"
            fill={getColor(muscleActivation.quadriceps)}
            stroke={getStroke(muscleActivation.quadriceps)}
            strokeWidth="2"
          />
          <path
            d="M 115 200 L 120 260 L 110 265 L 105 205 Z"
            fill={getColor(muscleActivation.quadriceps)}
            stroke={getStroke(muscleActivation.quadriceps)}
            strokeWidth="2"
          />

          {/* Adductors */}
          <path
            d="M 77 205 L 85 205 L 88 255 L 80 260 Z"
            fill={getColor(muscleActivation.adductors)}
            stroke={getStroke(muscleActivation.adductors)}
            strokeWidth="2"
          />
          <path
            d="M 103 205 L 95 205 L 92 255 L 100 260 Z"
            fill={getColor(muscleActivation.adductors)}
            stroke={getStroke(muscleActivation.adductors)}
            strokeWidth="2"
          />

          {/* Lower Legs */}
          <rect x="58" y="265" width="14" height="55" rx="3" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
          <rect x="108" y="265" width="14" height="55" rx="3" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />

          {/* Calves */}
          <ellipse
            cx="65"
            cy="285"
            rx="9"
            ry="20"
            fill={getColor(muscleActivation.calves)}
            stroke={getStroke(muscleActivation.calves)}
            strokeWidth="2"
          />
          <ellipse
            cx="115"
            cy="285"
            rx="9"
            ry="20"
            fill={getColor(muscleActivation.calves)}
            stroke={getStroke(muscleActivation.calves)}
            strokeWidth="2"
          />

          {/* Feet */}
          <ellipse cx="65" cy="330" rx="12" ry="8" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
          <ellipse cx="115" cy="330" rx="12" ry="8" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
        </svg>
      </div>

      {/* Back View */}
      <div className="flex flex-col items-center">
        <h4 className="text-foreground mb-2 text-sm font-semibold">Отзад</h4>
        <svg width="180" height="380" viewBox="0 0 180 380" className="drop-shadow-md">
          {/* Head */}
          <ellipse cx="90" cy="25" rx="20" ry="25" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />

          {/* Neck */}
          <rect x="80" y="45" width="20" height="15" fill="#FCD9B8" stroke="#8B7355" strokeWidth="1" />

          {/* Traps */}
          <path
            d="M 70 60 L 50 75 L 55 90 L 75 80 Z"
            fill={getColor(muscleActivation.traps)}
            stroke={getStroke(muscleActivation.traps)}
            strokeWidth="2"
          />
          <path
            d="M 110 60 L 130 75 L 125 90 L 105 80 Z"
            fill={getColor(muscleActivation.traps)}
            stroke={getStroke(muscleActivation.traps)}
            strokeWidth="2"
          />

          {/* Rear Delts */}
          <ellipse
            cx="43"
            cy="85"
            rx="12"
            ry="18"
            fill={getColor(muscleActivation.rear_delts)}
            stroke={getStroke(muscleActivation.rear_delts)}
            strokeWidth="2"
          />
          <ellipse
            cx="137"
            cy="85"
            rx="12"
            ry="18"
            fill={getColor(muscleActivation.rear_delts)}
            stroke={getStroke(muscleActivation.rear_delts)}
            strokeWidth="2"
          />

          {/* Lats */}
          <path
            d="M 55 90 L 45 110 L 50 140 L 70 135 L 75 95 Z"
            fill={getColor(muscleActivation.lats)}
            stroke={getStroke(muscleActivation.lats)}
            strokeWidth="2"
          />
          <path
            d="M 125 90 L 135 110 L 130 140 L 110 135 L 105 95 Z"
            fill={getColor(muscleActivation.lats)}
            stroke={getStroke(muscleActivation.lats)}
            strokeWidth="2"
          />

          {/* Rhomboids */}
          <path
            d="M 75 85 L 65 105 L 75 125 L 85 110 Z"
            fill={getColor(muscleActivation.rhomboids)}
            stroke={getStroke(muscleActivation.rhomboids)}
            strokeWidth="2"
          />
          <path
            d="M 105 85 L 115 105 L 105 125 L 95 110 Z"
            fill={getColor(muscleActivation.rhomboids)}
            stroke={getStroke(muscleActivation.rhomboids)}
            strokeWidth="2"
          />

          {/* Lower Back */}
          <path
            d="M 70 135 L 50 140 L 55 170 L 90 175 L 125 170 L 130 140 L 110 135 Z"
            fill={getColor(muscleActivation.lower_back)}
            stroke={getStroke(muscleActivation.lower_back)}
            strokeWidth="2"
          />

          {/* Triceps */}
          <ellipse
            cx="35"
            cy="115"
            rx="10"
            ry="28"
            fill={getColor(muscleActivation.triceps)}
            stroke={getStroke(muscleActivation.triceps)}
            strokeWidth="2"
          />
          <ellipse
            cx="145"
            cy="115"
            rx="10"
            ry="28"
            fill={getColor(muscleActivation.triceps)}
            stroke={getStroke(muscleActivation.triceps)}
            strokeWidth="2"
          />

          {/* Forearms */}
          <path
            d="M 30 143 L 25 180 L 35 182 L 40 145 Z"
            fill={getColor(muscleActivation.forearms)}
            stroke={getStroke(muscleActivation.forearms)}
            strokeWidth="2"
          />
          <path
            d="M 150 143 L 155 180 L 145 182 L 140 145 Z"
            fill={getColor(muscleActivation.forearms)}
            stroke={getStroke(muscleActivation.forearms)}
            strokeWidth="2"
          />

          {/* Glutes */}
          <ellipse
            cx="70"
            cy="190"
            rx="16"
            ry="20"
            fill={getColor(muscleActivation.glutes)}
            stroke={getStroke(muscleActivation.glutes)}
            strokeWidth="2"
          />
          <ellipse
            cx="110"
            cy="190"
            rx="16"
            ry="20"
            fill={getColor(muscleActivation.glutes)}
            stroke={getStroke(muscleActivation.glutes)}
            strokeWidth="2"
          />

          {/* Hamstrings */}
          <path
            d="M 62 210 L 58 260 L 68 265 L 72 215 Z"
            fill={getColor(muscleActivation.hamstrings)}
            stroke={getStroke(muscleActivation.hamstrings)}
            strokeWidth="2"
          />
          <path
            d="M 118 210 L 122 260 L 112 265 L 108 215 Z"
            fill={getColor(muscleActivation.hamstrings)}
            stroke={getStroke(muscleActivation.hamstrings)}
            strokeWidth="2"
          />

          {/* Lower Legs */}
          <rect x="58" y="265" width="14" height="55" rx="3" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
          <rect x="108" y="265" width="14" height="55" rx="3" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />

          {/* Calves */}
          <ellipse
            cx="65"
            cy="285"
            rx="9"
            ry="20"
            fill={getColor(muscleActivation.calves)}
            stroke={getStroke(muscleActivation.calves)}
            strokeWidth="2"
          />
          <ellipse
            cx="115"
            cy="285"
            rx="9"
            ry="20"
            fill={getColor(muscleActivation.calves)}
            stroke={getStroke(muscleActivation.calves)}
            strokeWidth="2"
          />

          {/* Feet */}
          <ellipse cx="65" cy="330" rx="12" ry="8" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
          <ellipse cx="115" cy="330" rx="12" ry="8" fill="#FCD9B8" stroke="#8B7355" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
