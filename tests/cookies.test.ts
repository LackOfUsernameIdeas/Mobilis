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
    it("връща стойността на cookie когато то съществува", async () => {
      mockCookieStore.get.mockReturnValue({ value: "test-value" });

      const result = await getValueFromCookie("test-key");

      expect(result).toBe("test-value");
      expect(mockCookieStore.get).toHaveBeenCalledWith("test-key");
    });

    it("връща undefined когато cookie не съществува", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getValueFromCookie("non-existent-key");

      expect(result).toBeUndefined();
      expect(mockCookieStore.get).toHaveBeenCalledWith("non-existent-key");
    });

    it("връща undefined когато стойността на cookie е undefined", async () => {
      mockCookieStore.get.mockReturnValue({ value: undefined });

      const result = await getValueFromCookie("test-key");

      expect(result).toBeUndefined();
    });

    it("обработва празен низ като стойност", async () => {
      mockCookieStore.get.mockReturnValue({ value: "" });

      const result = await getValueFromCookie("empty-key");

      expect(result).toBe("");
    });
  });

  describe("setValueToCookie", () => {
    it("записва cookie с настройките по подразбиране", async () => {
      await setValueToCookie("test-key", "test-value");

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 дни в секунди
      });
    });

    it("записва cookie с персонализиран path", async () => {
      await setValueToCookie("test-key", "test-value", { path: "/dashboard" });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/dashboard",
        maxAge: 60 * 60 * 24 * 7,
      });
    });

    it("записва cookie с персонализиран maxAge", async () => {
      const oneHour = 60 * 60;
      await setValueToCookie("test-key", "test-value", { maxAge: oneHour });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/",
        maxAge: oneHour,
      });
    });

    it("записва cookie с персонализирани path и maxAge", async () => {
      await setValueToCookie("test-key", "test-value", {
        path: "/admin",
        maxAge: 3600,
      });

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "test-value", {
        path: "/admin",
        maxAge: 3600,
      });
    });

    it("обработва празен низ като стойност", async () => {
      await setValueToCookie("test-key", "");

      expect(mockCookieStore.set).toHaveBeenCalledWith("test-key", "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    });

    it("обработва специални символи в стойността", async () => {
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

    it("връща валидна стойност на предпочитание", async () => {
      mockCookieStore.get.mockReturnValue({ value: "dark" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("dark");
      expect(mockCookieStore.get).toHaveBeenCalledWith("theme");
    });

    it("връща стойността по подразбиране когато cookie не съществува", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("връща стойността по подразбиране когато стойността не е в позволения списък", async () => {
      mockCookieStore.get.mockReturnValue({ value: "invalid-theme" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("премахва интервалите от началото и края на стойността", async () => {
      mockCookieStore.get.mockReturnValue({ value: "  dark  " });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("dark");
    });

    it("връща стойността по подразбиране за празен низ", async () => {
      mockCookieStore.get.mockReturnValue({ value: "" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("връща стойността по подразбиране за низ само с интервали", async () => {
      mockCookieStore.get.mockReturnValue({ value: "   " });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light");
    });

    it("обработва различни типове позволени стойности", async () => {
      mockCookieStore.get.mockReturnValue({ value: "medium" });

      const result = await getPreference("size", allowedSizes, "small");

      expect(result).toBe("medium");
    });

    it("прави разлика между главни и малки букви", async () => {
      mockCookieStore.get.mockReturnValue({ value: "Dark" });

      const result = await getPreference("theme", allowedThemes, "light");

      expect(result).toBe("light"); // Трябва да върне fallback, защото "Dark" !== "dark"
    });
  });

  describe("Integration scenarios", () => {
    it("работен поток за записване и четене на предпочитание", async () => {
      // Записва предпочитание
      await setValueToCookie("user_theme", "dark");

      // Симулира прочитането му
      mockCookieStore.get.mockReturnValue({ value: "dark" });

      const result = await getPreference("user_theme", ["light", "dark", "system"] as const, "light");

      expect(result).toBe("dark");
    });

    it("обработва миграция на предпочитание (невалидна стара стойност)", async () => {
      // Старото cookie съдържа невалидна стойност
      mockCookieStore.get.mockReturnValue({ value: "blue-theme" }); // стар формат

      const result = await getPreference("theme", ["light", "dark", "system"] as const, "system");

      expect(result).toBe("system"); // Връща новата стойност по подразбиране
    });

    it("обработва cookie с maxAge равен на 0 (сесийно cookie)", async () => {
      await setValueToCookie("temp-data", "value", { maxAge: 0 });

      expect(mockCookieStore.set).toHaveBeenCalledWith("temp-data", "value", {
        path: "/",
        maxAge: 0,
      });
    });
  });

  describe("Edge cases", () => {
    it("обработва много дълги стойности на cookie", async () => {
      const longValue = "a".repeat(4000);
      mockCookieStore.get.mockReturnValue({ value: longValue });

      const result = await getValueFromCookie("long-key");

      expect(result).toBe(longValue);
    });

    it("обработва unicode символи", async () => {
      const unicodeValue = "你好世界 🌍 Здравей";
      mockCookieStore.get.mockReturnValue({ value: unicodeValue });

      const result = await getValueFromCookie("unicode-key");

      expect(result).toBe(unicodeValue);
    });

    it("обработва числови низове в предпочитания", async () => {
      mockCookieStore.get.mockReturnValue({ value: "1" });

      const result = await getPreference("setting", ["1", "2", "3"] as const, "1");

      expect(result).toBe("1");
    });

    it("обработва предпочитание с единствена позволена стойност", async () => {
      mockCookieStore.get.mockReturnValue({ value: "only-option" });

      const result = await getPreference("single", ["only-option"] as const, "only-option");

      expect(result).toBe("only-option");
    });
  });
});
