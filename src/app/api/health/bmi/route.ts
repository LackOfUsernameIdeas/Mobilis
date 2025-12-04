import { calculateBMI } from "@/server/health";

export async function POST(request: Request) {
  const { height, weight } = await request.json();
  const result = calculateBMI(height, weight);
  return Response.json(result);
}
