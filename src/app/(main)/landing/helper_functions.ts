/**
 * Helper functions for fetching landing page statistics
 */

export interface UsersCountResponse {
  success: boolean;
  data?: {
    count: number;
  };
  error?: string;
}

export interface MostRecommendedGoalResponse {
  success: boolean;
  data?: {
    goal: string;
    goalName: string;
    count: number;
  };
  error?: string;
}

export interface AverageNutritionalProfileResponse {
  success: boolean;
  data?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  error?: string;
}

/**
 * Fetch total users count
 */
export async function fetchUsersCount(): Promise<UsersCountResponse> {
  try {
    const response = await fetch("/api/users-count");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users count:", error);
    return {
      success: false,
      error: "Failed to fetch users count",
    };
  }
}

/**
 * Fetch most recommended goal
 */
export async function fetchMostRecommendedGoal(): Promise<MostRecommendedGoalResponse> {
  try {
    const response = await fetch("/api/most-recommended-goal");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching most recommended goal:", error);
    return {
      success: false,
      error: "Failed to fetch most recommended goal",
    };
  }
}

/**
 * Fetch average nutritional profile
 */
export async function fetchAverageNutritionalProfile(): Promise<AverageNutritionalProfileResponse> {
  try {
    const response = await fetch("/api/average-nutritional-profile");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching average nutritional profile:", error);
    return {
      success: false,
      error: "Failed to fetch average nutritional profile",
    };
  }
}

/**
 * Fetch all landing page statistics
 */
export async function fetchLandingPageStats() {
  const [usersCount, recommendedGoal, nutritionalProfile] = await Promise.all([
    fetchUsersCount(),
    fetchMostRecommendedGoal(),
    fetchAverageNutritionalProfile(),
  ]);

  return {
    usersCount: usersCount.success ? (usersCount.data?.count ?? 0) : 0,
    recommendedGoal: recommendedGoal.success
      ? {
          goal: recommendedGoal.data?.goal ?? "Неизвестна",
          goalName: recommendedGoal.data?.goalName ?? "Неизвестна",
          count: recommendedGoal.data?.count ?? 0,
        }
      : { goal: "Неизвестна", count: 0 },
    nutritionalProfile: {
      data: {
        calories: nutritionalProfile.data?.calories ?? 0,
        protein: nutritionalProfile.data?.protein ?? 0,
        carbs: nutritionalProfile.data?.carbs ?? 0,
        fats: nutritionalProfile.data?.fats ?? 0,
      },
    },
  };
}
