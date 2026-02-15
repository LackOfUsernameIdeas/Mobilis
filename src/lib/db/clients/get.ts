/**
 * Извлича метриките на потребителя
 * @returns Обект с метрики на потребителя
 */
export async function fetchUserMetrics(userId: string) {
  const response = await fetch(`/api/user-metrics?userId=${userId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user metrics");
  }

  return await response.json();
}

/**
 * Извлича измерванията на потребителя
 * @returns Обект с измервания на потребителя
 */
export async function fetchUserMeasurements(userId: string) {
  const response = await fetch(`/api/user-measurements?userId=${userId}`, {
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
export async function fetchBodyFatWeightHistory(userId: string) {
  const response = await fetch(`/api/bodyfat-weight-history?userId=${userId}`, {
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
export async function fetchUserHealthData(userId: string) {
  try {
    const [responseMetrics, responseMeasurements] = await Promise.all([
      fetch(`/api/user-metrics?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      fetch(`/api/user-measurements?userId=${userId}`, {
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
export async function fetchUserWorkoutOverview(userId: string) {
  const response = await fetch(`/api/user-workout-overview?userId=${userId}`, {
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

export async function fetchUserNutritionOverview(userId: string) {
  const response = await fetch(`/api/user-nutrition-overview?userId=${userId}`, {
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
 * @param userId - потребителското id
 * @param type - workout / meal
 * @param sessionId - ID на сесията
 * @param itemIds - Масив с ID-та на упражненията/ястията за деня
 * @returns Обект с прогрес на упражненията/ястията
 */
export const getDayProgress = async <T>(
  userId: string,
  type: "workout" | "meal",
  sessionId: string,
  itemIds: number[],
): Promise<T[]> => {
  const res = await fetch(
    `/api/day-progress?type=${type}&userId=${userId}&sessionId=${sessionId}&itemIds=${itemIds.join(",")}`,
  );

  if (!res.ok) throw new Error("Day progress fetch failed");
  return res.json();
};
