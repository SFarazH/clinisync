import { addClinic, getClinics } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const body = await req.json();
    const result = await addClinic(body);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Clinic created successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/clinic:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}

export async function GET() {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const result = await getClinics();
    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Clinics fetched successfully");
  } catch (error) {
    console.error("Error in GET /api/clinic:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
