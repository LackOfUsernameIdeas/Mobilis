import { createClient } from "@supabase/supabase-js";
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

export async function fetchUserMetrics() {
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

  return response.json();
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
