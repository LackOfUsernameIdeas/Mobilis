// Понастоящем завършени тренировъчни дни
export const COMPLETED_DAYS = ["Ден 1"];

// Съответствие между английски и български имена на дни
export const DAY_LABELS: Record<string, string> = {
  monday: "Понеделник",
  tuesday: "Вторник",
  wednesday: "Сряда",
  thursday: "Четвъртък",
  friday: "Петък",
  saturday: "Събота",
  sunday: "Неделя",
};

// Подреден списък на дните от седмицата
export const DAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

// Съответствие между ключове на цели и български етикети
export const GOAL_TO_BG: Record<string, string> = {
  dirty_bulk: "БЪРЗО КАЧВАНЕ",
  lean_bulk: "ЧИСТО КАЧВАНЕ",
  aggressive_cut: "АГРЕСИВНО ИЗГАРЯНЕ",
  cut: "ИЗГАРЯНЕ НА МАЗНИНИ",
  recomposition: "РЕКОМПОЗИЦИЯ",
  maintenance: "ПОДДРЪЖКА",
};

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Закуска",
  lunch: "Обяд",
  afternoon_snack: "Следобедна закуска",
  pre_workout_snack: "Преди тренировка",
  post_workout_snack: "След тренировка",
  dinner: "Вечеря",
};
