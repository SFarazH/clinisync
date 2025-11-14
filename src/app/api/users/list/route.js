import { listUsers } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const dbName = req.headers.get("db-name");
    const auth = await requireAuth(rolePermissions.users.listUsers);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.USERS);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    const result = await listUsers({ role, clinicId: clinic._id });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in GET /api/users/list:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
