import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/db/clients/supabase";

/**
 * Извлича общия брой потребители от auth.users
 */
export async function getUsersCount() {
  const supabase = getServiceClient();

  try {
    // Използваме Auth Admin API
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("Error fetching users count:", error);
      throw error;
    }

    return {
      success: true,
      data: {
        count: users.length,
      },
    };
  } catch (error) {
    console.error("Error getting users count:", error);
    return {
      success: false,
      error: "Failed to get users count",
    };
  }
}
export async function GET() {
  try {
    const result = await getUsersCount();

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to get users count" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in users count endpoint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
