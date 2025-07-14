import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json(
      { success: true, message: "Logout successful" },
      { status: 200 }
    );

    response.cookies.set("accessToken", "", {
      httpOnly: true,
      sameSite: "None",
      maxAge: 0,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in POST /api/auth/logout:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
