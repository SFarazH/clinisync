import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { getClinicById, updateClinic } from "@/services";
import { responseHandler } from "@/lib/responseHandler";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN, roles.ADMIN]);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { id } = await params;
    const body = await req.json();

    const result = await updateClinic(id, body);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Clinic updated successfully");
  } catch (error) {
    console.error("Error in PATCH /api/clinic/[id]:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}

export async function GET(_, { params }) {
  try {
    console.log("called");
    const auth = await requireAuth([roles.SUPER_ADMIN, roles.ADMIN]);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { id } = await params;

    const result = await getClinicById(id);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Clinic fetched successfully");
  } catch (error) {
    console.error("Error in GET /api/clinic/[id]:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
