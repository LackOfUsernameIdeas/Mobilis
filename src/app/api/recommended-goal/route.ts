import { NextRequest, NextResponse } from "next/server";
import { getRecommendedGoal } from "@/server/recommendedGoal";

export async function POST(req: NextRequest) {
  try {
    const { height, gender, weight, neck, waist, hip } = await req.json();

    // Валидация на задължителни полета
    if (!height || !weight || !gender || !neck || !waist) {
      return NextResponse.json(
        { error: "Липсват задължителни полета: height, weight, gender, neck, waist" },
        { status: 400 },
      );
    }

    // Валидация за жени - хип е задължителен
    if (gender === "female" && !hip) {
      return NextResponse.json(
        { error: "Необходим е размер на таза (hip) при определяне на целта за жени" },
        { status: 400 },
      );
    }

    // Получаване на препоръка
    const recommendation = getRecommendedGoal(height, weight, gender, neck, waist, hip);

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error("Error in recommend-goal:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Грешка при обработката на заявката",
      },
      { status: 500 },
    );
  }
}
