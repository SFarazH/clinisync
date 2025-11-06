import { createAppointment, listAppointments } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.createAppointment
    );
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const body = await req.json();
    const result = await createAppointment(body);

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
    console.error("Error in POST /api/appointments:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
        const auth = await requireAuth(
          rolePermissions.appointments.listAppointments
        );
        if (!auth.ok) {
          return NextResponse.json(
            { success: false, error: auth.message },
            { status: auth.status }
          );
        }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const doctorId = searchParams.get("doctorId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paginate = searchParams.get("isPaginate") !== "false";
    const status = searchParams.get("status");

    const result = await listAppointments({
      page,
      limit,
      doctorId,
      startDate,
      endDate,
      paginate,
      status,
    });

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
    console.error("Error in GET /api/appointments:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
