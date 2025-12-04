import { NextRequest, NextResponse } from "next/server";
import { calculateBMI } from "@/server/health";

export async function POST(request: NextRequest) {
  const { height, weight } = await request.json();

  // Валидация на задължителни полета
  if (!height || !weight) {
    return NextResponse.json({ error: "Липсват задължителни полета: height, weight" }, { status: 400 });
  }

  const result = calculateBMI(height, weight);
  return NextResponse.json(result);
}
