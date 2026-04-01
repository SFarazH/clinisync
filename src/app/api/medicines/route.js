import { getPaginatedMedicines } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  try {
    const dbName = req.headers.get("db-name");
    const auth = await requireAuth(rolePermissions.medicines);
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const result = await getPaginatedMedicines({ page, limit, search, dbName });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, result.message, { pagination: result.pagination });
  } catch (error) {
    return responseHandler.error(error.message, 500);
  }
}
