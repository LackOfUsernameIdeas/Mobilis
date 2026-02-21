import { describe, it, expect, vi, afterEach } from "vitest";

const mockClient = vi.hoisted(() => ({ from: vi.fn() }));

vi.mock("@/lib/db/clients/supabase", () => ({
  getServiceClient: vi.fn(() => mockClient),
}));

import {
  saveUserPreferences,
  saveWorkoutRecommendations,
  saveNutritionRecommendations,
  saveUserMeasurements,
  saveUserMetrics,
} from "@/server/saveFunctions";

// ─── Помощни функции за изграждане на вериги ──────────────────────────────────

/** Изгражда пълна верига insert → select → single */
function insertChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert, select, single };
}

/** Изгражда пълна верига upsert → select */
function upsertChain(result: { data: any; error: any }) {
  const select = vi.fn().mockResolvedValue(result);
  const upsert = vi.fn(() => ({ select }));
  return { upsert, select };
}

/** Изгражда пълна верига insert → select (без single) */
function insertSelectChain(result: { data: any; error: any }) {
  const select = vi.fn().mockResolvedValue(result);
  const insert = vi.fn(() => ({ select }));
  return { insert, select };
}

/** Изгражда верига select → eq → eq → order → limit → single */
function selectFilterChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const limit = vi.fn(() => ({ single }));
  const order = vi.fn(() => ({ limit }));
  const eq2 = vi.fn(() => ({ order }));
  const eq1 = vi.fn(() => ({ eq: eq2 }));
  const select = vi.fn(() => ({ eq: eq1 }));
  return { select, eq1, eq2, order, limit, single };
}

/** Изгражда верига select → eq → order → limit → single (с едно eq) */
function selectOneEqChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const limit = vi.fn(() => ({ single }));
  const order = vi.fn(() => ({ limit }));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, order, limit, single };
}

// ─── Тестови данни (фикстури) ─────────────────────────────────────────────────

const userId = "user-123";

// Отговори за фитнес категория
const gymAnswers = {
  mainGoal: "muscle",
  experience: "beginner",
  frequency: "3",
  warmupCooldown: "yes",
  muscleGroups: ["chest", "back"],
  targetWeight: "yes",
  targetWeightValue: "80",
  healthIssues: "none",
  specificExercises: "bench press",
};

// Отговори за йога категория
const yogaAnswers = {
  mainGoal: "flexibility",
  experience: "intermediate",
  frequency: "4",
  yogaStyle: "vinyasa",
  focusAreas: ["hips", "shoulders"],
  warmupSavasana: "yes",
  healthIssues: "none",
  specificExercises: "",
};

// Отговори за хранене
const nutritionAnswers = {
  mainGoal: "cut",
  trainingTime: "morning",
  targetWeight: "yes",
  targetWeightValue: "75",
  healthIssues: "none",
  cuisinePreference: ["mediterranean"],
  calories: "2000",
  protein: "150",
  carbs: "200",
  fats: "65",
};

// Препоръки за тренировки (примерни данни)
const workoutRecommendations = {
  weekly_schedule: [
    {
      day: "Monday",
      generation_id: 1,
      focus: "chest",
      warmup: { duration_minutes: 10, exercises: ["jog", "stretch"] },
      cooldown: { duration_minutes: 5, exercises: ["foam roll"] },
      workout: [
        {
          exercise_name: "Bench Press",
          exercise_id: "ex-1",
          generation_id: 1,
          day: "Monday",
          sets: 3,
          reps: "8-10",
          muscle_activation: {
            chest: true,
            front_delts: true,
            side_delts: false,
            rear_delts: false,
            biceps: false,
            triceps: true,
            forearms: false,
            traps: false,
            lats: false,
            lower_back: false,
            abs: false,
            obliques: false,
            quadriceps: false,
            hamstrings: false,
            glutes: false,
            calves: false,
            adductors: false,
          },
        },
      ],
    },
  ],
  safety_considerations: ["warm up properly"],
};

