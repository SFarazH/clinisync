import { deletePatient, getPatientById, updatePatient } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.patients.getPatientById);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const { id } = await params;
    const result = await getPatientById(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Patient fetched successfully");
  } catch (error) {
    console.error("Error in GET /api/patients/[id]:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(rolePermissions.patients.updatePatient);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await updatePatient(id, body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Patient updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/patients/[id]:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}

export async function DELETE(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(rolePermissions.patients.deletePatient);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PATIENTS);
    if (accessError) return accessError;

    const result = await deletePatient(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(
      null,
      result.message || "Patient deleted successfully",
    );
  } catch (error) {
    console.error("Error in DELETE /api/patients/[id]:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
