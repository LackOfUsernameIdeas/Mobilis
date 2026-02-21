// tests/saveFunctions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── Mock setup ──────────────────────────────────────────────────────────────
// vi.mock() is hoisted above all variable declarations by Vitest's transformer,
// so we use vi.hoisted() to create the mockClient in the same hoisted scope.

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

// ─── Chain builder helpers ────────────────────────────────────────────────────

/** Builds a full insert → select → single chain */
function insertChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  return { insert, select, single };
}

/** Builds a full upsert → select chain */
function upsertChain(result: { data: any; error: any }) {
  const select = vi.fn().mockResolvedValue(result);
  const upsert = vi.fn(() => ({ select }));
  return { upsert, select };
}

/** Builds a full insert → select chain (no single) */
function insertSelectChain(result: { data: any; error: any }) {
  const select = vi.fn().mockResolvedValue(result);
  const insert = vi.fn(() => ({ select }));
  return { insert, select };
}

/** Builds a select → eq → eq → order → limit → single chain */
function selectFilterChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const limit = vi.fn(() => ({ single }));
  const order = vi.fn(() => ({ limit }));
  const eq2 = vi.fn(() => ({ order }));
  const eq1 = vi.fn(() => ({ eq: eq2 }));
  const select = vi.fn(() => ({ eq: eq1 }));
  return { select, eq1, eq2, order, limit, single };
}

/** Builds a select → eq → order → limit → single chain (one eq) */
function selectOneEqChain(result: { data: any; error: any }) {
  const single = vi.fn().mockResolvedValue(result);
  const limit = vi.fn(() => ({ single }));
  const order = vi.fn(() => ({ limit }));
  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  return { select, eq, order, limit, single };
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const userId = "user-123";

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

  describe("unsupported categories", () => {
    it("returns success without DB call for unsupported category", async () => {
      const result = await saveUserPreferences(userId, "meditation", {});

      expect(mockClient.from).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, message: "Category does not require saving" });
    });

    it("handles all unsupported category strings", async () => {
      for (const cat of ["cardio", "pilates", "running"]) {
        const result = await saveUserPreferences(userId, cat, {});
        expect(result.success).toBe(true);
      }
    });
  });

  describe("nutrition category", () => {
    it("inserts into nutrition_user_preferences and returns data", async () => {
      const savedRecord = { id: "pref-1", user_id: userId };
      const chain = insertChain({ data: savedRecord, error: null });
      mockClient.from.mockReturnValue(chain);

      const result = await saveUserPreferences(userId, "nutrition", nutritionAnswers);

      expect(mockClient.from).toHaveBeenCalledWith("nutrition_user_preferences");
      expect(result).toEqual({ success: true, data: savedRecord });
    });

    it("passes correct nutrition fields to insert", async () => {
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

    it("sets targetWeightValue to null when targetWeight is not yes", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "nutrition", { ...nutritionAnswers, targetWeight: "no" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ targetWeightValue: null }));
    });

    it("ensures cuisinePreference defaults to empty array when not array", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "nutrition", { ...nutritionAnswers, cuisinePreference: "mediterranean" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ cuisinePreference: [] }));
    });

    it("throws when DB insert fails", async () => {
      const chain = insertChain({ data: null, error: { message: "DB error" } });
      mockClient.from.mockReturnValue(chain);

      await expect(saveUserPreferences(userId, "nutrition", nutritionAnswers)).rejects.toThrow(
        "Failed to save nutrition preferences: DB error",
      );
    });
  });

  describe("gym category", () => {
    it("inserts into workout_user_preferences", async () => {
      const savedRecord = { id: "pref-2", user_id: userId };
      const chain = insertChain({ data: savedRecord, error: null });
      mockClient.from.mockReturnValue(chain);

      const result = await saveUserPreferences(userId, "gym", gymAnswers);

      expect(mockClient.from).toHaveBeenCalledWith("workout_user_preferences");
      expect(result).toEqual({ success: true, data: savedRecord });
    });

    it("includes gym-specific fields", async () => {
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

    it("defaults muscleGroups to empty array when not an array", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "gym", { ...gymAnswers, muscleGroups: "chest" });

      expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ muscleGroups: [] }));
    });

    it("throws when DB insert fails", async () => {
      const chain = insertChain({ data: null, error: { message: "constraint violation" } });
      mockClient.from.mockReturnValue(chain);

      await expect(saveUserPreferences(userId, "gym", gymAnswers)).rejects.toThrow(
        "Failed to save preferences: constraint violation",
      );
    });
  });

  describe("calisthenics category", () => {
    it("includes calisthenics-specific fields (same as gym)", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "calisthenics", gymAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ warmupCooldown: "yes", category: "calisthenics" }),
      );
    });
  });

  describe("yoga category", () => {
    it("inserts yoga-specific fields, not gym fields", async () => {
      const chain = insertChain({ data: { id: "1" }, error: null });
      mockClient.from.mockReturnValue(chain);

      await saveUserPreferences(userId, "yoga", yogaAnswers);

      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          yogaStyle: "vinyasa",
          focusAreas: ["hips", "shoulders"],
        }),
      );
      expect(chain.insert).not.toHaveBeenCalledWith(expect.objectContaining({ warmupCooldown: expect.anything() }));
      expect(chain.insert).not.toHaveBeenCalledWith(expect.objectContaining({ muscleGroups: expect.anything() }));
    });
  });
});

