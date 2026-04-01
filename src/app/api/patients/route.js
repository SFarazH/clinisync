import { createPatient, getPaginatedPatients } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.patients.createPatient);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await createPatient(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Patient created successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/patients:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.patients.getPaginatedPatients,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    const result = await getPaginatedPatients({ page, limit, search, dbName });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Patients fetched successfully",
      { pagination: result.pagination }, // 👈 key change
    );
  } catch (error) {
    console.error("Error in GET /api/patients:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
