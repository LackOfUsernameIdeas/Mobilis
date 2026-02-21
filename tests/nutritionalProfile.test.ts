import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock-ът ТРЯБВА да е преди другите импорти
vi.mock("@/lib/db/clients/server", () => ({
  getServerClient: vi.fn(),
}));

import { getServerClient } from "@/lib/db/clients/server";
import { getAverageNutritionalProfile } from "@/server/nutritionalProfile";

describe("getAverageNutritionalProfile", () => {
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(),
    };

    vi.mocked(getServerClient).mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  function mockFromChain(nutritionResult: { data: any; error: any }, metricsResult: { data: any; error: any }) {
    mockSupabase.from.mockImplementation((table: string) => {
      const result = table === "nutrition_user_preferences" ? nutritionResult : metricsResult;
      return { select: vi.fn().mockResolvedValue(result) };
    });
  }

  describe("successful calculations", () => {
    it("връща осреднени стойности от двете таблици комбинирано", async () => {
      mockFromChain(
        { data: [{ calories: 2000, protein: 150, fats: 70, carbs: 250 }], error: null },
        { data: [{ calories: 1800, protein: 130, fats: 60, carbs: 220 }], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: {
          calories: 1900,
          protein: 140,
          fats: 65,
          carbs: 235,
        },
      });
    });

    it("връща нули когато двете таблици са празни", async () => {
      mockFromChain({ data: [], error: null }, { data: [], error: null });

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 0, protein: 0, fats: 0, carbs: 0 },
      });
    });

    it("връща нули когато двете таблици връщат null", async () => {
      mockFromChain({ data: null, error: null }, { data: null, error: null });

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 0, protein: 0, fats: 0, carbs: 0 },
      });
    });

    it("изчислява правилно само с данни от nutrition_user_preferences", async () => {
      mockFromChain(
        { data: [{ calories: 2000, protein: 100, fats: 80, carbs: 200 }], error: null },
        { data: [], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 2000, protein: 100, fats: 80, carbs: 200 },
      });
    });

    it("изчислява правилно само с данни от user_metrics", async () => {
      mockFromChain(
        { data: [], error: null },
        { data: [{ calories: 1500, protein: 90, fats: 50, carbs: 180 }], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 1500, protein: 90, fats: 50, carbs: 180 },
      });
    });

    it("закръгля средните стойности до най-близкото цяло число", async () => {
      mockFromChain(
        { data: [{ calories: 2000, protein: 100, fats: 70, carbs: 200 }], error: null },
        {
          data: [
            { calories: 1000, protein: 101, fats: 71, carbs: 201 },
            { calories: 1500, protein: 102, fats: 72, carbs: 202 },
          ],
          error: null,
        },
      );

      // 3 записа: средно calories = (2000+1000+1500)/3 = 1500, protein = 303/3 = 101, fats = 213/3 = 71, carbs = 603/3 = 201
      const result = await getAverageNutritionalProfile();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ calories: 1500, protein: 101, fats: 71, carbs: 201 });
    });

    it("третира null стойности на полета като 0", async () => {
      mockFromChain(
        { data: [{ calories: null, protein: null, fats: null, carbs: null }], error: null },
        { data: [{ calories: 2000, protein: 100, fats: 80, carbs: 200 }], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 1000, protein: 50, fats: 40, carbs: 100 },
      });
    });

    it("обработва множество записи от двете таблици", async () => {
      mockFromChain(
        {
          data: [
            { calories: 1000, protein: 50, fats: 30, carbs: 100 },
            { calories: 2000, protein: 100, fats: 60, carbs: 200 },
          ],
          error: null,
        },
        {
          data: [
            { calories: 3000, protein: 150, fats: 90, carbs: 300 },
            { calories: 4000, protein: 200, fats: 120, carbs: 400 },
          ],
          error: null,
        },
      );

      // Средно на [1000, 2000, 3000, 4000] = 2500 и т.н.
      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: true,
        data: { calories: 2500, protein: 125, fats: 75, carbs: 250 },
      });
    });
  });

  describe("error handling", () => {
    it("връща неуспех при грешка в заявката към nutrition_user_preferences", async () => {
      const dbError = new Error("DB connection failed");
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "nutrition_user_preferences") {
          return { select: vi.fn().mockResolvedValue({ data: null, error: dbError }) };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      });

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: false,
        error: "Failed to calculate average nutritional profile",
      });
    });

    it("връща неуспех при грешка в заявката към user_metrics", async () => {
      const dbError = new Error("Timeout");
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "user_metrics") {
          return { select: vi.fn().mockResolvedValue({ data: null, error: dbError }) };
        }
        return { select: vi.fn().mockResolvedValue({ data: [], error: null }) };
      });

      const result = await getAverageNutritionalProfile();

      expect(result).toEqual({
        success: false,
        error: "Failed to calculate average nutritional profile",
      });
    });

    it("хвърля грешка когато getServerClient хвърли (грешката не се прихваща от функцията)", async () => {
      vi.mocked(getServerClient).mockRejectedValue(new Error("Auth error"));

      await expect(getAverageNutritionalProfile()).rejects.toThrow("Auth error");
    });

    it("не продължава към заявката за user_metrics ако nutrition_user_preferences е неуспешна", async () => {
      const metricSelect = vi.fn().mockResolvedValue({ data: [], error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === "nutrition_user_preferences") {
          return { select: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }) };
        }
        return { select: metricSelect };
      });

      await getAverageNutritionalProfile();

      expect(metricSelect).not.toHaveBeenCalled();
    });
  });

  describe("return shape", () => {
    it("успешният отговор има правилната форма", async () => {
      mockFromChain(
        { data: [{ calories: 2000, protein: 150, fats: 70, carbs: 250 }], error: null },
        { data: [], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("calories");
      expect(result.data).toHaveProperty("protein");
      expect(result.data).toHaveProperty("fats");
      expect(result.data).toHaveProperty("carbs");
    });

    it("неуспешният отговор има правилната форма", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn().mockResolvedValue({ data: null, error: new Error("fail") }),
      }));

      const result = await getAverageNutritionalProfile();

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("data");
    });

    it("всички числови полета са цели числа (закръглени)", async () => {
      mockFromChain(
        { data: [{ calories: 1999, protein: 149, fats: 69, carbs: 249 }], error: null },
        { data: [{ calories: 2000, protein: 150, fats: 70, carbs: 250 }], error: null },
      );

      const result = await getAverageNutritionalProfile();

      expect(result.success).toBe(true);
      const { calories, protein, fats, carbs } = result.data!;
      expect(Number.isInteger(calories)).toBe(true);
      expect(Number.isInteger(protein)).toBe(true);
      expect(Number.isInteger(fats)).toBe(true);
      expect(Number.isInteger(carbs)).toBe(true);
    });
  });
});
