export type Category = "gym" | "calisthenics" | "yoga" | null;

export type FormAnswers = Record<string, any>;

export interface UserStats {
  gender?: "male" | "female";
  height?: number;
  weight?: number;
  goal?: string;
  bmi: string;
  bodyFat: string;
  bodyFatMass: string;
  leanBodyMass: string;
}

export interface Exercise {
  exercise_name: string;
  sets: string;
  reps: string;
  rest?: string;
  tempo?: string;
  notes?: string;
  muscle_activation?: Record<string, boolean>;
}

export interface DayWorkout {
  day: string;
  focus: string;
  warmup: {
    duration_minutes: number;
    exercises: string[];
  };
  workout: Exercise[];
  cooldown: {
    duration_minutes: number;
    exercises: string[];
  };
}

export interface WorkoutRecommendations {
  weekly_schedule: DayWorkout[];
  safety_considerations?: string[];
}

export interface CategoryOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  field: string;
  title: string;
  type: "radio" | "radio-grid" | "radio-horizontal" | "checkbox" | "textarea" | "target-weight";
  options?: QuestionOption[] | number[] | string[];
  placeholder?: string;
  currentWeight?: number;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormQuestion {
  field: string;
  title: string;
  type: "radio" | "radio-grid" | "radio-horizontal" | "checkbox" | "textarea" | "target-weight" | "nutrients";
  options?: QuestionOption[] | number[] | string[];
  placeholder?: string;
  currentWeight?: number;
  description?: string;
}
