import { listUnallottedAdmins } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status },
      );
    }
    const result = await listUnallottedAdmins();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in GET /api/admin/list:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
