import { createOrUpdateAppSettings, getAppSettings } from "@/services";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET() {
  const dbName = req.headers.get("db-name");
  const auth = await requireAuth(rolePermissions.appSettings.getSettings);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }

  const { clinic } = auth;
  const accessError = checkAccess(clinic, dbName, FeatureMapping.SETTINGS);
  if (accessError) return accessError;

  const result = await getAppSettings(dbName);

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.appSettings.createOrUpdateSettings
    );
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.SETTINGS);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await createOrUpdateAppSettings(body, dbName);

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
    console.error("Error in POST /api/appSettings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
