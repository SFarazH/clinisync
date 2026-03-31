import { updatePrescription } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(
      rolePermissions.prescriptions.addPrescription
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.PRESCRIPTIONS
    );
    if (accessError) return accessError;

    const body = await req.json();
    const result = await updatePrescription(id, body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Prescription updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/prescriptions/[id]:", error);
    return responseHandler.error(error.message, 500);
  }
}
