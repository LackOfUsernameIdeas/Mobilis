import { createClient } from "@/app/utils/supabase/client";

export const fetchYouTubeEmbed = async (query: string) => {
  try {
    const response = await fetch(`/api/get-recommendation-video?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.youTubeEmbedUrl || null;
  } catch (error) {
    console.error(`Error fetching YouTube video for ${query}:`, error);
    return null;
  }
};

// Helper to fetch nutrient recommendations from your API
export const fetchNutrientRecommendations = async (params: {
  height: number;
  weight: number;
  age: number;
  gender: string;
  activityLevel: string;
  goal: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/calculate-nutrients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    return {
      calories: data.goal.calories || 0,
      protein: data.goal.macros.protein || 0,
      carbs: data.goal.macros.carbs || 0,
      fats: data.goal.macros.fats || 0,
    };
  } catch (error) {
    console.error("Error fetching nutrient recommendations:", error);
    return null;
  }
};
