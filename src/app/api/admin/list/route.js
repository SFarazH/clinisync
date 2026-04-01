import { listUnallottedAdmins } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET() {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const result = await listUnallottedAdmins();

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Admins fetched successfully",
      {},
      200,
    );
  } catch (error) {
    console.error("Error in GET /api/admin/list:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
