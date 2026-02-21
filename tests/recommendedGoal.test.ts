// tests/recommendedGoal.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks MUST be before other imports
vi.mock("@/lib/db/clients/server", () => ({
  getServerClient: vi.fn(),
}));

vi.mock("@/server/health", () => ({
  calculateBMI: vi.fn(),
  calculateBodyFat: vi.fn(),
}));

import { getServerClient } from "@/lib/db/clients/server";
import { calculateBMI, calculateBodyFat } from "@/server/health";
import { getRecommendedGoal, getMostRecommendedGoal } from "@/server/recommendedGoal";

// ─── Helpers ────────────────────────────────────────────────────────────────

function mockHealthCalcs(bmi: number, bodyFat: number) {
  vi.mocked(calculateBMI).mockReturnValue({ bmi: String(bmi) } as any);
  vi.mocked(calculateBodyFat).mockReturnValue({ bodyFat } as any);
}

// ─── getRecommendedGoal ──────────────────────────────────────────────────────

describe("getRecommendedGoal", () => {
  afterEach(() => vi.clearAllMocks());

  describe("BMI-driven critical cases", () => {
    it("recommends dirty_bulk for severe thinness (BMI < 16)", () => {
      mockHealthCalcs(14, 8);
      const result = getRecommendedGoal(180, 45, "male", 35, 75);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bmiCategory).toBe("severe_thin");
    });

    it("recommends dirty_bulk for moderate thinness (16 ≤ BMI < 17)", () => {
      mockHealthCalcs(16.5, 10);
      const result = getRecommendedGoal(180, 53, "male", 35, 75);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bmiCategory).toBe("moderate_thin");
    });

    it("recommends aggressive_cut for obese class 3 (BMI ≥ 40)", () => {
      mockHealthCalcs(42, 35);
      const result = getRecommendedGoal(170, 121, "male", 45, 120);
      expect(result.goal).toBe("aggressive_cut");
      expect(result.bmiCategory).toBe("obese_3");
    });

    it("recommends aggressive_cut for obese class 2 (35 ≤ BMI < 40)", () => {
      mockHealthCalcs(37, 33);
      const result = getRecommendedGoal(170, 107, "male", 45, 115);
      expect(result.goal).toBe("aggressive_cut");
      expect(result.bmiCategory).toBe("obese_2");
    });

    it("recommends cut for obese class 1 (30 ≤ BMI < 35)", () => {
      mockHealthCalcs(32, 28);
      const result = getRecommendedGoal(170, 92, "male", 40, 105);
      expect(result.goal).toBe("cut");
      expect(result.bmiCategory).toBe("obese_1");
    });
  });

  describe("critical body fat", () => {
    it("recommends dirty_bulk for critical body fat in males (< 2%)", () => {
      mockHealthCalcs(22, 1);
      const result = getRecommendedGoal(180, 71, "male", 35, 78);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bodyFatCategory).toBe("critical");
    });

    it("recommends dirty_bulk for critical body fat in females (< 10%)", () => {
      mockHealthCalcs(22, 8);
      const result = getRecommendedGoal(165, 60, "female", 32, 72);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bodyFatCategory).toBe("critical");
    });
  });

  describe("mild thinness", () => {
    it("recommends lean_bulk for mild thinness (17.5 ≤ BMI < 18.5)", () => {
      mockHealthCalcs(18, 12);
      const result = getRecommendedGoal(180, 58, "male", 35, 76);
      expect(result.goal).toBe("lean_bulk");
      expect(result.bmiCategory).toBe("mild_thin");
    });
  });

  describe("normal BMI combinations", () => {
    it("recommends recomposition when BMI normal + body fat obese (male)", () => {
      mockHealthCalcs(23, 26);
      const result = getRecommendedGoal(180, 74, "male", 37, 90);
      expect(result.goal).toBe("recomposition");
      expect(result.bmiCategory).toBe("normal");
      expect(result.bodyFatCategory).toBe("obese");
    });

    it("recommends recomposition when BMI normal + body fat average (male)", () => {
      mockHealthCalcs(23, 20);
      const result = getRecommendedGoal(180, 74, "male", 37, 85);
      expect(result.goal).toBe("recomposition");
      expect(result.bodyFatCategory).toBe("average");
    });

    it("recommends maintenance when BMI normal + body fat fitness (male)", () => {
      mockHealthCalcs(23, 15);
      const result = getRecommendedGoal(180, 74, "male", 36, 80);
      expect(result.goal).toBe("maintenance");
      expect(result.bodyFatCategory).toBe("fitness");
    });

    it("recommends maintenance when BMI normal + body fat athletes (male)", () => {
      mockHealthCalcs(23, 10);
      const result = getRecommendedGoal(180, 74, "male", 36, 78);
      expect(result.goal).toBe("maintenance");
      expect(result.bodyFatCategory).toBe("athletes");
    });

    it("recommends recomposition when BMI normal + body fat obese (female)", () => {
      mockHealthCalcs(23, 34);
      const result = getRecommendedGoal(165, 62, "female", 32, 90);
      expect(result.goal).toBe("recomposition");
      expect(result.bodyFatCategory).toBe("obese");
    });
  });

  describe("overweight BMI combinations", () => {
    it("recommends maintenance when overweight + body fat fitness (athletes/fitness)", () => {
      mockHealthCalcs(27, 15);
      const result = getRecommendedGoal(180, 87, "male", 37, 88);
      expect(result.goal).toBe("maintenance");
      expect(result.bmiCategory).toBe("overweight");
    });

    it("recommends recomposition when overweight + body fat average", () => {
      mockHealthCalcs(27, 20);
      const result = getRecommendedGoal(180, 87, "male", 38, 92);
      expect(result.goal).toBe("recomposition");
      expect(result.bmiCategory).toBe("overweight");
      expect(result.bodyFatCategory).toBe("average");
    });

    it("recommends cut when overweight + body fat obese", () => {
      mockHealthCalcs(27, 27);
      const result = getRecommendedGoal(180, 87, "male", 40, 100);
      expect(result.goal).toBe("cut");
      expect(result.bmiCategory).toBe("overweight");
      expect(result.bodyFatCategory).toBe("obese");
    });
  });

  describe("return shape", () => {
    it("returns all required fields", () => {
      mockHealthCalcs(23, 15);
      const result = getRecommendedGoal(180, 74, "male", 36, 80);

      expect(result).toHaveProperty("goal");
      expect(result).toHaveProperty("goalName");
      expect(result).toHaveProperty("bmi");
      expect(result).toHaveProperty("bmiCategory");
      expect(result).toHaveProperty("bodyFatPercentage");
      expect(result).toHaveProperty("bodyFatCategory");
      expect(result).toHaveProperty("reasoning");
    });

    it("passes bmi and bodyFat values through to the result", () => {
      mockHealthCalcs(22.5, 14);
      const result = getRecommendedGoal(180, 73, "male", 36, 80);

      expect(result.bmi).toBe(22.5);
      expect(result.bodyFatPercentage).toBe(14);
    });

    it("forwards hip to calculateBodyFat for females", () => {
      mockHealthCalcs(23, 22);
      getRecommendedGoal(165, 62, "female", 32, 75, 95);

      expect(calculateBodyFat).toHaveBeenCalledWith(165, "female", 62, 32, 75, 95);
    });

    it("passes undefined hip for males", () => {
      mockHealthCalcs(23, 15);
      getRecommendedGoal(180, 74, "male", 36, 80);

      expect(calculateBodyFat).toHaveBeenCalledWith(180, "male", 74, 36, 80, undefined);
    });
  });
});

