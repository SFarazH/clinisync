import { listPatients } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await requireAuth(rolePermissions.patients.listPatients);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const result = await listPatients();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in GET /api/patients:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
