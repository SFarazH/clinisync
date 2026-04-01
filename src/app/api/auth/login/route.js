import { loginUser } from "@/services";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await loginUser(body);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
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
      },
    );
    const response = responseHandler.success(null, "Login successful");

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
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
