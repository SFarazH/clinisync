import { responseHandler } from "@/lib/responseHandler";
import {
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "@/services/doctors.service";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { FeatureMapping } from "@/utils/feature.mapping";
import { checkAccess } from "@/utils";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.doctors.getDoctorById);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.DOCTORS);
    if (accessError) return accessError;

    const { id } = await params;
    const result = await getDoctorById(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Doctor retrieved successfully");
  } catch (error) {
    console.error("Error in GET /api/doctors/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.doctors.updateDoctor);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.DOCTORS);
    if (accessError) return accessError;

    const { id } = await params;
    const body = await req.json();
    const result = await updateDoctor(id, body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Doctor updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/doctors/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function DELETE(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.doctors.deleteDoctor);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.DOCTORS);
    if (accessError) return accessError;

    const { id } = await params;
    const result = await deleteDoctor(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Doctor deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/doctors/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}
