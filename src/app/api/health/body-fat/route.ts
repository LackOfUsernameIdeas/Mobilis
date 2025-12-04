import { NextRequest, NextResponse } from "next/server";
import { calculateBodyFat } from "@/server/health";

export async function POST(req: NextRequest) {
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
      { error: "Необходим е размер на ханша (hip) при определяне на телесните мазнини за жени" },
      { status: 400 },
    );
  }

  const result = calculateBodyFat(height, gender, weight, neck, waist, hip);
  return NextResponse.json(result);
}