// ─── saveWorkoutRecommendations ───────────────────────────────────────────────

describe("saveWorkoutRecommendations", () => {
  afterEach(() => vi.clearAllMocks());

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

  it("returns success with generationId on happy path", async () => {
    setupWorkoutMocks();

    const result = await saveWorkoutRecommendations(userId, "gym", workoutRecommendations);

    expect(result.success).toBe(true);
    expect(result.generationId).toBe(42);
    expect(result.data).toHaveProperty("generation");
    expect(result.data).toHaveProperty("days");
  });

  it("throws when weekly_schedule is empty", async () => {
    await expect(
      saveWorkoutRecommendations(userId, "gym", { weekly_schedule: [], safety_considerations: [] }),
    ).rejects.toThrow("No workout schedule provided");
  });

  it("throws when preferences fetch fails", async () => {
    const prefsChain = selectFilterChain({ data: null, error: { message: "not found" } });
    mockClient.from.mockReturnValue(prefsChain);

    await expect(saveWorkoutRecommendations(userId, "gym", workoutRecommendations)).rejects.toThrow(
      "Failed to fetch preferences: not found",
    );
  });

  it("throws when generation insert fails", async () => {
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

  it("throws when day recommendations insert fails", async () => {
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

  it("returns early with empty exercises array when no workout exercises in schedule", async () => {
    const noWorkoutRecs = {
      weekly_schedule: [
        {
          day: "Monday",
          generation_id: 1,
          focus: "rest",
          warmup: { duration_minutes: 0, exercises: [] },
          cooldown: { duration_minutes: 0, exercises: [] },
          // no workout field
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

  it("throws when workout exercises upsert fails", async () => {
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

  it("throws when day exercises insert fails", async () => {
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

  it("returns success with generationId on happy path", async () => {
    setupNutritionMocks();

    const result = await saveNutritionRecommendations(userId, nutritionRecommendations);

    expect(result.success).toBe(true);
    expect(result.generationId).toBe(99);
    expect(result.data).toHaveProperty("generation");
    expect(result.data).toHaveProperty("days");
  });

  it("throws when weekly_plan is empty", async () => {
    await expect(saveNutritionRecommendations(userId, { weekly_plan: [], nutrition_tips: [] })).rejects.toThrow(
      "No nutrition plan provided",
    );
  });

  it("throws when preferences fetch fails", async () => {
    mockClient.from.mockReturnValue(selectOneEqChain({ data: null, error: { message: "not found" } }));

    await expect(saveNutritionRecommendations(userId, nutritionRecommendations)).rejects.toThrow(
      "Failed to fetch preferences: not found",
    );
  });

  it("throws when generation insert fails", async () => {
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

  it("throws when day recommendations insert fails", async () => {
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

  it("returns early with empty meals when no meals in plan", async () => {
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

  it("throws when meals upsert fails", async () => {
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

  it("throws when day meals insert fails", async () => {
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

  const measurementData = {
    height: 180.4,
    weight: 75.6,
    gender: "male" as const,
    age: 30,
    activityLevel: "moderate",
    neck: 37.2,
    waist: 85.8,
  };

  it("inserts and returns the saved measurement record", async () => {
    const savedRecord = { id: "meas-1", user_id: userId };
    const chain = insertChain({ data: savedRecord, error: null });
    mockClient.from.mockReturnValue(chain);

    const result = await saveUserMeasurements(userId, measurementData);

    expect(mockClient.from).toHaveBeenCalledWith("user_measurements");
    expect(result).toEqual(savedRecord);
  });

  it("rounds all numeric values before inserting", async () => {
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

  it("defaults hip to 0 when not provided (male)", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMeasurements(userId, measurementData);

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ hip: 0 }));
  });

  it("rounds hip when provided (female)", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMeasurements(userId, { ...measurementData, gender: "female", hip: 95.7 });

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ hip: 96 }));
  });

  it("throws when DB insert fails", async () => {
    const chain = insertChain({ data: null, error: new Error("insert failed") });
    mockClient.from.mockReturnValue(chain);

    await expect(saveUserMeasurements(userId, measurementData)).rejects.toThrow("insert failed");
  });
});

// ─── saveUserMetrics ──────────────────────────────────────────────────────────

describe("saveUserMetrics", () => {
  afterEach(() => vi.clearAllMocks());

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

  it("inserts and returns the saved metrics record", async () => {
    const savedRecord = { id: "metrics-1", user_id: userId };
    const chain = insertChain({ data: savedRecord, error: null });
    mockClient.from.mockReturnValue(chain);

    const result = await saveUserMetrics(userId, "meas-1", metricsData);

    expect(mockClient.from).toHaveBeenCalledWith("user_metrics");
    expect(result).toEqual(savedRecord);
  });

  it("parses bmi string to float before inserting", async () => {
    const chain = insertChain({ data: { id: "1" }, error: null });
    mockClient.from.mockReturnValue(chain);

    await saveUserMetrics(userId, "meas-1", metricsData);

    expect(chain.insert).toHaveBeenCalledWith(expect.objectContaining({ bmi: 22.5 }));
  });

  it("includes all required fields in the insert payload", async () => {
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

  it("throws when DB insert fails", async () => {
    const chain = insertChain({ data: null, error: new Error("metrics insert failed") });
    mockClient.from.mockReturnValue(chain);

    await expect(saveUserMetrics(userId, "meas-1", metricsData)).rejects.toThrow("metrics insert failed");
  });
});
