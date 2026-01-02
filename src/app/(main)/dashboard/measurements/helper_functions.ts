import type { FormData, UserData, ValidationLimits } from "./types";
import { LIMITS, FIELD_NAMES, STORAGE_KEY } from "./constants";

export const validateValue = (field: keyof ValidationLimits, value: number): string | null => {
  const limits = LIMITS[field];

  if (value < limits.min) {
    return `${FIELD_NAMES[field]} трябва да бъде поне ${limits.min} ${field === "weight" ? "кг" : field === "age" ? "години" : "см"}`;
  }
  if (value > limits.max) {
    return `${FIELD_NAMES[field]} трябва да бъде максимум ${limits.max} ${field === "weight" ? "кг" : field === "age" ? "години" : "см"}`;
  }
  return null;
};

export const isFormValid = (formData: FormData): boolean => {
  const { height, weight, gender, age, activityLevel, neck, waist, hip } = formData;

  if (!height || !weight || !gender || !age || !activityLevel || !neck || !waist || !hip) {
    return false;
  }

  const heightNum = Number.parseFloat(height);
  const weightNum = Number.parseFloat(weight);
  const ageNum = Number.parseFloat(age);
  const neckNum = Number.parseFloat(neck);
  const waistNum = Number.parseFloat(waist);
  const hipNum = Number.parseFloat(hip);

  return (
    validateValue("height", heightNum) === null &&
    validateValue("weight", weightNum) === null &&
    validateValue("age", ageNum) === null &&
    validateValue("neck", neckNum) === null &&
    validateValue("waist", waistNum) === null &&
    validateValue("hip", hipNum) === null
  );
};

export const loadSavedMeasurements = (): UserData | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      console.log("Loading saved measurements from localStorage");
      return JSON.parse(savedData) as UserData;
    }
  } catch (err) {
    console.error("Error loading saved measurements:", err);
  }
  return null;
};

export const saveMeasurements = (data: UserData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const convertFormDataToUserData = (formData: FormData): UserData => {
  return {
    height: Number.parseFloat(formData.height),
    weight: Number.parseFloat(formData.weight),
    gender: formData.gender as "male" | "female",
    age: Number.parseFloat(formData.age),
    activityLevel: formData.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
    neck: Number.parseFloat(formData.neck),
    waist: Number.parseFloat(formData.waist),
    hip: Number.parseFloat(formData.hip),
  };
};

export const validateAllFields = (data: UserData): string[] => {
  const validationErrors: string[] = [];
  (["height", "weight", "age", "neck", "waist", "hip"] as const).forEach((field) => {
    const error = validateValue(field, data[field] as number);
    if (error) validationErrors.push(error);
  });
  return validationErrors;
};
