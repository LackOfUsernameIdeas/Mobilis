import { getBrowserClient } from "@/lib/db/clients/browser";

/**
 * Извлича автентикирания потребител от Supabase
 * @returns Обект с данни за потребителя
 * @throws Грешка ако потребителят не е автентикиран
 */
export async function getAuthenticatedUser() {
  const supabase = getBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user;
}

/**
 * Извлича метриките на потребителя
 * @param u - Опционален флаг дали да се включи userId в резултата
 * @returns Обект с метрики на потребителя
 */
export async function fetchUserMetrics(u?: boolean) {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/user-metrics?userId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user metrics");
  }

  const data = await response.json();

  // Ако е зададен флаг u, добавяме userId към резултата
  if (u) {
    return { ...data, userId: user.id };
  }

  return data;
}

/**
 * Извлича измерванията на потребителя
 * @returns Обект с измервания на потребителя
 */
export async function fetchUserMeasurements() {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/user-measurements?userId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user measurements");
  }

  return response.json();
}

/**
 * Извлича историята на телесните мазнини и теглото
 * @returns Масив с исторически данни за телесни мазнини и тегло
 */
export async function fetchBodyFatWeightHistory() {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/bodyfat-weight-history?userId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user metrics");
  }

  return response.json();
}

/**
 * Извлича комплексни здравни данни на потребителя
 * Обединява метрики и измервания в един обект
 * @returns Обект със здравни показатели
 */
export async function fetchUserHealthData() {
  try {
    const user = await getAuthenticatedUser();

    // Паралелно извличане на метрики и измервания за по-добра производителност
    const [responseMetrics, responseMeasurements] = await Promise.all([
      fetch(`/api/user-metrics?userId=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(`/api/user-measurements?userId=${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    ]);

    if (!responseMetrics.ok || !responseMeasurements.ok) {
      throw new Error("Failed to fetch metrics or measurements data");
    }

    const [metrics, measurements] = await Promise.all([responseMetrics.json(), responseMeasurements.json()]);

    // Връщане на обединени здравни данни
    return {
      gender: measurements.gender,
      height: measurements.height,
      weight: measurements.weight,
      age: measurements.age,
      goal: metrics.goalData.goal,
      activityLevel: measurements.activity_level,
      bmi: metrics.bmiData.bmi,
      bodyFat: metrics.bodyFatData.bodyFat,
      bodyFatMass: metrics.bodyFatData.bodyFatMass,
      leanBodyMass: metrics.bodyFatData.leanBodyMass,
    };
  } catch (error) {
    console.error("Error fetching health data:", error);
    throw error;
  }
}

/**
 * Извлича общ преглед на тренировките на потребителя
 * @returns Обект с информация за тренировките
 */
export async function fetchUserWorkoutOverview() {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/user-workout-overview?userId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user workout overview");
  }

  return response.json();
}

export async function fetchUserNutritionOverview() {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/user-nutrition-overview?userId=${user.id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user nutrition overview");
  }

  return response.json();
}

/**
 * Извлича прогреса за конкретен ден в тренировъчната/хранителна сесия
 * @param type - workout / meal
 * @param sessionId - ID на сесията
 * @param dayExerciseIds - Масив с ID-та на упражненията за деня
 * @returns Обект с прогрес на упражненията
 */
export const getDayProgress = async (type: "workout" | "meal", sessionId: string, itemIds: number[]) => {
  const user = await getAuthenticatedUser();

  const res = await fetch(
    `/api/day-progress?type=${type}&userId=${user.id}&sessionId=${sessionId}&itemIds=${itemIds.join(",")}`,
  );

  if (!res.ok) throw new Error("Day progress fetch failed");
  return res.json();
};

/**
 * Извлича завършените упражнения за потребителя
 * @param userId - ID на потребителя
 * @param sessionId - Опционално ID на сесията
 * @returns Масив със завършени упражнения
 */
export const getCompletedExercises = async (userId: string, sessionId?: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/completed-exercises?userId=${user.id}&sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};

/**
 * Извлича пропуснатите упражнения за потребителя
 * @param userId - ID на потребителя
 * @param sessionId - Опционално ID на сесията
 * @returns Масив с пропуснати упражнения
 */
export const getSkippedExercises = async (userId: string, sessionId?: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/skipped-exercises?userId=${user.id}&sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};

/**
 * Извлича статистика за тренировъчната сесия
 * @param sessionId - ID на сесията
 * @returns Обект със статистика (завършени, пропуснати, процент на завършване)
 */
export const getWorkoutStats = async (sessionId: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/workout-stats?sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};

export const getCompletedDays = async (
  type: "workout" | "meal",
  generationId: number,
): Promise<{ completedDays: string[] }> => {
  const user = await getAuthenticatedUser();

  const res = await fetch(`/api/current-day?type=${type}&userId=${user.id}&generationId=${generationId}`);

  if (!res.ok) throw new Error("Day progress fetch failed");

  const data: { currentDay: number } = await res.json();

  const completedDays = Array.from({ length: data.currentDay }, (_, i) => `Ден ${i + 1}`);

  return { completedDays };
};
