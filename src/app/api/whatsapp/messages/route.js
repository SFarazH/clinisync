import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { responseHandler } from "@/lib/responseHandler";
import { getWhatsappMessagesByClinic } from "@/services";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.whatsapp.getMessages);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.WHATSAPP_REMINDERS,
    );
    if (accessError) return accessError;

    const result = await getWhatsappMessagesByClinic(dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "WhatsApp messages fetched");
  } catch (error) {
    console.error("Error in GET /api/whatsapp/messages:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
