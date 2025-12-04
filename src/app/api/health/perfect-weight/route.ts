import { NextRequest, NextResponse } from "next/server";
import { calculatePerfectWeight } from "@/server/health";

export async function POST(req: NextRequest) {
  const { height, gender, weight } = await req.json();

  // Валидация на задължителни полета
  if (!height || !weight || !gender) {
    return NextResponse.json({ error: "Липсват задължителни полета: height, weight, gender" }, { status: 400 });
  }

  const result = calculatePerfectWeight(height, gender, weight);
  return NextResponse.json(result);
}
