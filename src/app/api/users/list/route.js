import { listUsers } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  try {
    const dbName = req.headers.get("db-name");
    const auth = await requireAuth(rolePermissions.users.listUsers);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.USERS);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const result = await listUsers({ role, clinicId: clinic._id, dbName });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Users retrieved successfully", { pagination: result.pagination });
  } catch (error) {
    console.error("Error in GET /api/users/list:", error);
    return responseHandler.error(error.message, 500);
  }
}
