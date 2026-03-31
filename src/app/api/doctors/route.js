import { addDoctor, getAllDoctors } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.doctors.getAllDoctors);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.DOCTORS);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const getUnassigned = searchParams.get("getUnassigned") || false;
    const result = await getAllDoctors(getUnassigned, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Doctors retrieved successfully");
  } catch (error) {
    console.error("Error in GET /api/doctors:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.doctors.addDoctor);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.DOCTORS);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await addDoctor(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Doctor added successfully", null, 201);
  } catch (error) {
    console.error("Error in POST /api/doctors:", error);
    return responseHandler.error(error.message, 500);
  }
}