// Препоръки за хранене (примерни данни)
const nutritionRecommendations = {
  weekly_plan: [
    {
      day: "Monday",
      total_macros: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
      meals: [
        {
          meal_id: "meal-1",
          name: "Oatmeal",
          meal_type: "breakfast",
          time: "08:00",
          description: "Healthy oatmeal",
          ingredients: [{ name: "oats", quantity: 100, unit: "g" }],
          macros: { calories: 350, protein: 12, carbs: 60, fats: 6 },
          instructions: ["cook oats"],
          prep_time: 5,
          cooking_time: 10,
        },
      ],
    },
  ],
  nutrition_tips: ["drink water"],
};

// ─── saveUserPreferences ──────────────────────────────────────────────────────

describe("saveUserPreferences", () => {
  afterEach(() => vi.clearAllMocks());

  // Тестове за неподдържани категории
  describe("unsupported categories", () => {
    it("връща успех без извикване на БД за неподдържана категория", async () => {
      const result = await saveUserPreferences(userId, "meditation", {});

      expect(mockClient.from).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Category does not require saving" });
    });

    it("обработва всички неподдържани категории", async () => {
      for (const cat of ["cardio", "pilates", "running"]) {
        const result = await saveUserPreferences(userId, cat, {});
        expect(result.success).toBe(true);
      }
    });
  });

  // Тестове за категория хранене
  describe("nutrition category", () => {
    it("вмъква запис в nutrition_user_preferences и връща данните", async () => {
      const savedRecord = { id: "pref-1", user_id: userId };
      const chain = insertChain({ data: savedRecord, error: null });
      mockClient.from.mockReturnValue(chain);

      const result = await saveUserPreferences(userId, "nutrition", nutritionAnswers);

      expect(mockClient.from).toHaveBeenCalledWith("nutrition_user_preferences");
      expect(result).toEqual({ success: true, data: savedRecord });
    });

    it("подава правилните полета за хранене към insert", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "nutrition", nutritionAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          mainGoal: "cut",
          calories: 2000,
          protein: 150,
          carbs: 200,
          fats: 65,
          targetWeightValue: 75,
        }),
      );
    });

    it("задава targetWeightValue на null когато targetWeight не е 'yes'", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "nutrition", { ...nutritionAnswers, targetWeight: "no" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ targetWeightValue: null }));
    });

    it("cuisinePreference по подразбиране е празен масив, когато не е масив", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "nutrition", { ...nutritionAnswers, cuisinePreference: "mediterranean" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ cuisinePreference: [] }));
    });

    it("хвърля грешка при неуспешен insert в БД", async () => {
      const chain = insertChain({ data: null, error: { message: "DB error" } });
      mockClient.from.mockReturnValue(chain);

      await expect(saveUserPreferences(userId, "nutrition", nutritionAnswers)).rejects.toThrow(
        "Failed to save nutrition preferences: DB error",
      );
    });
  });

  // Тестове за фитнес категория
  describe("gym category", () => {
    it("вмъква запис в workout_user_preferences", async () => {
      const savedRecord = { id: "pref-2", user_id: userId };
      const chain = insertChain({ data: savedRecord, error: null });
      mockClient.from.mockReturnValue(chain);

      const result = await saveUserPreferences(userId, "gym", gymAnswers);

      expect(mockClient.from).toHaveBeenCalledWith("workout_user_preferences");
      expect(result).toEqual({ success: true, data: savedRecord });
    });

    it("включва специфичните полета за фитнес", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "gym", gymAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          warmupCooldown: "yes",
          muscleGroups: ["chest", "back"],
          targetWeight: "yes",
        }),
      );
    });

    it("muscleGroups по подразбиране е празен масив, когато не е масив", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "gym", { ...gymAnswers, muscleGroups: "chest" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ muscleGroups: [] }));
    });

    it("хвърля грешка при неуспешен insert в БД", async () => {
      const chain = insertChain({ data: null, error: { message: "constraint violation" } });
      mockClient.from.mockReturnValue(chain);

      await expect(saveUserPreferences(userId, "gym", gymAnswers)).rejects.toThrow(
        "Failed to save preferences: constraint violation",
      );
    });
  });

  // Тестове за категория калистеника
  describe("calisthenics category", () => {
    it("включва специфичните полета за калистеника (същите като фитнес)", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "calisthenics", gymAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ warmupCooldown: "yes", category: "calisthenics" }),
      );
    });
  });

  // Тестове за йога категория
  describe("yoga category", () => {
    it("вмъква специфичните полета за йога, а не тези за фитнес", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "yoga", yogaAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          yogaStyle: "vinyasa",
          focusAreas: ["hips", "shoulders"],
        }),
      );
      // Полетата за фитнес не трябва да присъстват
      expect(chain.insert).not.toHaveBeenCalledWith(expect.objectContaining({ warmupCooldown: expect.anything() }));
      expect(chain.insert).not.toHaveBeenCalledWith(expect.objectContaining({ muscleGroups: expect.anything() }));
    });
  });
});

