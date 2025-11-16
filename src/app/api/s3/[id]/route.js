import { getS3Image } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  const auth = await requireAuth(rolePermissions.s3.getS3Image);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }
  const { clinic } = auth;
  const accessError = checkAccess(clinic, dbName, FeatureMapping.ATTACHMENTS);
  if (accessError) return accessError;

  const { id: key } = await params;

  if (!key) {
    return NextResponse.json(
      { error: "No key provided" },
      {
        status: 400,
      }
    );
  }

  const { bufferResponse, contentType } = await getS3Image(key);
  try {
    return new NextResponse(new Uint8Array(bufferResponse), {
      status: 200,
      headers: {
        "Content-Type": contentType || "application/octet-stream",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "File not found" },
      {
        status: 404,
      }
    );
  }
}
