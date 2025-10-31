import { getInvoices } from "@/services";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const paginate = searchParams.get("paginate");
    const patientId = searchParams.get("patientId");
    const invoiceType = searchParams.get("invoiceType");
    const isPaymentComplete = searchParams.get("isPaymentComplete");

    const result = await getInvoices({
      invoiceType,
      patientId,
      isPaymentComplete,
      paginate,
      page,
      limit,
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
    console.error("Error in GET /api/invoice:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
