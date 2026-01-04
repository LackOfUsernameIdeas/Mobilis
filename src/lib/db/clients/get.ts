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

  const response = await fetch(`/api/user-workout-overview?userId=74a29483-6511-4cf2-a18d-84a805376089`, {
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

/**
 * Извлича прогреса за конкретен ден в тренировъчната сесия
 * @param sessionId - ID на сесията
 * @param dayExerciseIds - Масив с ID-та на упражненията за деня
 * @returns Обект с прогрес на упражненията
 */
export const getDayProgress = async (sessionId: string, dayExerciseIds: number[]) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(
    `/api/day-progress?userId=${user.id}&sessionId=${sessionId}&dayExerciseIds=${dayExerciseIds.join(",")}`,
  );

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
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
