import { addPrescription, getPrescriptions } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.prescriptions.addPrescription,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.PRESCRIPTIONS,
    );
    if (accessError) return accessError;

    const body = await req.json();
    const result = await addPrescription(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result?.data,
      "Prescription added successfully",
      null,
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/prescription:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.prescriptions.addPrescription,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.PRESCRIPTIONS,
    );
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const result = await getPrescriptions({
      page,
      limit,
      search,
      startDate,
      endDate,
      dbName,
    });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Prescriptions retrieved successfully",
      { pagination: result.pagination },
    );
  } catch (error) {
    console.error("Error in GET /api/prescriptions:", error);
    return responseHandler.error(error.message, 500);
  }
}
