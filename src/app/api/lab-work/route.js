import { addLabWork, getAllLabWorks } from "@/services";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const auth = await requireAuth(rolePermissions.labWork.addLabWork);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const result = await addLabWork(body);

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
  try {
    const auth = await requireAuth(rolePermissions.labWork.getAllLabWorks);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
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
