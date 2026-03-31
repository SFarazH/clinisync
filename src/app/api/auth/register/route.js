import { registerUser } from "@/services";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  try {
    const dbName = req.headers.get("db-name");
    const body = await req.json();
    const result = await registerUser(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "User registered successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
