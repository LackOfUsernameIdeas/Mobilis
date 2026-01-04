export interface BMIData {
  bmi: number;
  health: string;
  healthy_bmi_range: string;
}

export interface BodyFatData {
  bodyFat: number;
  bodyFatMass: number;
  leanBodyMass: number;
}

export interface GoalData {
  goal: string;
  goalName: string;
  reasoning: string;
  bodyFatCategory: string;
}

export interface NutrientData {
  bmr: number;
  tdee: number;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
}

export interface DayRecommendation {
  day: string;
  generation_id: number;
}

export interface Exercise {
  id: number;
  generation_id: number;
  day: string;
  exercise_id: number;
  sets: number;
  reps: string;
  workout_exercises: {
    category: string;
    muscle_activation: any;
  };
}

export interface WorkoutData {
  day_recommendations: DayRecommendation[];
  day_exercises: Exercise[];
}

export interface BodyFatWeightEntry {
  createdAt: string;
  bodyFat: number | null;
  weight: number | null;
}

export interface HealthData {
  uid: any;
  bmiData: BMIData | null;
  bodyFatData: BodyFatData | null;
  goalData: GoalData | null;
  nutrientData: NutrientData | null;
  measurements: any;
  chartData: BodyFatWeightEntry[] | null;
  workoutData: WorkoutData | null;
}

export type ExerciseStatus = "pending" | "completed" | "skipped";

export interface WorkoutExerciseProgress {
  id: string;
  session_id: string;
  user_id: string;
  day_exercise_id: number;
  status: ExerciseStatus;
  completed_at: string;
}