// ─── saveWorkoutRecommendations ───────────────────────────────────────────────

describe("saveWorkoutRecommendations", () => {
  afterEach(() => vi.clearAllMocks());

  // Помощна функция за настройка на mock-овете за тренировки
  function setupWorkoutMocks({
    prefsResult = { data: { id: "pref-1" }, error: null },
    genResult = { data: { id: 42 }, error: null },
    daysResult = { data: [{ id: "day-1" }], error: null },
    exercisesUpsertResult = { data: [{ id: "ex-1" }], error: null },
    dayExercisesResult = { data: [{ id: "dex-1" }], error: null },
  } = {}) {
    const prefsChain = selectFilterChain(prefsResult);
    const genChain = insertChain(genResult);
    const daysChain = insertSelectChain(daysResult);
    const exercisesUpsertCh = upsertChain(exercisesUpsertResult);
    const dayExercisesChain = insertSelectChain(dayExercisesResult);

    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      const chains = [prefsChain, genChain, daysChain, exercisesUpsertCh, dayExercisesChain];
      return chains[callIndex++] || chains[chains.length - 1];
    });

    return { prefsChain, genChain, daysChain, exercisesUpsertCh, dayExercisesChain };
  }

  it("връща успех с generationId при успешно изпълнение", async () => {
    setupWorkoutMocks();

    const result = await saveWorkoutRecommendations(userId, "gym", workoutRecommendations);

    expect(result.success).toBe(true);
    expect(result.generationId).toBe(42);
    expect(result.data).toHaveProperty("generation");
    expect(result.data).toHaveProperty("days");
  });

  it("хвърля грешка когато weekly_schedule е празен", async () => {
    await expect(
      saveWorkoutRecommendations(userId, "gym", { weekly_schedule: [], safety_considerations: [] }),
    ).rejects.toThrow("No workout schedule provided");
  });

  it("хвърля грешка при неуспешно зареждане на предпочитания", async () => {
    const prefsChain = selectFilterChain({ data: null, error: { message: "not found" } });
    mockClient.from.mockReturnValue(prefsChain);

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to fetch preferences: not found",
    );
  });

  it("хвърля грешка при неуспешен insert на генерация", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectFilterChain({ data: { id: "pref-1" }, error: null });
      return insertChain({ data: null, error: { message: "gen error" } });
    });

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to create generation: gen error",
    );
  });

  it("хвърля грешка при неуспешен insert на препоръките по дни", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectFilterChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 42 }, error: null });
      return insertSelectChain({ data: null, error: { message: "days error" } });
    });

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to save day recommendations: days error",
    );
  });

  it("връща ранен резултат с празен масив от упражнения, когато няма упражнения в програмата", async () => {
    const noWorkoutRecs = {
      weekly_schedule: [
        {
          day: "Monday",
          generation_id: 1,
          focus: "rest",
          warmup: { duration_minutes: 0, exercises: [] },
          cooldown: { duration_minutes: 0, exercises: [] },
          // без поле workout
        },
      ],
      safety_considerations: [],
    };

    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectFilterChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 42 }, error: null });
      return insertSelectChain({ data: [{ id: "day-1" }], error: null });
    });

    const result = await saveWorkoutRecommendations(userId, "gym", noWorkoutRecs as any);

    expect(result.success).toBe(true);
    expect((result as any).data.exercises).toEqual([]);
  });

  it("хвърля грешка при неуспешен upsert на упражненията", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectFilterChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 42 }, error: null });
      if (callIndex === 3) return insertSelectChain({ data: [{ id: "day-1" }], error: null });
      return upsertChain({ data: null, error: { message: "upsert error" } });
    });

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to save workout exercises: upsert error",
    );
  });

  it("хвърля грешка при неуспешен insert на упражненията по дни", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectFilterChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 42 }, error: null });
      if (callIndex === 3) return insertSelectChain({ data: [{ id: "day-1" }], error: null });
      if (callIndex === 4) return upsertChain({ data: [{ id: "ex-1" }], error: null });
      return insertSelectChain({ data: null, error: { message: "day ex error" } });
    });

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to save day exercises: day ex error",
    );
  });
});

