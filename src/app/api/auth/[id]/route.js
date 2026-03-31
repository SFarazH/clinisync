import { updateUser } from "@/services";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await updateUser(id, body);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, result.message || "User updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/auth/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
