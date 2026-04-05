import { sendWhatsappMessage } from "@/services/whatsapp.services";
import { checkAccess, responseHandler } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.procedures.createProcedure);
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

    const body = await req.json();

    const result = await sendWhatsappMessage(body);

    if (!result.success) {
      return responseHandler.error("Error", 500, result.error);
    }

    return responseHandler.success(
      result.data,
      "Message sent successfully",
      {},
      200,
    );
  } catch (error) {
    console.error("Error in POST /api/whatsapp/send:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
