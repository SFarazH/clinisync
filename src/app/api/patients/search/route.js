import { searchPatients } from "@/services";
import { rolePermissions } from "@/utils/role-permissions";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const auth = await requireAuth(rolePermissions.patients.searchPatients);
    if (!auth.ok) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status }
      );
    }
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("q") || "";

    const result = await searchPatients(searchTerm);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error) {
    console.error("Error in GET /api/patients/search:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
