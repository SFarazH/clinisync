import { updatePrescription } from "@/services";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await updatePrescription(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/prescriptions/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
