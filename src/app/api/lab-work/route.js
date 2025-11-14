import { addLabWork, getAllLabWorks } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.labWork.addLabWork);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.LAB_WORK);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await addLabWork(body, dbName);

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
    console.error("Error in POST /api/lab-work:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.labWork.getAllLabWorks);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
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
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination ?? null,
    });
  } catch (error) {
    console.error("Error in GET /api/lab-work:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
