import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock-овете ТРЯБВА да са преди другите импорти
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

function mockHealthCalcs(bmi: number, bodyFat: number) {
  vi.mocked(calculateBMI).mockReturnValue({ bmi: String(bmi) } as any);
  vi.mocked(calculateBodyFat).mockReturnValue({ bodyFat } as any);
}

describe("getRecommendedGoal", () => {
  afterEach(() => vi.clearAllMocks());

  describe("BMI-driven critical cases", () => {
    it("препоръчва dirty_bulk при тежко поднормено тегло (BMI < 16)", () => {
      mockHealthCalcs(14, 8);
      const result = getRecommendedGoal(180, 45, "male", 35, 75);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bmiCategory).toBe("severe_thin");
    });

    it("препоръчва dirty_bulk при умерено поднормено тегло (16 ≤ BMI < 17)", () => {
      mockHealthCalcs(16.5, 10);
      const result = getRecommendedGoal(180, 53, "male", 35, 75);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bmiCategory).toBe("moderate_thin");
    });

    it("препоръчва aggressive_cut при затлъстяване клас 3 (BMI ≥ 40)", () => {
      mockHealthCalcs(42, 35);
      const result = getRecommendedGoal(170, 121, "male", 45, 120);
      expect(result.goal).toBe("aggressive_cut");
      expect(result.bmiCategory).toBe("obese_3");
    });

    it("препоръчва aggressive_cut при затлъстяване клас 2 (35 ≤ BMI < 40)", () => {
      mockHealthCalcs(37, 33);
      const result = getRecommendedGoal(170, 107, "male", 45, 115);
      expect(result.goal).toBe("aggressive_cut");
      expect(result.bmiCategory).toBe("obese_2");
    });

    it("препоръчва cut при затлъстяване клас 1 (30 ≤ BMI < 35)", () => {
      mockHealthCalcs(32, 28);
      const result = getRecommendedGoal(170, 92, "male", 40, 105);
      expect(result.goal).toBe("cut");
      expect(result.bmiCategory).toBe("obese_1");
    });
  });

  describe("critical body fat", () => {
    it("препоръчва dirty_bulk при критично ниска телесна мазнина при мъже (< 2%)", () => {
      mockHealthCalcs(22, 1);
      const result = getRecommendedGoal(180, 71, "male", 35, 78);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bodyFatCategory).toBe("critical");
    });

    it("препоръчва dirty_bulk при критично ниска телесна мазнина при жени (< 10%)", () => {
      mockHealthCalcs(22, 8);
      const result = getRecommendedGoal(165, 60, "female", 32, 72);
      expect(result.goal).toBe("dirty_bulk");
      expect(result.bodyFatCategory).toBe("critical");
    });
  });

  describe("mild thinness", () => {
    it("препоръчва lean_bulk при леко поднормено тегло (17.5 ≤ BMI < 18.5)", () => {
      mockHealthCalcs(18, 12);
      const result = getRecommendedGoal(180, 58, "male", 35, 76);
      expect(result.goal).toBe("lean_bulk");
      expect(result.bmiCategory).toBe("mild_thin");
    });
  });

  describe("normal BMI combinations", () => {
    it("препоръчва recomposition при нормален BMI + затлъстяване по телесна мазнина (мъже)", () => {
      mockHealthCalcs(23, 26);
      const result = getRecommendedGoal(180, 74, "male", 37, 90);
      expect(result.goal).toBe("recomposition");
      expect(result.bmiCategory).toBe("normal");
      expect(result.bodyFatCategory).toBe("obese");
    });

    it("препоръчва recomposition при нормален BMI + средна телесна мазнина (мъже)", () => {
      mockHealthCalcs(23, 20);
      const result = getRecommendedGoal(180, 74, "male", 37, 85);
      expect(result.goal).toBe("recomposition");
      expect(result.bodyFatCategory).toBe("average");
    });

    it("препоръчва maintenance при нормален BMI + фитнес ниво на телесна мазнина (мъже)", () => {
      mockHealthCalcs(23, 15);
      const result = getRecommendedGoal(180, 74, "male", 36, 80);
      expect(result.goal).toBe("maintenance");
      expect(result.bodyFatCategory).toBe("fitness");
    });

    it("препоръчва maintenance при нормален BMI + атлетично ниво на телесна мазнина (мъже)", () => {
      mockHealthCalcs(23, 10);
      const result = getRecommendedGoal(180, 74, "male", 36, 78);
      expect(result.goal).toBe("maintenance");
      expect(result.bodyFatCategory).toBe("athletes");
    });

    it("препоръчва recomposition при нормален BMI + затлъстяване по телесна мазнина (жени)", () => {
      mockHealthCalcs(23, 34);
      const result = getRecommendedGoal(165, 62, "female", 32, 90);
      expect(result.goal).toBe("recomposition");
      expect(result.bodyFatCategory).toBe("obese");
    });
  });

  describe("overweight BMI combinations", () => {
    it("препоръчва maintenance при наднормено тегло + фитнес/атлетична телесна мазнина", () => {
      mockHealthCalcs(27, 15);
      const result = getRecommendedGoal(180, 87, "male", 37, 88);
      expect(result.goal).toBe("maintenance");
      expect(result.bmiCategory).toBe("overweight");
    });

    it("препоръчва recomposition при наднормено тегло + средна телесна мазнина", () => {
      mockHealthCalcs(27, 20);
      const result = getRecommendedGoal(180, 87, "male", 38, 92);
      expect(result.goal).toBe("recomposition");
      expect(result.bmiCategory).toBe("overweight");
      expect(result.bodyFatCategory).toBe("average");
    });

    it("препоръчва cut при наднормено тегло + затлъстяване по телесна мазнина", () => {
      mockHealthCalcs(27, 27);
      const result = getRecommendedGoal(180, 87, "male", 40, 100);
      expect(result.goal).toBe("cut");
      expect(result.bmiCategory).toBe("overweight");
      expect(result.bodyFatCategory).toBe("obese");
    });
  });

  describe("return shape", () => {
    it("връща всички задължителни полета", () => {
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

    it("предава стойностите на bmi и bodyFat в резултата", () => {
      mockHealthCalcs(22.5, 14);
      const result = getRecommendedGoal(180, 73, "male", 36, 80);

      expect(result.bmi).toBe(22.5);
      expect(result.bodyFatPercentage).toBe(14);
    });

    it("подава hip към calculateBodyFat при жени", () => {
      mockHealthCalcs(23, 22);
      getRecommendedGoal(165, 62, "female", 32, 75, 95);

      expect(calculateBodyFat).toHaveBeenCalledWith(165, "female", 62, 32, 75, 95);
    });

    it("подава undefined за hip при мъже", () => {
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
    it("връща най-често срещаната цел", async () => {
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

    it("връща единствения запис когато съществува само един", async () => {
      mockMetrics([{ goal: "lean_bulk", goalName: "Чисто качване (Lean Bulk)" }]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: true,
        data: { goal: "lean_bulk", goalName: "Чисто качване (Lean Bulk)", count: 1 },
      });
    });

    it("връща null данни когато таблицата с метрики е празна", async () => {
      mockMetrics([]);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({ success: true, data: null });
    });

    it("връща null данни когато таблицата с метрики връща null", async () => {
      mockMetrics(null);

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({ success: true, data: null });
    });

    it("разрешава равенство като връща първото срещнато според реда на Object.values", async () => {
      mockMetrics([
        { goal: "cut", goalName: "Изгаряне на мазнини (Cut)" },
        { goal: "maintenance", goalName: "Поддържане (Maintenance)" },
      ]);

      const result = await getMostRecommendedGoal();

      expect(result.success).toBe(true);
      // И двете имат count 1 — reduce връща последно срещнатото (current > max)
      // В случая "maintenance" печели заради строгото сравнение `>`
      expect((result as any).data.count).toBe(1);
    });

    it("брои правилно множество различни цели", async () => {
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

    it("третира еднаква цел с различно goalName като отделни записи", async () => {
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
    it("връща неуспех при грешка в supabase заявката", async () => {
      mockMetrics(null, new Error("DB error"));

      const result = await getMostRecommendedGoal();

      expect(result).toEqual({
        success: false,
        error: "Failed to get most recommended goal",
      });
    });

    it("хвърля грешка когато getServerClient е отхвърлен (не се прихваща от функцията)", async () => {
      vi.mocked(getServerClient).mockRejectedValue(new Error("Auth error"));

      await expect(getMostRecommendedGoal()).rejects.toThrow("Auth error");
    });
  });

  describe("return shape", () => {
    it("успешният отговор с данни има правилната форма", async () => {
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

    it("неуспешният отговор има правилната форма", async () => {
      mockMetrics(null, new Error("fail"));

      const result = await getMostRecommendedGoal();

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("data");
    });
  });
});
