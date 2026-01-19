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

export interface DayRecommendationWorkout {
  id: number;
  generation_id: number;
  day: string;
  focus: string;
  warmup_duration_minutes: number;
  warmup_exercises: string[];
  cooldown_duration_minutes: number;
  cooldown_exercises: string[];
  created_at: string;
}

export interface Exercise {
  id: number;
  generation_id: number;
  day: string;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: string;
  workout_exercises: {
    category: string;
    muscle_activation: any;
  };
}

export interface WorkoutData {
  day_recommendations: DayRecommendationWorkout[];
  day_exercises: Exercise[];
}

export interface NutritionData {
  preferences: NutritionPreferences;
  generation: NutritionGeneration;
  day_recommendations: DayRecommendationNutrition[];
  day_meals: Meal[];
}

export interface Meal {
  id: number;
  created_at: Date;
  generation_id: number;
  meal_id: string;
  name: string;
  meal_type: string;
  day: string;
  time: string;
  nutrition_meals: NutritionMeals;
}

export interface NutritionMeals {
  fats: number;
  carbs: number;
  meal_id: string;
  protein: number;
  calories: number;
  prep_time: string;
  created_at: Date;
  description: string;
  ingredients: Ingredient[];
  cooking_time: string;
  instructions: string[];
}

export interface Ingredient {
  name: string;
  unit: string;
  quantity: number;
}

export interface DayRecommendationNutrition {
  id: number;
  generation_id: number;
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: Date;
}

export interface NutritionGeneration {
  id: number;
  user_id: string;
  preferences_id: number;
  created_at: Date;
  nutrition_tips: string[];
}

export interface NutritionPreferences {
  id: number;
  user_id: string;
  mainGoal: string;
  trainingTime: string;
  targetWeight: string;
  targetWeightValue: null;
  healthIssues: string;
  cuisinePreference: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  created_at: Date;
}

export interface BodyFatWeightEntry {
  createdAt: string;
  bodyFat: number | null;
  weight: number | null;
}

export type Status = "pending" | "completed" | "skipped";

export interface WorkoutExerciseProgress {
  id: string;
  session_id: string;
  user_id: string;
  day_exercise_id: number;
  status: Status;
  completed_at: string;
}

export interface MealItemProgress {
  id: string;
  session_id: string;
  user_id: string;
  day_meal_id: number;
  status: Status;
  completed_at: string;
}
