import { createOrUpdateAppSettings, getAppSettings } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuth(rolePermissions.appSettings.getSettings);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: auth.message },
      { status: auth.status }
    );
  }

  const result = await getAppSettings();

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function POST(req) {
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

    const body = await req.json();
    const result = await createOrUpdateAppSettings(body);

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
