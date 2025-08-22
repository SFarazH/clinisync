import { getUsersByRole } from "@/services";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const result = await getUsersByRole();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/auth/count:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
