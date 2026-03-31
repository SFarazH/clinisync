import { searchPatients } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.patients.searchPatients);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("q") || "";

    const result = await searchPatients(searchTerm, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Patients search successful",
      { count: result.count },
    );
  } catch (error) {
    console.error("Error in GET /api/patients/search:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
