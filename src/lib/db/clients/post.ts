/**
 * Извлича съществуваща или създава нова тренировъчна сесия
 * @param userId - ID на потребителя
 * @param generationId - ID на генерацията на тренировъчния план
 * @param startingDay - Начален ден на седмицата (по подразбиране "monday")
 * @returns Обект със сесията
 */
export const getOrCreateWorkoutSession = async (
  userId: string,
  generationId: number,
  startingDay: string = "monday",
) => {
  const response = await fetch("/api/workout-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, generationId, startingDay }),
  });

  if (!response.ok) {
    throw new Error("Failed to get or create workout session");
  }

  return response.json();
};

/**
 * Маркира прогреса на упражнение като завършено или пропуснато
 * @param sessionId - ID на сесията
 * @param userId - ID на потребителя
 * @param dayExerciseId - ID на упражнението за деня
 * @param status - Статус на упражнението ("completed" или "skipped")
 * @returns Обект с актуализирания прогрес
 */
export const markExerciseProgress = async (
  sessionId: string,
  userId: string,
  dayExerciseId: number,
  status: "completed" | "skipped",
) => {
  const response = await fetch("/api/exercise-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, userId, dayExerciseId, status }),
  });

  if (!response.ok) {
    throw new Error("Failed to mark exercise progress");
  }

  return response.json();
};

/**
 * Премества тренировъчната сесия към следващия ден
 * @param sessionId - ID на сесията
 * @param nextDay - Следващ ден на седмицата
 * @returns Обект с актуализираната сесия
 */
export const moveToNextDay = async (sessionId: string, nextDay: string) => {
  const response = await fetch("/api/next-day", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, nextDay }),
  });

  if (!response.ok) {
    throw new Error("Failed to move to next day");
  }

  return response.json();
};
