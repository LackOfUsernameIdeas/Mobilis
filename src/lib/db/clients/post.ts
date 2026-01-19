/**
 * Извлича съществуваща или създава нова тренировъчна/хранителна сесия
 * @param type - workout / meal
 * @param userId - ID на потребителя
 * @param generationId - ID на генерацията на тренировъчния план
 * @param startingDay - Начален ден на седмицата (по подразбиране "Ден 1")
 * @returns Обект със сесията
 */
export const getOrCreateSession = async (
  type: "workout" | "meal",
  userId: string,
  generationId: number,
  startingDay = "Ден 1",
) => {
  const res = await fetch("/api/progress-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, userId, generationId, startingDay }),
  });

  if (!res.ok) throw new Error("Session fetch failed");
  return res.json();
};

export const markItemProgress = async (
  type: "workout" | "meal",
  sessionId: string,
  userId: string,
  dayItemId: number,
  status: "completed" | "skipped",
) => {
  const res = await fetch("/api/mark-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sessionId, userId, dayItemId, status }),
  });

  if (!res.ok) {
    throw new Error("Failed to mark progress");
  }

  return res.json();
};

/**
 * Премества тренировъчната сесия към следващия ден
 * @param type - workout / meal
 * @param sessionId - ID на сесията
 * @param nextDay - Следващ ден на седмицата
 * @returns Обект с актуализираната сесия
 */
export const moveToNextDay = async (type: "workout" | "meal", sessionId: string, nextDay: string) => {
  const res = await fetch("/api/next-day", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, sessionId, nextDay }),
  });

  if (!res.ok) {
    throw new Error("Failed to move to next day");
  }

  return res.json();
};
