import { NextResponse } from "next/server";
import {
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "@/services/doctors.service";

export async function GET(_, { params }) {
  const { id } = await params;
  try {
    const result = await getDoctorById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in GET /api/doctors/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, {params}) {
  const { id } = await params;
  try {
    const body = await req.json();
    const result = await updateDoctor(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/doctors/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_, { params }) {
  const { id } = await params;
  try {
    const result = await deleteDoctor(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in DELETE /api/doctors/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
