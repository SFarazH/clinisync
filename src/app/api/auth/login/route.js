import { loginUser } from "@/services";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await loginUser(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    const jwtToken = jwt.sign(
      {
        id: result.data._id,
        role: result.data.role,
        email: result.data.email,
        clinic: result.data?.clinic,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );
    const response = NextResponse.json(
      { success: true, message: "Login successful" },
      { status: 200 }
    );

    response.cookies.set("accessToken", jwtToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error in POST /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
