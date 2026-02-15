export interface UserStats {
  gender?: "male" | "female";
  height?: number;
  weight?: number;
  age?: number;
  goal?: string;
  activityLevel?: string;
  bmi: string;
  bodyFat: string;
  bodyFatMass: string;
  leanBodyMass: string;
}

export interface FormAnswers {
  mainGoal: string;
  trainingTime: string;
  targetWeight: string;
  targetWeightValue: string;
  healthIssues: string;
  cuisinePreference: string[];
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
}

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface FormQuestion {
  field: string;
  title: string;
  type: "radio" | "checkbox" | "textarea" | "target-weight" | "nutrients";
  options?: QuestionOption[] | string[];
  placeholder?: string;
  description?: string;
  currentWeight?: number;
}

export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionMeal {
  meal_id: string;
  name: string;
  meal_type: string;
  time: string;
  description: string;
  ingredients: Ingredient[];
  macros: MacroNutrients;
  instructions: string[];
  prep_time: number;
  cooking_time: number;
}

export interface DayPlan {
  day: string;
  total_macros: MacroNutrients;
  meals: NutritionMeal[];
}

export interface NutritionPlan {
  weekly_plan: DayPlan[];
  nutrition_tips: string[];
}

export interface NutritionFormProps {
  onSubmit: (answers: FormAnswers) => void;
  usersStats: UserStats | null;
}

export interface ResultsDisplayProps {
  userId: string;
  answers: FormAnswers;
  userStats?: UserStats | null;
  onReset: () => void;
}

export interface MealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: NutritionMeal | null;
}

export interface NutrientRecommendationParams {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
}

export interface NutrientRecommendations {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}
