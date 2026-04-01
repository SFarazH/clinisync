import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export async function GET(req) {
  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return responseHandler.error("Token not found", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return responseHandler.success(decoded, "Token verified successfully");
  } catch (error) {
    console.error("Error in GET /api/auth/verify:", error);
    return responseHandler.error("Invalid or expired token", 401, error);
  }
}
