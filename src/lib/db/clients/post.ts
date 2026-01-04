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
