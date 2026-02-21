// tests/measurements.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Next.js server client
vi.mock("@/lib/db/clients/server", () => ({
  getServerClient: vi.fn(),
}));

// Mock save functions
vi.mock("@/server/saveFunctions", () => ({
  saveUserMeasurements: vi.fn(),
  saveUserMetrics: vi.fn(),
}));

import { getServerClient } from "@/lib/db/clients/server";
import { saveUserMeasurements, saveUserMetrics } from "@/server/saveFunctions";
import { checkTodayMeasurements, saveMeasurementsAndCalculateMetrics } from "../src/server/measurements";

describe("measurements", () => {
  let mockSupabase: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn(),
      },
      from: vi.fn(),
    };

    vi.mocked(getServerClient).mockResolvedValue(mockSupabase);

    // Mock environment variable
    process.env.NEXT_PUBLIC_BASE_URL = "http://localhost:3000";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("checkTodayMeasurements", () => {
    it("returns false when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await checkTodayMeasurements();

      expect(result.success).toBe(false);
      expect(result.hasTodayMeasurement).toBe(false);
    });

    it("returns true with no measurements when none exist today", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await checkTodayMeasurements();

      expect(result.success).toBe(true);
      expect(result.hasTodayMeasurement).toBe(false);
      expect(result.data).toEqual([]);
    });

    it("returns true with measurement when one exists today", async () => {
      const today = new Date().toISOString().split("T")[0];
      const mockMeasurement = {
        id: "measurement-123",
        created_at: `${today}T10:00:00Z`,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: [mockMeasurement],
          error: null,
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await checkTodayMeasurements();

      expect(result.success).toBe(true);
      expect(result.hasTodayMeasurement).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe("measurement-123");
    });

    it("queries correct table with correct filters", async () => {
      const today = new Date().toISOString().split("T")[0];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-456" } },
        error: null,
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await checkTodayMeasurements();

      expect(mockSupabase.from).toHaveBeenCalledWith("user_measurements");
      expect(mockQuery.select).toHaveBeenCalledWith("id, created_at");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", "user-456");
      expect(mockQuery.gte).toHaveBeenCalledWith("created_at", today);
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
    });

    it("throws error when database query fails", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({
          data: null,
          error: new Error("Database error"),
        }),
      };

      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(checkTodayMeasurements()).rejects.toThrow("Database error");
    });
  });

  describe("saveMeasurementsAndCalculateMetrics", () => {
    const mockMeasurementData = {
      height: 180,
      weight: 80,
      gender: "male" as const,
      age: 25,
      activityLevel: "moderate",
      neck: 38,
      waist: 85,
      hip: 95,
    };

    beforeEach(() => {
      // Mock successful auth
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "user-123" } },
        error: null,
      });

      // Mock successful save functions
      vi.mocked(saveUserMeasurements).mockResolvedValue({ id: "measurement-123" } as any);
      vi.mocked(saveUserMetrics).mockResolvedValue(undefined as any);

      // Mock global fetch
      global.fetch = vi.fn();
    });

    it("returns error when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error("Not authenticated"),
      });

      const result = await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You must be logged in to save measurements");
    });

    it("calls all API endpoints in parallel", async () => {
      const mockFetch = vi.mocked(global.fetch);

      // Mock API responses
      mockFetch.mockImplementation((url: any) => {
        if (url.includes("/api/health/bmi")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bmi: "24.69", health: "Нормално", healthy_bmi_range: "18.5 - 25" }),
          } as Response);
        }
        if (url.includes("/api/health/body-fat")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bodyFat: 15, bodyFatMass: 12, leanBodyMass: 68 }),
          } as Response);
        }
        if (url.includes("/api/recommended-goal")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                goal: "maintenance",
                goalName: "Поддръжка",
                bmiCategory: "normal",
                bodyFatCategory: "fit",
                reasoning: "Test",
              }),
          } as Response);
        }
        if (url.includes("/api/calculate-nutrients")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                bmr: 1800,
                tdee: 2500,
                goal: { calories: 2500, macros: { protein: 150, fats: 70, carbs: 250 } },
              }),
          } as Response);
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      const result = await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it("saves measurements with correct data", async () => {
      const mockFetch = vi.mocked(global.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);

      await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(saveUserMeasurements).toHaveBeenCalledWith("user-123", mockMeasurementData);
    });

    it("saves metrics with correct calculated data", async () => {
      const mockFetch = vi.mocked(global.fetch);

      mockFetch.mockImplementation((url: any) => {
        if (url.includes("/api/health/bmi")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bmi: "24.69", health: "Нормално", healthy_bmi_range: "18.5 - 25" }),
          } as Response);
        }
        if (url.includes("/api/health/body-fat")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bodyFat: 15, bodyFatMass: 12, leanBodyMass: 68 }),
          } as Response);
        }
        if (url.includes("/api/recommended-goal")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                goal: "maintenance",
                goalName: "Поддръжка",
                bmiCategory: "normal",
                bodyFatCategory: "fit",
                reasoning: "Healthy",
              }),
          } as Response);
        }
        if (url.includes("/api/calculate-nutrients")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                bmr: 1800,
                tdee: 2500,
                goal: { calories: 2500, macros: { protein: 150, fats: 70, carbs: 250 } },
              }),
          } as Response);
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(saveUserMetrics).toHaveBeenCalledWith(
        "user-123",
        "measurement-123",
        expect.objectContaining({
          bmi: "24.69",
          health: "Нормално",
          bodyFat: 15,
          goal: "maintenance",
          bmr: 1800,
          tdee: 2500,
          calories: 2500,
          protein: 150,
          fats: 70,
          carbs: 250,
        }),
      );
    });

    it("returns error when API calls fail", async () => {
      const mockFetch = vi.mocked(global.fetch);

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const result = await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to calculate health metrics");
    });

    it("returns error when nutrients calculation fails", async () => {
      const mockFetch = vi.mocked(global.fetch);

      mockFetch.mockImplementation((url: any) => {
        if (url.includes("/api/calculate-nutrients")) {
          return Promise.resolve({ ok: false } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        } as Response);
      });

      const result = await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to calculate nutrients");
    });

    it("handles errors gracefully", async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

      const result = await saveMeasurementsAndCalculateMetrics(mockMeasurementData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network error");
    });

    it("works without hip measurement for males", async () => {
      const maleData = { ...mockMeasurementData, hip: undefined };

      const mockFetch = vi.mocked(global.fetch);

      // Properly mock all API responses (same as in other tests)
      mockFetch.mockImplementation((url: any) => {
        if (url.includes("/api/health/bmi")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bmi: "24.69", health: "Нормално", healthy_bmi_range: "18.5 - 25" }),
          } as Response);
        }
        if (url.includes("/api/health/body-fat")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ bodyFat: 15, bodyFatMass: 12, leanBodyMass: 68 }),
          } as Response);
        }
        if (url.includes("/api/recommended-goal")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                goal: "maintenance",
                goalName: "Поддръжка",
                bmiCategory: "normal",
                bodyFatCategory: "fit",
                reasoning: "Test",
              }),
          } as Response);
        }
        if (url.includes("/api/calculate-nutrients")) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                bmr: 1800,
                tdee: 2500,
                goal: { calories: 2500, macros: { protein: 150, fats: 70, carbs: 250 } },
              }),
          } as Response);
        }
        return Promise.reject(new Error("Unknown endpoint"));
      });

      const result = await saveMeasurementsAndCalculateMetrics(maleData);

      expect(result.success).toBe(true);
    });
  });
});
