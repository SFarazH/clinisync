import { addPaymentForInvoice, getInvoiceById } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function PUT(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.invocie.addPaymentForInvoice
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.INVOICES);
    if (accessError) return accessError;

    const body = await req.json();
    const { id } = await params;
    const result = await addPaymentForInvoice(
      id,
      body.amount,
      body.paymentMethod,
      dbName
    );

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(result.data, "Payment added successfully");
  } catch (error) {
    console.error("Error in PUT /api/invoice/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}

export async function GET(req, { params }) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.invocie.getInvoiceById);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.INVOICES);
    if (accessError) return accessError;

    const { id } = await params;
    const result = await getInvoiceById(id, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 404);
    }

    return responseHandler.success(result.data, "Invoice fetched successfully");
  } catch (error) {
    console.error("Error in GET /api/appointments/[id]:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
