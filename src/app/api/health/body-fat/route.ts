import { calculateBodyFat } from "@/server/health";

export async function POST(req: Request) {
  const { height, gender, weight, neck, waist, hip } = await req.json();
  const result = calculateBodyFat(height, gender, weight, neck, waist, hip);
  return Response.json(result);
}
