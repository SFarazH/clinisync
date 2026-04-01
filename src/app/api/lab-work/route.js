import { addLabWork, getAllLabWorks } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.labWork.addLabWork);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.LAB_WORK);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await addLabWork(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Lab work created successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/lab-work:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.labWork.getAllLabWorks);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.LAB_WORK);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const paginate = searchParams.get("paginate");
    const patientId = searchParams.get("patientId");
    const isReceived = searchParams.get("isReceived");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const result = await getAllLabWorks({
      paginate,
      page,
      limit,
      patientId,
      isReceived,
      startDate,
      endDate,
      dbName,
    });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Lab works fetched successfully",
      { pagination: result.pagination },
    );
  } catch (error) {
    console.error("Error in GET /api/lab-work:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