// ─── saveNutritionRecommendations ─────────────────────────────────────────────

describe("saveNutritionRecommendations", () => {
  afterEach(() => vi.clearAllMocks());

  // Помощна функция за настройка на mock-овете за хранене
  function setupNutritionMocks({
    prefsResult = { data: { id: "pref-1" }, error: null },
    genResult = { data: { id: 99 }, error: null },
    daysResult = { data: [{ id: "day-1" }], error: null },
    mealsUpsertResult = { data: [{ id: "meal-1" }], error: null },
    dayMealsResult = { data: [{ id: "dm-1" }], error: null },
  } = {}) {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain(prefsResult);
      if (callIndex === 2) return insertChain(genResult);
      if (callIndex === 3) return insertSelectChain(daysResult);
      if (callIndex === 4) return upsertChain(mealsUpsertResult);
      return insertSelectChain(dayMealsResult);
    });
  }

  it("връща успех с generationId при успешно изпълнение", async () => {
    setupNutritionMocks();

    const result = await saveNutritionRecommendations(userId, nutritionRecommendations);

    expect(result.success).toBe(true);
    expect(result.generationId).toBe(99);
    expect(result.data).toHaveProperty("generation");
    expect(result.data).toHaveProperty("days");
  });

  it("хвърля грешка когато weekly_plan е празен", async () => {
    await expect(saveNutritionRecommendations(userId, { weekly_plan: [], nutrition_tips: [] })).rejects.toThrow(
      "No nutrition plan provided",
    );
  });

  it("хвърля грешка при неуспешно зареждане на предпочитания", async () => {
    mockClient.from.mockReturnValue(selectOneEqChain({ data: null, error: { message: "not found" } }));

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to fetch preferences: not found",
    );
  });

  it("хвърля грешка при неуспешен insert на генерация", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain({ data: { id: "pref-1" }, error: null });
      return insertChain({ data: null, error: { message: "gen error" } });
    });

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to create generation: gen error",
    );
  });

  it("хвърля грешка при неуспешен insert на препоръките по дни", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 99 }, error: null });
      return insertSelectChain({ data: null, error: { message: "days error" } });
    });

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to save day recommendations: days error",
    );
  });

  it("връща ранен резултат с празен масив от ястия, когато планът няма ястия", async () => {
    const noMealsPlan = {
      weekly_plan: [{ day: "Monday", total_macros: { calories: 2000, protein: 150, carbs: 200, fats: 65 }, meals: [] }],
      nutrition_tips: [],
    };

    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 99 }, error: null });
      return insertSelectChain({ data: [{ id: "day-1" }], error: null });
    });

    const result = await saveNutritionRecommendations(userId, noMealsPlan);

    expect(result.success).toBe(true);
    expect((result as any).data.meals).toEqual([]);
  });

  it("хвърля грешка при неуспешен upsert на ястията", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 99 }, error: null });
      if (callIndex === 3) return insertSelectChain({ data: [{ id: "day-1" }], error: null });
      return upsertChain({ data: null, error: { message: "meals error" } });
    });

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to save meals: meals error",
    );
  });

  it("хвърля грешка при неуспешен insert на ястията по дни", async () => {
    let callIndex = 0;
    mockClient.from.mockImplementation(() => {
      callIndex++;
      if (callIndex === 1) return selectOneEqChain({ data: { id: "pref-1" }, error: null });
      if (callIndex === 2) return insertChain({ data: { id: 99 }, error: null });
      if (callIndex === 3) return insertSelectChain({ data: [{ id: "day-1" }], error: null });
      if (callIndex === 4) return upsertChain({ data: [{ id: "meal-1" }], error: null });
      return insertSelectChain({ data: null, error: { message: "day meals error" } });
    });

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to save day meals: day meals error",
    );
  });
});

