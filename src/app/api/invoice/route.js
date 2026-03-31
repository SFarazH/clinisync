import { getInvoices } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(rolePermissions.invocie.getInvocies);
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }
    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.INVOICES);
    if (accessError) return accessError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const paginate = searchParams.get("paginate");
    const patientId = searchParams.get("patientId");
    const invoiceType = searchParams.get("invoiceType");
    const isPaymentComplete = searchParams.get("isPaymentComplete");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const result = await getInvoices({
      invoiceType,
      patientId,
      isPaymentComplete,
      paginate,
      page,
      limit,
      startDate,
      endDate,
      dbName
    });

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "Invoices fetched successfully",
      { pagination: result.pagination },
    );
  } catch (error) {
    console.error("Error in GET /api/invoice:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
