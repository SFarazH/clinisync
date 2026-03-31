import { s3Upload } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  const auth = await requireAuth(rolePermissions.s3.s3Upload);
  if (!auth.ok) {
    return responseHandler.error(auth.message, auth.status);
  }
  const { clinic } = auth;
  const accessError = checkAccess(clinic, dbName, FeatureMapping.ATTACHMENTS);
  if (accessError) return accessError;

  const formData = await req.formData();
  const file = formData.get("file");
  const appointmentId = formData.get("appointmentId");
  try {
    const result = await s3Upload(file, appointmentId, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "File uploaded successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/s3:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
