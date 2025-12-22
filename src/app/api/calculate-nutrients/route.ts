import { NextRequest, NextResponse } from "next/server";
import { calculateCalorieRecommendation, FitnessGoal } from "@/server/calorieCalculator";

export async function POST(req: NextRequest) {
  try {
    const { height, weight, age, gender, activityLevel, goal } = await req.json();

    // Валидация на задължителни полета
    if (!height || !weight || !age || !gender || !goal) {
      return NextResponse.json(
        { error: "Липсват задължителни полета: height, weight, age, gender, goal" },
        { status: 400 },
      );
    }

    // Валидация на пол
    if (gender !== "male" && gender !== "female") {
      return NextResponse.json({ error: "Невалиден пол. Трябва да бъде 'male' или 'female'" }, { status: 400 });
    }

    // Валидация на възраст
    if (age < 15 || age > 100) {
      return NextResponse.json({ error: "Невалидна възраст. Трябва да бъде между 15 и 100 години" }, { status: 400 });
    }

    // Валидация на цел
    const validGoals: FitnessGoal[] = [
      "cut",
      "aggressive_cut",
      "lean_bulk",
      "dirty_bulk",
      "recomposition",
      "maintenance",
      "aesthetic",
      "strength",
    ];
    if (!validGoals.includes(goal)) {
      return NextResponse.json(
        { error: `Невалидна цел. Трябва да бъде една от: ${validGoals.join(", ")}` },
        { status: 400 },
      );
    }

    // Изчисляване на калории за конкретната цел
    const calorieRecommendation = calculateCalorieRecommendation(weight, height, age, gender, activityLevel, goal);

    return NextResponse.json({
      success: true,
      data: calorieRecommendation,
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
