import { createAppointment, listAppointments } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.createAppointment,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.APPOINTMENTS,
    );
    if (accessError) return accessError;
    const body = await req.json();
    const result = await createAppointment(body, dbName);

    const appt = result.data.appointment;

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Appointment created successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/appointments:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.listAppointments,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(
      clinic,
      dbName,
      FeatureMapping.APPOINTMENTS,
    );
    if (accessError) return accessError;
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
      dbName,
    });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Appointments fetched successfully",
      { pagination: result.pagination },
    );
  } catch (error) {
    console.error("Error in GET /api/appointments:", error);
    return responseHandler.error(
      error.message || "Internal Server Error",
      500,
      error,
    );
  }
}