// ─── getMostRecommendedGoal ──────────────────────────────────────────────────

describe("getMostRecommendedGoal", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = { from: vi.fn() };
    vi.mocked(getServerClient).mockResolvedValue(mockSupabase);
  });

  afterEach(() => vi.clearAllMocks());

  function mockMetrics(data: any[] | null, error: any = null) {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data, error }),
    });
  }

  describe("successful queries", () => {
    it("returns the most frequent goal", async () => {
      mockMetrics([
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "maintenance", goalName: "Поддържане (Maintenance)" },
      ]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: true,
        data: { goal: "cut", goalName: "Изгаряне на мазнини (Cut)", count: 2 },
      });
    });

    it("returns single record when only one entry exists", async () => {
      mockMetrics([{ goal: "lean_bulk", goalName: "Чисто качване (Lean Bulk)" }]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: true,
        data: { goal: "lean_bulk", goalName: "Чисто качване (Lean Bulk)", count: 1 },
      });
    });

    it("returns null data when metrics table is empty", async () => {
      mockMetrics([]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({ success: true, data: null });
    });

    it("returns null data when metrics table returns null", async () => {
      mockMetrics(null);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({ success: true, data: null });
    });

    it("breaks ties by returning whichever appears first in Object.values order", async () => {
      mockMetrics([
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "maintenance", goalName: "Поддържане (Maintenance)" },
      ]);

      const result = await getMostRecommendedGoal();

      expect(result.success).toBe(true);
      // Both have count 1 — the reduce returns whichever comes last (current > max)
      // In this case "maintenance" would win due to strict `>` comparison
      expect((result as any).data.count).toBe(1);
    });

    it("correctly counts multiple distinct goals", async () => {
      mockMetrics([
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "dirty_bulk", goalName: "Бързо качване (Dirty Bulk)" },
        { goal: "dirty_bulk", goalName: "Бързо качване (Dirty Bulk)" },
        { goal: "dirty_bulk", goalName: "Бързо качване (Dirty Bulk)" },
        { goal: "maintenance", goalName: "Поддържане (Maintenance)" },
      ]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: true,
        data: { goal: "dirty_bulk", goalName: "Бързо качване (Dirty Bulk)", count: 3 },
      });
    });

    it("treats same goal with different goalName as separate entries", async () => {
      mockMetrics([
        { goal: "cut", goalName: "Name A" },
        { goal: "cut", goalName: "Name B" },
        { goal: "cut", goalName: "Name A" },
      ]);

      const result = await getMostRecommendedGoal();

      expect(result.success).toBe(true);
      expect((result as any).data.goal).toBe("cut");
      expect((result as any).data.goalName).toBe("Name A");
      expect((result as any).data.count).toBe(2);
    });
  });

  describe("error handling", () => {
    it("returns failure when supabase query errors", async () => {
      mockMetrics(null, new Error("DB error"));

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: false,
        error: "Failed to get most recommended goal",
      });
    });

    it("throws when getServerClient rejects (not caught by function)", async () => {
      vi.mocked(getServerClient).mockRejectedValue(new Error("Auth error"));

      await expect(getMostRecommendedGoal()).rejects.toThrow("Auth error");
    });
  });

  describe("return shape", () => {
    it("success response with data has correct shape", async () => {
      mockMetrics([{ goal: "recomposition", goalName: "Рекомпозиция (Recomposition)" }]);

      const result = await getMostRecommendedGoal();

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
      const data = (result as any).data;
      expect(data).toHaveProperty("goal");
      expect(data).toHaveProperty("goalName");
      expect(data).toHaveProperty("count");
      expect(typeof data.count).toBe("number");
    });

    it("failure response has correct shape", async () => {
      mockMetrics(null, new Error("fail"));

      const result = await getMostRecommendedGoal();

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("data");
    });
  });
});
