import { calculatePerfectWeight } from "@/server/health";

export async function POST(req: Request) {
  const { height, gender, weight } = await req.json();
  const result = calculatePerfectWeight(height, gender, weight);
  return Response.json(result);
}
