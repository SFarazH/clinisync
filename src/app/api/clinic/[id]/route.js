import { NextResponse } from "next/server";
import { requireAuth } from "@/utils/require-auth";
import { roles } from "@/utils/role-permissions.mapping";
import { getClinicById, updateClinic } from "@/services";

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status },
      );
    }

    const { id } = await params;
    const body = await req.json();

    const result = await updateClinic(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in PATCH /api/clinic/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function GET(_, { params }) {
  try {
    const auth = await requireAuth([roles.SUPER_ADMIN]);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status },
      );
    }

    const { id } = await params;

    const result = await getClinicById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in GET /api/clinic/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
