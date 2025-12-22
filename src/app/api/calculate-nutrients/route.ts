import { NextRequest, NextResponse } from "next/server";
import { calculateCalorieRecommendation, type ActivityLevel } from "@/server/calorieCalculator";

export async function POST(req: NextRequest) {
  try {
    const { height, weight, age, gender, activityLevel, goal } = await req.json();

    // Валидация на задължителни полета
    if (!height || !weight || !age || !gender) {
      return NextResponse.json({ error: "Липсват задължителни полета: height, weight, age, gender" }, { status: 400 });
    }

    // Валидация на пол
    if (gender !== "male" && gender !== "female") {
      return NextResponse.json({ error: "Невалиден пол. Трябва да бъде 'male' или 'female'" }, { status: 400 });
    }

    // Валидация на възраст
    if (age < 15 || age > 100) {
      return NextResponse.json({ error: "Невалидна възраст. Трябва да бъде между 15 и 100 години" }, { status: 400 });
    }

    // Валидация на ниво на активност
    const validActivityLevels: ActivityLevel[] = ["sedentary", "light", "moderate", "active", "very_active"];
    const activity: ActivityLevel = activityLevel || "moderate";

    if (!validActivityLevels.includes(activity)) {
      return NextResponse.json(
        {
          error: "Невалидно ниво на активност",
          validLevels: validActivityLevels,
        },
        { status: 400 },
      );
    }

    // Валидация на цел (опционална)
    const validGoals = ["cut", "lean_bulk", "dirty_bulk", "recomposition", "maintenance", "aesthetic", "strength"];
    const fitnessGoal = goal || "maintenance";

    if (!validGoals.includes(fitnessGoal)) {
      return NextResponse.json(
        {
          error: "Невалидна цел",
          validGoals,
        },
        { status: 400 },
      );
    }

    // Изчисляване на калории
    const calorieRecommendation = calculateCalorieRecommendation(weight, height, age, gender, activity, fitnessGoal);

    return NextResponse.json({
      success: true,
      data: {
        ...calorieRecommendation,
      },
    });
  } catch (error) {
    console.error("Error in calculate-calories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Грешка при изчисляването на калории",
      },
      { status: 500 },
    );
  }
}
