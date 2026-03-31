import {
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  const { id } = await params;
  try {
    const auth = await requireAuth(
      rolePermissions.appointments.getAppointmentById
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
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
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Appointment fetched successfully");
  } catch (error) {
    console.error("Error in GET /api/appointments/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
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
      return responseHandler.error(auth.message, auth.status);
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
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Appointment updated successfully");
  } catch (error) {
    console.error("Error in PUT /api/appointments/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
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
      return responseHandler.error(auth.message, auth.status);
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
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Appointment deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/appointments/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
