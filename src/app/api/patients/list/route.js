import { listPatients } from "@/services";
import { checkAccess, responseHandler } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.patients.listPatients);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const result = await listPatients(dbName);

    // if (!result.success) {
    //   return NextResponse.json(
    //     { success: false, error: result.error },
    //     { status: 400 }
    //   );
    // }
    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Patients fetched successfully",
    );
  } catch (error) {
    console.error("Error in GET /api/patients:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
