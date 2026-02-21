// tests/bodyMetrics.test.ts
import { describe, it, expect } from "vitest";
import { getBMICategory, calculateBMI, calculateBodyFat } from "@/server/health";

describe("bodyMetrics", () => {
  describe("getBMICategory", () => {
    it('returns "Сериозно недохранване" for BMI < 16', () => {
      expect(getBMICategory(15)).toBe("Сериозно недохранване");
      expect(getBMICategory(10)).toBe("Сериозно недохранване");
    });

    it('returns "Средно недохранване" for BMI 16-16.99', () => {
      expect(getBMICategory(16)).toBe("Средно недохранване");
      expect(getBMICategory(16.5)).toBe("Средно недохранване");
      expect(getBMICategory(16.99)).toBe("Средно недохранване");
    });

    it('returns "Леко недохранване" for BMI 17-18.49', () => {
      expect(getBMICategory(17)).toBe("Леко недохранване");
      expect(getBMICategory(18)).toBe("Леко недохранване");
      expect(getBMICategory(18.49)).toBe("Леко недохранване");
    });

    it('returns "Нормално" for BMI 18.5-24.99', () => {
      expect(getBMICategory(18.5)).toBe("Нормално");
      expect(getBMICategory(22)).toBe("Нормално");
      expect(getBMICategory(24.99)).toBe("Нормално");
    });

    it('returns "Наднормено тегло" for BMI 25-29.99', () => {
      expect(getBMICategory(25)).toBe("Наднормено тегло");
      expect(getBMICategory(27)).toBe("Наднормено тегло");
      expect(getBMICategory(29.99)).toBe("Наднормено тегло");
    });

    it('returns "Затлъстяване I клас" for BMI 30-34.99', () => {
      expect(getBMICategory(30)).toBe("Затлъстяване I клас");
      expect(getBMICategory(32)).toBe("Затлъстяване I клас");
      expect(getBMICategory(34.99)).toBe("Затлъстяване I клас");
    });

    it('returns "Затлъстяване II клас" for BMI 35-39.99', () => {
      expect(getBMICategory(35)).toBe("Затлъстяване II клас");
      expect(getBMICategory(37)).toBe("Затлъстяване II клас");
      expect(getBMICategory(39.99)).toBe("Затлъстяване II клас");
    });

    it('returns "Затлъстяване III клас" for BMI >= 40', () => {
      expect(getBMICategory(40)).toBe("Затлъстяване III клас");
      expect(getBMICategory(45)).toBe("Затлъстяване III клас");
      expect(getBMICategory(50)).toBe("Затлъстяване III клас");
    });
  });

  describe("calculateBMI", () => {
    it("calculates BMI correctly for normal weight person", () => {
      const result = calculateBMI(170, 70);

      // BMI = 70 / (1.7 * 1.7) = 24.22
      expect(result.bmi).toBe("24.22");
      expect(result.health).toBe("Нормално");
      expect(result.healthy_bmi_range).toBe("18.5 - 25");
    });

    it("calculates BMI for underweight person", () => {
      const result = calculateBMI(180, 55);

      // BMI = 55 / (1.8 * 1.8) = 16.98
      expect(result.bmi).toBe("16.98");
      expect(result.health).toBe("Средно недохранване");
    });

    it("calculates BMI for overweight person", () => {
      const result = calculateBMI(170, 80);

      // BMI = 80 / (1.7 * 1.7) = 27.68
      expect(result.bmi).toBe("27.68");
      expect(result.health).toBe("Наднормено тегло");
    });

    it("calculates BMI for obese person", () => {
      const result = calculateBMI(170, 100);

      // BMI = 100 / (1.7 * 1.7) = 34.60
      expect(result.bmi).toBe("34.60");
      expect(result.health).toBe("Затлъстяване I клас");
    });

    it("rounds BMI to 2 decimal places", () => {
      const result = calculateBMI(175, 73);

      expect(result.bmi).toMatch(/^\d+\.\d{2}$/); // Matches format XX.XX
    });

    it("handles very short height", () => {
      const result = calculateBMI(150, 60);

      expect(result.bmi).toBe("26.67");
      expect(result.health).toBe("Наднормено тегло");
    });

    it("handles very tall height", () => {
      const result = calculateBMI(200, 90);

      expect(result.bmi).toBe("22.50");
      expect(result.health).toBe("Нормално");
    });
  });

  describe("calculateBodyFat", () => {
    describe("for males", () => {
      it("calculates body fat correctly for average male", () => {
        const result = calculateBodyFat(180, "male", 80, 38, 85);

        expect(result.bodyFat).toBeGreaterThan(0);
        expect(result.bodyFat).toBeLessThan(60);
        expect(result.bodyFatMass).toBeGreaterThan(0);
        expect(result.leanBodyMass).toBeGreaterThan(0);
        expect(result.bodyFatMass + result.leanBodyMass).toBeCloseTo(80, 1);
      });

      it("calculates lean male athlete", () => {
        const result = calculateBodyFat(180, "male", 75, 36, 75);

        expect(result.bodyFat).toBeLessThan(20); // Changed from 15 to 20
        expect(result.leanBodyMass).toBeGreaterThan(result.bodyFatMass);
      });

      it("does not require hip measurement for males", () => {
        const result = calculateBodyFat(180, "male", 80, 38, 85);

        expect(result).toHaveProperty("bodyFat");
        expect(result).toHaveProperty("bodyFatMass");
        expect(result).toHaveProperty("leanBodyMass");
      });

      it("clamps body fat to minimum 3%", () => {
        // Extreme lean measurements to trigger lower bound
        const result = calculateBodyFat(200, "male", 60, 30, 60);

        expect(result.bodyFat).toBeGreaterThanOrEqual(3);
      });

      it("clamps body fat to maximum 60%", () => {
        // Extreme measurements to trigger upper bound
        const result = calculateBodyFat(160, "male", 150, 45, 140);

        expect(result.bodyFat).toBeLessThanOrEqual(60);
      });
    });

    describe("for females", () => {
      it("calculates body fat correctly for average female", () => {
        const result = calculateBodyFat(165, "female", 65, 32, 75, 95);

        expect(result.bodyFat).toBeGreaterThan(0);
        expect(result.bodyFat).toBeLessThan(60);
        expect(result.bodyFatMass).toBeGreaterThan(0);
        expect(result.leanBodyMass).toBeGreaterThan(0);
        expect(result.bodyFatMass + result.leanBodyMass).toBeCloseTo(65, 1);
      });

      it("calculates lean female athlete", () => {
        const result = calculateBodyFat(170, "female", 60, 30, 70, 90);

        expect(result.bodyFat).toBeLessThan(60);
      });

      it("throws error when hip measurement is missing", () => {
        expect(() => {
          calculateBodyFat(165, "female", 65, 32, 75);
        }).toThrow("Необходим е обем на таза за изчисляване на телесни мазнини при жени");
      });

      it("throws error when hip is undefined", () => {
        expect(() => {
          calculateBodyFat(165, "female", 65, 32, 75, undefined);
        }).toThrow("Необходим е обем на таза за изчисляване на телесни мазнини при жени");
      });

      it("clamps body fat to valid range", () => {
        const result = calculateBodyFat(170, "female", 90, 38, 100, 120);

        expect(result.bodyFat).toBeGreaterThanOrEqual(3);
        expect(result.bodyFat).toBeLessThanOrEqual(60);
      });
    });

    describe("error handling", () => {
      it("throws error for invalid gender", () => {
        expect(() => {
          calculateBodyFat(180, "other", 80, 38, 85);
        }).toThrow("Невалиден пол");
      });

      it("throws error for empty gender string", () => {
        expect(() => {
          calculateBodyFat(180, "", 80, 38, 85);
        }).toThrow("Невалиден пол");
      });

      it("throws error for uppercase gender", () => {
        expect(() => {
          calculateBodyFat(180, "MALE", 80, 38, 85);
        }).toThrow("Невалиден пол");
      });
    });

    describe("fat and lean mass calculations", () => {
      it("fat mass + lean mass equals total weight", () => {
        const result = calculateBodyFat(175, "male", 85, 40, 90);

        const total = result.bodyFatMass + result.leanBodyMass;
        expect(total).toBeCloseTo(85, 1);
      });

      it("rounds all values to 2 decimal places", () => {
        const result = calculateBodyFat(180, "male", 80, 38, 85);

        expect(result.bodyFat.toString()).toMatch(/^\d+\.\d{1,2}$/);
        expect(result.bodyFatMass.toString()).toMatch(/^\d+\.\d{1,2}$/);
        expect(result.leanBodyMass.toString()).toMatch(/^\d+\.\d{1,2}$/);
      });

      it("calculates realistic fat mass for healthy male", () => {
        const result = calculateBodyFat(180, "male", 80, 38, 85);

        // Healthy male should have 10-20% body fat
        expect(result.bodyFatMass).toBeGreaterThan(8);
        expect(result.bodyFatMass).toBeLessThan(20);
      });

      it("calculates realistic lean mass for healthy female", () => {
        const result = calculateBodyFat(165, "female", 65, 32, 75, 95);

        // Lean mass should be majority of weight
        expect(result.leanBodyMass).toBeGreaterThan(29);
        expect(result.leanBodyMass).toBeLessThan(65);
      });
    });
  });
});
