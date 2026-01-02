export type Gender = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type UserData = {
  height: number;
  weight: number;
  gender: Gender;
  age: number;
  activityLevel: ActivityLevel;
  neck: number;
  waist: number;
  hip: number;
};

export type FormData = {
  height: string;
  weight: string;
  gender: string;
  age: string;
  activityLevel: string;
  neck: string;
  waist: string;
  hip: string;
};

export type ValidationLimits = {
  height: { min: number; max: number };
  weight: { min: number; max: number };
  age: { min: number; max: number };
  neck: { min: number; max: number };
  waist: { min: number; max: number };
  hip: { min: number; max: number };
};

export type ActivityLevelOption = {
  value: ActivityLevel;
  label: string;
  description: string;
};
