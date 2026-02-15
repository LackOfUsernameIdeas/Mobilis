import { CategoryOption } from "./types";
import gym from "../../../../../public/gym.svg";
import calisthenics from "../../../../../public/calisthenics.svg";
import yoga from "../../../../../public/yoga.svg";

export const CATEGORIES: CategoryOption[] = [
  {
    id: "gym",
    title: "Фитнес",
    description: "Получете персонализирани планове за тренировки в залата",
    icon: gym,
  },
  {
    id: "calisthenics",
    title: "Калистеника",
    description: "Получете персонализирани планове за тренировки с калистеника",
    icon: calisthenics,
  },
  {
    id: "yoga",
    title: "Йога",
    description: "Намерете йога практики, които отговарят на вашите цели",
    icon: yoga,
  },
];

export const MUSCLE_LABELS: Record<string, string> = {
  chest: "Гръдни мускули",
  front_delts: "Предни делтоиди мускули",
  side_delts: "Странични делтоиди мускули",
  rear_delts: "Задни делтоиди мускули",
  biceps: "Бицепси",
  triceps: "Трицепси",
  forearms: "Предмишници",
  traps: "Трапецовидни мускули",
  lats: "Широк гръбен мускул",
  lower_back: "Долна част на гърба",
  abs: "Централни коремни мускули (abs)",
  obliques: "Странични коремни мускули (obliques)",
  quadriceps: "Квадрицепси",
  hamstrings: "Задни бедрени мускули",
  glutes: "Седалищни мускули",
  calves: "Прасци",
  adductors: "Аддукторни мускули",
};

export const MUSCLE_COLORS: Record<string, string> = {
  chest: "#E63946",
  front_delts: "#C9B800",
  side_delts: "#FF9F1C",
  rear_delts: "#8AC926",
  biceps: "#1982C4",
  triceps: "#6A4C93",
  forearms: "#FF6B6B",
  abs: "#FFBE0B",
  obliques: "#3A86FF",
  quadriceps: "#FF4D6D",
  adductors: "#06D6A0",
  calves: "#FFD166",
  traps: "#8338EC",
  lats: "#FF6700",
  lower_back: "#06B6D4",
  glutes: "#9D0208",
  hamstrings: "#FF5D8F",
};

export const MUSCLE_GROUP_OPTIONS = ["Гърди", "Гръб", "Рамене", "Ръце", "Корем", "Крака", "Нямам предпочитания"];

export const YOGA_FOCUS_AREA_OPTIONS = [
  "Гръбначен стълб и гръб",
  "Тазобедрени стави",
  "Рамене и врат",
  "Коремна мускулатура",
  "Крака и баланс",
  "Дишане и пранаяма",
  "Нямам предпочитания",
];

export const GYM_GOAL_OPTIONS = [
  {
    value: "cut",
    label: "Cut (Изгаряне на мазнини)",
    description: "Тренировки, насочени към изгаряне на телесните мазнини",
  },
  {
    value: "aggressive_cut",
    label: "Aggressive Cut (Интензивно изгаряне на мазнини)",
    description: "Интензивни тренировки за бързо изгаряне на телесните мазнини",
  },
  {
    value: "lean_bulk",
    label: "Lean Bulk (Чисто покачване на маса)",
    description: "Тренировки, насочени към постепенно и контролирано покачване на мускулна маса",
  },
  {
    value: "dirty_bulk",
    label: "Dirty Bulk (Интензивно покачване на маса)",
    description: "Интензивни тренировки за бързо набавяне на маса - мускулна и мастна",
  },
  {
    value: "recomposition",
    label: "Recomposition (Телесна рекомпозиция)",
    description: "Тренировки, насочени към едновременното изгаряне на телесните мазнини и покачване на мускулна маса",
  },
  {
    value: "maintenance",
    label: "Maintenance (Поддържане на текущата форма)",
    description: "Тренировки за запазване на текущото тегло и форма",
  },
  {
    value: "aesthetic",
    label: "Aesthetic (Естетика и пропорции)",
    description: "Тренировки, насочени към постигане на естетичен външен вид и балансирани пропорции",
  },
  {
    value: "strength",
    label: "Strength (Максимална сила)",
    description: "Тренировки с фокус върху максимална сила и силови показатели",
  },
];

export const EXPERIENCE_OPTIONS = [
  {
    value: "beginner",
    label: "Начинаещ",
    description: "Тренирате от кратко време",
  },
  {
    value: "basic",
    label: "Базово ниво",
    description: "Изпълнявате основни упражнения правилно",
  },
  {
    value: "intermediate",
    label: "Средно ниво",
    description: "Познавате силните и слабите си страни",
  },
  {
    value: "advanced",
    label: "Напреднал",
    description: "Работите с по-сложни програми",
  },
  {
    value: "expert",
    label: "Експерт",
    description: "Имате дългогодишна практика",
  },
];

export const FREQUENCY_OPTIONS = [2, 3, 4, 5, 6, 7];

export const YES_NO_OPTIONS = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Не" },
];

