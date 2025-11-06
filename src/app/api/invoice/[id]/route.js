import { addPaymentForInvoice, getInvoiceById } from "@/services";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const body = await req.json();
    const { id } = await params;
    const result = await addPaymentForInvoice(
      id,
      body.amount,
      body.paymentMethod
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/invoice/[id]:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(_, { params }) {
  const { id } = await params;
  try {
    const result = await getInvoiceById(id);

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
