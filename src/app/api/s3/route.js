import { s3Upload } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  const auth = await requireAuth(rolePermissions.s3.s3Upload);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/s3:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