export const YOGA_GOAL_OPTIONS = [
  {
    value: "flexibility_balance",
    label: "Гъвкавост и баланс",
    description: "Практики, насочени към подобряване на гъвкавостта и баланса на тялото",
  },
  {
    value: "stress_relief",
    label: "Намаляване на стреса и релаксация",
    description: "Упражнения за успокояване на ума и намаляване на стреса",
  },
  {
    value: "strength_endurance",
    label: "Сила и издръжливост",
    description: "Динамични практики за изграждане на физическа сила и издръжливост",
  },
  {
    value: "mindfulness",
    label: "Осъзнатост и медитация",
    description: "Фокус върху дишането, медитацията и вътрешната осъзнатост",
  },
  {
    value: "posture",
    label: "Подобряване на стойката",
    description: "Работа върху коригиране и подобряване на телесната стойка",
  },
  {
    value: "energy_boost",
    label: "Повишаване на енергията",
    description: "Енергизиращи практики за повишаване на жизнеността и тонуса",
  },
];

export const YOGA_STYLE_OPTIONS = [
  { value: "hatha", label: "Hatha (по-бавно темпо, работа върху точната подредба на тялото)" },
  { value: "vinyasa", label: "Vinyasa (пози в последователност с плавни преходи и по-висока активност)" },
  { value: "yin", label: "Yin (дълго задържане на пози за по-дълбоко разтягане)" },
  { value: "power_yoga", label: "Power Yoga (по-динамична практика с акцент върху сила и контрол)" },
  { value: "restorative", label: "Restorative (леки пози с опора за по-добро отпускане)" },
  { value: "no_preference", label: "Нямам предпочитания" },
];

export const YOGA_EXPERIENCE_OPTIONS = [
  { value: "beginner", label: "Начинаещ", description: "Тренирате от кратко време" },
  { value: "basic", label: "Базово ниво", description: "Изпълнявате основни упражнения правилно" },
  { value: "intermediate", label: "Средно ниво", description: "Познавате силните и слабите си страни" },
  { value: "advanced", label: "Напреднал", description: "Работите с по-сложни програми" },
  { value: "expert", label: "Експерт", description: "Имате дългогодишна практика" },
];

export const GYM_FORM_TEXT = {
  title: (isCategoryGym: boolean) => `Въпросник за ${isCategoryGym ? "фитнес" : "калистенични"} препоръки`,
  description: "Отговорете на няколко въпроса, за да получите персонализирани препоръки",
  recommendedBadge: "Препоръчителна цел",
  noIssues: "Няма",
  healthIssuesPlaceholder: "напр. болки в кръста, проблеми със ставите, сърдечни заболявания",
  specificExercisesPlaceholder: "напр. Bench Press, Deadlift, Squats, Pull-ups",
  targetWeight: {
    currentWeight: "Текущо тегло",
    unit: "кг",
    yes: "Да, имам целево тегло",
    no: "Не, нямам конкретно целево тегло",
    inputLabel: "Въведете целевото си тегло",
    inputPlaceholder: "напр. 75.5",
  },
  buttons: {
    back: "Назад",
    next: "Напред",
    submit: "Получи моите препоръки",
  },
};

export const YOGA_FORM_TEXT = {
  title: "Въпросник за йога препоръки",
  description: "Отговорете на няколко въпроса, за да получите персонализирани препоръки",
  noIssues: "Няма",
  healthIssuesPlaceholder: "напр. болки в кръста, проблеми със ставите, високо кръвно налягане",
  specificPosesPlaceholder: "напр. Downward Dog, Warrior poses, Tree Pose, Headstand",
  buttons: {
    back: "Назад",
    next: "Напред",
    submit: "Получи моите препоръки",
  },
};

export const YOGA_QUESTIONS = [
  {
    field: "mainGoal",
    title: "Каква е вашата основна цел?",
    type: "radio",
    options: YOGA_GOAL_OPTIONS,
  },
  {
    field: "yogaStyle",
    title: "Какъв стил йога предпочитате?",
    type: "radio",
    options: YOGA_STYLE_OPTIONS,
  },
  {
    field: "experience",
    title: "Какво е вашето ниво на опит в йогата?",
    type: "radio",
    options: YOGA_EXPERIENCE_OPTIONS,
  },
  {
    field: "frequency",
    title: "Колко често бихте имали възможност да практикувате йога?",
    type: "radio-grid",
    options: FREQUENCY_OPTIONS,
  },
  {
    field: "warmupSavasana",
    title: "Желаете ли програмата да включва препоръки за загряване преди практика и Shavasana (медитация) след нея?",
    type: "radio-horizontal",
    options: YES_NO_OPTIONS,
  },
  {
    field: "focusAreas",
    title: "Има ли конкретна област на тялото или аспект, върху които желаете да се фокусирате предимно?",
    type: "checkbox",
    options: YOGA_FOCUS_AREA_OPTIONS,
  },
  {
    field: "healthIssues",
    title: "Съществуват ли някакви здравословни проблеми, контузии или ограничения?",
    type: "textarea",
    placeholder: YOGA_FORM_TEXT.healthIssuesPlaceholder,
  },
  {
    field: "specificExercises",
    title: "Има ли конкретни йога пози, които желаете да бъдат включени в програмата?",
    type: "textarea",
    placeholder: YOGA_FORM_TEXT.specificPosesPlaceholder,
  },
];

export const RESULTS_LOADING_TEXT = "Генериране на тренировъчни препоръки. Моля, изчакайте 1-2 минути...";

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
  progressBar: {
    initial: { width: 0 },
    transition: { duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] },
  },
} as const;

export const EASE_CURVE = [0.21, 0.47, 0.32, 0.98] as const;

export const NO_PREFERENCE_OPTION = "Нямам предпочитания";
