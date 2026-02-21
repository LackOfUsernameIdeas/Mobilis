import { describe, it, expect } from "vitest";
import { calculateCalorieRecommendation, type ActivityLevel, type FitnessGoal } from "@/server/calorieCalculator";

describe("calculateCalorieRecommendation", () => {
  // Тестов субект: 25-годишен мъж, 80кг, 180см
  const baseParams = {
    weight: 80,
    height: 180,
    age: 25,
    gender: "male" as const,
  };

  describe("BMR calculation", () => {
    it("calculates correct BMR for male", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        "male",
        "sedentary",
        "maintenance",
      );

      // BMR = 10*80 + 6.25*180 - 5*25 + 5 = 800 + 1125 - 125 + 5 = 1805
      expect(result.bmr).toBe(1805);
    });

    it("calculates correct BMR for female", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        "female",
        "sedentary",
        "maintenance",
      );

      // BMR = 10*80 + 6.25*180 - 5*25 - 161 = 800 + 1125 - 125 - 161 = 1639
      expect(result.bmr).toBe(1639);
    });

    it("adjusts BMR with age", () => {
      const young = calculateCalorieRecommendation(20, 180, 20, "male", "sedentary", "maintenance");
      const old = calculateCalorieRecommendation(20, 180, 60, "male", "sedentary", "maintenance");

      // По-възрастният човек трябва да има по-нисък BMR (разлика от 5 кал/година)
      expect(young.bmr).toBeGreaterThan(old.bmr);
      expect(young.bmr - old.bmr).toBe(200); // 40 години * 5 кал/година
    });
  });

  describe("TDEE calculation", () => {
    it("calculates TDEE for sedentary lifestyle", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "sedentary",
        "maintenance",
      );

      // TDEE = BMR * 1.2 = 1805 * 1.2 = 2166
      expect(result.tdee).toBe(2166);
    });

    it("calculates TDEE for very active lifestyle", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "very_active",
        "maintenance",
      );

      // TDEE = BMR * 1.9 = 1805 * 1.9 = 3430
      expect(result.tdee).toBe(3430);
    });

    it("increases TDEE with higher activity levels", () => {
      const activityLevels: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
      const tdees = activityLevels.map(
        (level) =>
          calculateCalorieRecommendation(
            baseParams.weight,
            baseParams.height,
            baseParams.age,
            baseParams.gender,
            level,
            "maintenance",
          ).tdee,
      );

      // Всяко ниво на активност трябва да има по-висок TDEE от предишното
      for (let i = 1; i < tdees.length; i++) {
        expect(tdees[i]).toBeGreaterThan(tdees[i - 1]);
      }
    });
  });

  describe("Goal calorie adjustments", () => {
    it("reduces calories for cut goal", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "cut",
      );

      // Изгаряне = TDEE - 500
      expect(result.goal.calories).toBe(result.tdee - 500);
    });

    it("reduces more calories for aggressive cut", () => {
      const cut = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "cut",
      );
      const aggCut = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "aggressive_cut",
      );

      expect(aggCut.goal.calories).toBeLessThan(cut.goal.calories);
      expect(cut.goal.calories - aggCut.goal.calories).toBe(250); // -500 срещу -750
    });

    it("adds calories for lean bulk goal", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "lean_bulk",
      );

      expect(result.goal.calories).toBe(result.tdee + 300);
    });

    it("adds more calories for dirty bulk", () => {
      const leanBulk = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "lean_bulk",
      );
      const dirtyBulk = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "dirty_bulk",
      );

      expect(dirtyBulk.goal.calories).toBeGreaterThan(leanBulk.goal.calories);
    });

    it("maintains TDEE for maintenance goal", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "maintenance",
      );

      expect(result.goal.calories).toBe(result.tdee);
    });
  });

  describe("Macro calculations", () => {
    it("calculates high protein for cut", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "cut",
      );

      const { protein, fats, carbs } = result.goal.macros;

      // Протеинът трябва да е 40% от калориите (най-висок макрос)
      expect(protein).toBeGreaterThan(fats);
      expect(protein).toBeGreaterThan(carbs);

      // Проверка на приблизителните проценти (с толеранс за закръгляване)
      const proteinCals = protein * 4;
      const proteinPercent = proteinCals / result.goal.calories;
      expect(proteinPercent).toBeCloseTo(0.4, 1);
    });

    it("calculates high carbs for lean bulk", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "lean_bulk",
      );

      const { protein, fats, carbs } = result.goal.macros;

      // Въглехидратите трябва да са най-високи при качване (45%)
      expect(carbs).toBeGreaterThan(protein);
      expect(carbs).toBeGreaterThan(fats);
    });

    it("ensures all macros are positive integers", () => {
      const goals: FitnessGoal[] = ["cut", "lean_bulk", "maintenance", "aggressive_cut"];

      goals.forEach((goal) => {
        const result = calculateCalorieRecommendation(
          baseParams.weight,
          baseParams.height,
          baseParams.age,
          baseParams.gender,
          "moderate",
          goal,
        );

        expect(result.goal.macros.protein).toBeGreaterThan(0);
        expect(result.goal.macros.fats).toBeGreaterThan(0);
        expect(result.goal.macros.carbs).toBeGreaterThan(0);

        expect(Number.isInteger(result.goal.macros.protein)).toBe(true);
        expect(Number.isInteger(result.goal.macros.fats)).toBe(true);
        expect(Number.isInteger(result.goal.macros.carbs)).toBe(true);
      });
    });

    it("macros add up approximately to total calories", () => {
      const result = calculateCalorieRecommendation(
        baseParams.weight,
        baseParams.height,
        baseParams.age,
        baseParams.gender,
        "moderate",
        "cut",
      );

      const { protein, fats, carbs } = result.goal.macros;
      const totalCalories = protein * 4 + fats * 9 + carbs * 4;

      // Допускане на ±5% отклонение поради закръгляване
      const variance = Math.abs(totalCalories - result.goal.calories);
      const allowedVariance = result.goal.calories * 0.05;

      expect(variance).toBeLessThanOrEqual(allowedVariance);
    });
  });

  describe("Edge cases", () => {
    it("handles very low weight", () => {
      const result = calculateCalorieRecommendation(50, 160, 25, "female", "sedentary", "maintenance");

      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThan(result.bmr);
      expect(result.goal.calories).toBeGreaterThan(0);
    });

    it("handles very high weight", () => {
      const result = calculateCalorieRecommendation(150, 200, 30, "male", "very_active", "dirty_bulk");

      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThan(result.bmr);
      expect(result.goal.calories).toBeGreaterThan(result.tdee);
    });

    it("handles elderly age", () => {
      const result = calculateCalorieRecommendation(70, 170, 80, "male", "light", "maintenance");

      expect(result.bmr).toBeGreaterThan(0);
      expect(result.tdee).toBeGreaterThan(result.bmr);
    });

    it("returns rounded integer values", () => {
      // Проверка, че резултатите са закръглени цели числа
      const result = calculateCalorieRecommendation(75.5, 182.3, 28, "male", "moderate", "cut");

      expect(Number.isInteger(result.bmr)).toBe(true);
      expect(Number.isInteger(result.tdee)).toBe(true);
      expect(Number.isInteger(result.goal.calories)).toBe(true);
    });
  });

  describe("Real-world scenarios", () => {
    it("typical office worker wanting to lose weight", () => {
      // Типичен служител на бюро, който иска да свали тегло
      const result = calculateCalorieRecommendation(
        85, // леко наднормено тегло
        175,
        35,
        "male",
        "sedentary",
        "cut",
      );

      expect(result.goal.calories).toBeLessThan(result.tdee);
      expect(result.goal.calories).toBeGreaterThan(1500); // Не прекалено агресивно
      expect(result.goal.macros.protein).toBeGreaterThan(100); // Достатъчно протеин
    });

    it("young athlete wanting to gain muscle", () => {
      // Млад спортист, който иска да качи мускулна маса
      const result = calculateCalorieRecommendation(70, 180, 20, "male", "very_active", "lean_bulk");

      expect(result.goal.calories).toBeGreaterThan(result.tdee);
      expect(result.goal.calories).toBeGreaterThan(2500);
      expect(result.goal.macros.carbs).toBeGreaterThan(result.goal.macros.protein);
    });

    it("woman on recomposition journey", () => {
      // Жена в процес на рекомпозиция на тялото
      const result = calculateCalorieRecommendation(65, 165, 28, "female", "moderate", "recomposition");

      expect(result.goal.calories).toBeLessThan(result.tdee);
      expect(result.goal.calories).toBe(result.tdee - 200); // Рекомпозиция = -200 кал
      expect(result.goal.macros.protein).toBeGreaterThan(80); // Висок протеин за рекомпозиция
    });
  });
});