// ─── saveUserMeasurements ─────────────────────────────────────────────────────

describe("saveUserMeasurements", () => {
  afterEach(() => vi.clearAllMocks());

  // Примерни данни за измервания
  const measurementData = {
    height: 180.4,
    weight: 75.6,
    gender: "male" as const,
    age: 30,
    activityLevel: "moderate",
    neck: 37.2,
    waist: 85.8,
  };

  it("вмъква и връща записания запис за измервания", async () => {
    const savedRecord = { id: "meas-1", user_id: userId };
    const chain = insertChain({ data: savedRecord, error: null });
    mockClient.from.mockReturnValue(chain);

    const result = await saveUserMeasurements(userId, measurementData);

    expect(mockClient.from).toHaveBeenCalledWith("user_measurements");
    expect(result).toEqual(savedRecord);
  });

  it("закръгля всички числови стойности преди вмъкване", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMeasurements(userId, measurementData);

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        height: 180,
        weight: 76,
        neck: 37,
        waist: 86,
      }),
    );
  });

  it("hip по подразбиране е 0 когато не е подаден (мъже)", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMeasurements(userId, measurementData);

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ hip: 0 }));
  });

  it("закръгля hip когато е подаден (жени)", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMeasurements(userId, { ...measurementData, gender: "female", hip: 95.7 });

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ hip: 96 }));
  });

  it("хвърля грешка при неуспешен insert в БД", async () => {
    const chain = insertChain({ data: null, error: new Error("insert failed") });
    mockClient.from.mockReturnValue(chain);

    await expect(saveUserMeasurements(userId, measurementData)).rejects.toThrow("insert failed");
  });
});

// ─── saveUserMetrics ──────────────────────────────────────────────────────────

describe("saveUserMetrics", () => {
  afterEach(() => vi.clearAllMocks());

  // Примерни данни за метрики
  const metricsData = {
    bmi: "22.5",
    health: "normal",
    healthy_bmi_range: "18.5 - 24.9",
    bodyFat: 15,
    bodyFatMass: 10.5,
    leanBodyMass: 60,
    goal: "maintenance",
    goalName: "Поддържане (Maintenance)",
    bmiCategory: "normal",
    bodyFatCategory: "fitness",
    reasoning: "All metrics are within healthy range.",
    bmr: 1800,
    tdee: 2200,
    calories: 2200,
    protein: 140,
    fats: 70,
    carbs: 250,
  };

  it("вмъква и връща записания запис за метрики", async () => {
    const savedRecord = { id: "metrics-1", user_id: userId };
    const chain = insertChain({ data: savedRecord, error: null });
    mockClient.from.mockReturnValue(chain);

    const result = await saveUserMetrics(userId, "meas-1", metricsData);

    expect(mockClient.from).toHaveBeenCalledWith("user_metrics");
    expect(result).toEqual(savedRecord);
  });

  it("парсва стойността на bmi от string към float преди вмъкване", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMetrics(userId, "meas-1", metricsData);

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ bmi: 22.5 }));
  });

  it("включва всички задължителни полета в payload-а за insert", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMetrics(userId, "meas-1", metricsData);

    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: userId,
        measurement_id: "meas-1",
        bodyFat: 15,
        bodyFatMass: 10.5,
        leanBodyMass: 60,
        goal: "maintenance",
        bmr: 1800,
        tdee: 2200,
        calories: 2200,
        protein: 140,
        fats: 70,
        carbs: 250,
      }),
    );
  });

  it("хвърля грешка при неуспешен insert в БД", async () => {
    const chain = insertChain({ data: null, error: new Error("metrics insert failed") });
    mockClient.from.mockReturnValue(chain);

    await expect(saveUserMetrics(userId, "meas-1", metricsData)).rejects.toThrow("metrics insert failed");
  });
});
