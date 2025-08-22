import { updateUser } from "@/services";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await updateUser(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in PUT /api/auth/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
