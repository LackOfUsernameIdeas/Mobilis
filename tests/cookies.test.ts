import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock-ът ТРЯБВА да е преди другите импорти
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import { getValueFromCookie, setValueToCookie, getPreference } from "@/server/cookies";

describe("cookies", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    // Създава нов mock cookie store преди всеки тест
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue(mockCookieStore);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getValueFromCookie", () => {
    it("returns cookie value when cookie exists", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-value" });

      const result = await getValueFromCookie("test-key");

      expect(result).toBe("test-value");
      expect(mockCookieStore.get).toHaveBeenCalledWith("test-key");
    });

    it("returns undefined when cookie does not exist", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getValueFromCookie("non-existent-key");

      expect(result).toBeUndefined();
      expect(mockCookieStore.get).toHaveBeenCalledWith("non-existent-key");
    });

    it("returns undefined when cookie value is undefined", async () => {
      mockCookieStore.get.mockReturnValue({ value: undefined });

      const result = await getValueFromCookie("test-key");

      expect(result).toBeUndefined();
    });

    it("handles empty string value", async () => {
      mockCookieStore.get.mockReturnValue({ value: "" });

      const result = await getValueFromCookie("empty-key");

      expect(result).toBe("");
    });
  });

  describe("setValueToCookie", () => {
    it("sets cookie with default options", async () => {
      await setValueToCookie("test-key", "test-value");

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 дни в секунди
      });
    });

    it("sets cookie with custom path", async () => {
      await setValueToCookie("test-key", "test-value", { path: "/dashboard" });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/dashboard",
        maxAge: 60 * 60 * 24 * 7,
      });
    });

    it("sets cookie with custom maxAge", async () => {
      const oneHour = 60 * 60;
      await setValueToCookie("test-key", "test-value", { maxAge: oneHour });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/",
        maxAge: oneHour,
      });
    });

    it("sets cookie with both custom path and maxAge", async () => {
      await setValueToCookie("test-key", "test-value", {
        path: "/admin",
        maxAge: 3600,
      });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/admin",
        maxAge: 3600,
      });
    });

    it("handles empty string value", async () => {
      await setValueToCookie("test-key", "");

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    });

    it("handles special characters in value", async () => {
      const specialValue = "value with spaces & symbols!@#";
      await setValueToCookie("test-key", specialValue);

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", specialValue, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    });
  });

  describe("getPreference", () => {
    const allowedThemes = ["light", "dark", "system"] as const;
    const allowedSizes = ["small", "medium", "large"] as const;

    it("returns valid preference value", async () => {
      mockCookieStore.get.mockReturnValue({ value: "dark" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("dark");
      expect(mockCookieStore.get).toHaveBeenCalledWith("theme");
    });

    it("returns fallback when cookie does not exist", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("returns fallback when value is not in allowed list", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid-theme" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("trims whitespace from cookie value", async () => {
      mockCookieStore.get.mockReturnValue({ value: "  dark  " });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("dark");
    });

    it("returns fallback for empty string", async () => {
      mockCookieStore.get.mockReturnValue({ value: "" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("returns fallback for whitespace-only string", async () => {
      mockCookieStore.get.mockReturnValue({ value: "   " });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("handles different allowed value types", async () => {
      mockCookieStore.get.mockReturnValue({ value: "medium" });

      const result = await getPreference("size", allowedSizes, "small");

      expect(result).toBe("medium");
    });

    it("is case-sensitive", async () => {
      mockCookieStore.get.mockReturnValue({ value: "Dark" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light"); // Трябва да върне fallback, защото "Dark" !== "dark"
    });
  });

  describe("Integration scenarios", () => {
    it("set and get preference workflow", async () => {
      // Записва предпочитание
      await setValueToCookie("user_theme", "dark");

      // Симулира прочитането му
      mockCookieStore.get.mockReturnValue({ value: "dark" });

      const result = await getPreference("user_theme", ["light", "dark", "system"] as const, "light");

      expect(result).toBe("dark");
    });

    it("handles preference migration (invalid old value)", async () => {
      // Старото cookie съдържа невалидна стойност
      mockCookieStore.get.mockReturnValue({ value: "blue-theme" }); // стар формат

      const result = await getPreference("theme", ["light", "dark", "system"] as const, "system");

      expect(result).toBe("system"); // Връща новата стойност по подразбиране
    });

    it("handles cookie with maxAge of 0 (session cookie)", async () => {
      await setValueToCookie("temp-data", "value", { maxAge: 0 });

      expect(mockCookieStore.set).toHaveBeenCalledWith("temp-data", "value", {
        path: "/",
        maxAge: 0,
      });
    });
  });

  describe("Edge cases", () => {
    it("handles very long cookie values", async () => {
      const longValue = "a".repeat(4000);
      mockCookieStore.get.mockReturnValue({ value: longValue });

      const result = await getValueFromCookie("long-key");

      expect(result).toBe(longValue);
    });

    it("handles unicode characters", async () => {
      const unicodeValue = "你好世界 🌍 Здравей";
      mockCookieStore.get.mockReturnValue({ value: unicodeValue });

      const result = await getValueFromCookie("unicode-key");

      expect(result).toBe(unicodeValue);
    });

    it("handles numeric strings in preferences", async () => {
      mockCookieStore.get.mockReturnValue({ value: "1" });

      const result = await getPreference("setting", ["1", "2", "3"] as const, "1");

      expect(result).toBe("1");
    });

    it("handles preference with single allowed value", async () => {
      mockCookieStore.get.mockReturnValue({ value: "only-option" });

      const result = await getPreference("single", ["only-option"] as const, "only-option");

      expect(result).toBe("only-option");
    });
  });
});
