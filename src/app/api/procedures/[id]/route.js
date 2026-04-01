import { deleteProcedure, getProcedureById, updateProcedure } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;

  try {
    const auth = await requireAuth(rolePermissions.procedures.getProcedureById);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PROCEDURES);
    if (accessError) return accessError;

    const result = await getProcedureById(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Procedure retrieved successfully");
  } catch (error) {
    console.error("Error in GET /api/procedure/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;

  try {
    const auth = await requireAuth(rolePermissions.procedures.updateProcedure);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PROCEDURES);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await updateProcedure(id, body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Procedure updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/procedure/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}

export async function DELETE(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;

  try {
    const auth = await requireAuth(rolePermissions.procedures.deleteProcedure);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.PROCEDURES);
    if (accessError) return accessError;

    const result = await deleteProcedure(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Procedure deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/procedure/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}
