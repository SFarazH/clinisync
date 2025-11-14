import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.getAppointmentById
    );
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.APPOINTMENTS
    );
    if (accessError) return accessError;

    const result = await getAppointmentById(id, dbName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in GET /api/appointments/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.updateAppointment
    );
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.APPOINTMENTS
    );
    if (accessError) return accessError;

    const body = await req.json();
    const result = await updateAppointment(id, body, dbName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/appointments/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.deleteAppointment
    );
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.APPOINTMENTS
    );
    if (accessError) return accessError;

    const result = await deleteAppointment(id, dbName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in DELETE /api/appointments/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
