import { deleteLabWork, markLabWorkComplete, updateLabWork } from "@/services";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const result = await updateLabWork(params.id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/lab-work/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(_, { params }) {
  try {
    const result = await markLabWorkComplete(params.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PATCH /api/lab-work/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(_, { params }) {
  try {
    const result = await deleteLabWork(params.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error in DELETE /api/lab-work/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
