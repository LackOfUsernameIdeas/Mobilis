import { getBrowserClient } from "@/lib/db/clients/browser";

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

  if (u) {
    return { ...data, userId: user.id };
  }

  return data;
}

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

export async function fetchUserHealthData() {
  try {
    const user = await getAuthenticatedUser();

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

export const getCompletedExercises = async (userId: string, sessionId?: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/completed-exercises?userId=${user.id}&sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};

export const getSkippedExercises = async (userId: string, sessionId?: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/skipped-exercises?userId=${user.id}&sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};

export const getWorkoutStats = async (sessionId: string) => {
  const user = await getAuthenticatedUser();

  const response = await fetch(`/api/workout-stats?sessionId=${sessionId}`);

  if (!response.ok) {
    throw new Error("Error fetching day progress.");
  }

  return response.json();
};
