import { createProcedure, getProcedures } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.procedures.createProcedure);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PROCEDURES);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await createProcedure(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Procedure created successfully", null, 201);
  } catch (error) {
    console.error("Error in POST /api/procedure:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.procedures.getProcedures);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PROCEDURES);
    if (accessError) return accessError;

    const result = await getProcedures(dbName);
    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Procedures retrieved successfully");
  } catch (error) {
    console.error("Error in GET /api/procedure:", error);
    return responseHandler.error(error.message, 500);
  }
}
