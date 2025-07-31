import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export async function GET(req) {
  try {
    const token = req.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token not found" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    return NextResponse.json({ success: true, user: decoded }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/auth/verify:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
