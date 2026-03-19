import type { QuestionOption } from "./types";

export const CUISINE_OPTIONS = ["Българска", "Испанска", "Италианска", "Френска", "Нямам предпочитания"] as const;

export const GOAL_OPTIONS: QuestionOption[] = [
  {
    value: "cut",
    label: "Cut (Изгаряне на мазнини)",
    description: "Хранене, насочено към понижаване на телесните мазнини",
  },
  {
    value: "aggressive_cut",
    label: "Aggressive Cut (Интензивно изгаряне на мазнини)",
    description: "Хранене за бързо понижаване на телесните мазнини",
  },
  {
    value: "lean_bulk",
    label: "Lean Bulk (Чисто покачване на маса)",
    description: "Хранене, насочено към постепенно и контролирано покачване на мускулна маса",
  },
  {
    value: "dirty_bulk",
    label: "Dirty Bulk (Интензивно покачване на маса)",
    description: "Хранене с висок калориен прием за бързо набавяне на маса",
  },
  {
    value: "recomposition",
    label: "Recomposition (Телесна рекомпозиция)",
    description:
      "Хранене, насочено към едновременното понижаване на телесните мазнини и постепенното покачване на мускулна маса",
  },
  {
    value: "maintenance",
    label: "Maintenance (Поддържане на текущата форма)",
    description: "Хранене за запазване на текущото тегло и форма",
  },
  {
    value: "aesthetic",
    label: "Aesthetic (Естетика и пропорции)",
    description: "Хранене, насочено към постигане на естетичен външен вид и балансирани пропорции",
  },
  {
    value: "strength",
    label: "Strength (Максимална сила)",
    description: "Хранене с фокус върху максимална сила и силови показатели",
  },
];

export const TRAINING_TIME_OPTIONS: QuestionOption[] = [
  { value: "morning", label: "Сутрин", description: "06:00-09:00" },
  { value: "before-noon", label: "Предиобед", description: "09:00-12:00" },
  { value: "noon", label: "Обяд", description: "12:00-14:00" },
  { value: "afternoon", label: "Следобед", description: "14:00-17:00" },
  { value: "evening", label: "Вечер", description: "17:00-21:00" },
];

export const TRAINING_DAYS_OPTIONS: QuestionOption[] = [
  { value: "monday", label: "Понеделник" },
  { value: "tuesday", label: "Вторник" },
  { value: "wednesday", label: "Сряда" },
  { value: "thursday", label: "Четвъртък" },
  { value: "friday", label: "Петък" },
  { value: "saturday", label: "Събота" },
  { value: "sunday", label: "Неделя" },
];

export const MEAL_TYPE_TRANSLATIONS: Record<string, string> = {
  breakfast: "Закуска",
  morning_snack: "Предиобедна закуска",
  lunch: "Обяд",
  afternoon_snack: "Следобедна закуска",
  pre_workout_snack: "Предтренировъчно ястие",
  post_workout_snack: "Следтренировъчно ястие",
  dinner: "Вечеря",
};

export const INPUT_LIMITS = {
  targetWeight: {
    max: 200,
    pattern: /^\d{0,3}(\.\d{0,2})?$/,
  },
  calories: {
    max: 10000,
    pattern: /^\d{0,5}(\.\d{0,2})?$/,
  },
  protein: {
    max: 600,
    pattern: /^\d{0,4}(\.\d{0,2})?$/,
  },
  carbs: {
    max: 1000,
    pattern: /^\d{0,4}(\.\d{0,2})?$/,
  },
  fats: {
    max: 400,
    pattern: /^\d{0,4}(\.\d{0,2})?$/,
  },
} as const;

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
  },
  slideIn: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
  },
  staggerItem: (index: number) => ({
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.2,
      delay: index * 0.05,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
} as const;

export const FORM_TEXT = {
  title: "Въпросник за хранителни препоръки",
  description: "Отговорете на няколко въпроса, за да получите персонализирани хранителни препоръки",
  recommendedBadge: "Препоръчителна цел",
  buttons: {
    next: "Напред",
    back: "Назад",
    submit: "Получи моите препоръки",
    reset: "Генерирайте отново",
  },
  healthIssuesPlaceholder:
    "напр. алергия към ядки, лактозна непоносимост, стомашни проблеми, високо кръвно налягане, религиозни ограничения",
  noHealthIssues: "Няма",
  targetWeight: {
    currentWeight: "Текущо тегло",
    yes: "Да, имам целево тегло",
    no: "Не, нямам конкретно целево тегло",
    inputLabel: "Въведете целевото си тегло",
    inputPlaceholder: "напр. 75.5",
    unit: "кг",
  },
  nutrients: {
    description:
      "Стойностите по-долу са препоръчителни и са изчислени според избраната от вас цел. Можете по ваша преценка да ги промените.",
    calories: "Калории",
    protein: "Протеини",
    carbs: "Въглехидрати",
    fats: "Мазнини",
  },
} as const;

export const RESULTS_TEXT = {
  loadingMessage: "Генериране на хранителен план. Моля, изчакайте 2-3 минути...",
  weeklyPlanTitle: "Седмичен хранителен план",
  dailyMacrosTitle: "Препоръчителни стойности на макроси за ден:",
  totalMacrosTitle: "Общо стойности на макроси за деня:",
  nutritionTipsTitle: "💡 Хранителни съвети:",
  prognosisTitle: "Прогноза за постигане на целево тегло",
  prognosisEstimatedDate: "Очаквано време за постигане на целта",
  prognosisWeeklyChange: "Седмична промяна",
  prognosisMilestones: "Очаквани етапи на развитие",
  errorMessage: "Нещо се обърка. Моля, опитайте отново.",
  orientative: "*ориентировъчно",
  macroLabels: {
    cal: "Cal:",
    p: "P:",
    c: "C:",
    f: "F:",
  },
} as const;
