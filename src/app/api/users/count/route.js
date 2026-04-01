import { getUsersByRole } from "@/services";
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
    const result = await getUsersByRole(clinic._id);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "User count retrieved successfully");
  } catch (error) {
    console.error("Error in GET /api/users/count:", error);
    return responseHandler.error(error.message, 500);
  }
}
