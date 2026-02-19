import { addAdmin } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status },
      );
    }
    const body = await req.json();
    const result = await addAdmin(body);

    const status = result.success ? 201 : 400;
    return NextResponse.json(result, { status });
  } catch (error) {
    console.error("Error in POST /api/auth/register/admin:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
