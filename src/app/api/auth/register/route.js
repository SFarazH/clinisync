import { registerUser } from "@/services";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await registerUser(body);

    const status = result.success ? 201 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Error in POST /api/auth/register:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
