import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST() {
  try {
    const response = NextResponse.json(
      responseHandler.success(null, "Logout successful").body,
      { status: 200 }
    );

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      sameSite: "None",
      maxAge: 0,
      secure: true,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in POST /api/auth/logout:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
