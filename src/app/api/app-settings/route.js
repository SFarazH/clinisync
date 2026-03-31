import { createOrUpdateAppSettings, getAppSettings } from "@/services";
import { checkAccess } from "@/utils";
import { FeatureMapping } from "@/utils/feature.mapping";
import { requireAuth } from "@/utils/require-auth";
import { rolePermissions } from "@/utils/role-permissions.mapping";
import { NextResponse } from "next/server";
import { responseHandler } from "@/lib/responseHandler";

export async function GET(req) {
  const dbName = req.headers.get("db-name");
  const auth = await requireAuth(rolePermissions.appSettings.getSettings);
  if (!auth.ok) {
    return responseHandler.error(auth.message, auth.status);
  }

  const { clinic } = auth;
  const accessError = checkAccess(clinic, dbName, FeatureMapping.SETTINGS);
  if (accessError) return accessError;

  const result = await getAppSettings(dbName);

  if (!result.success) {
    return responseHandler.error(result.error, 400);
  }

  return responseHandler.success(result.data, "App settings fetched successfully");
}

export async function POST(req) {
  const dbName = req.headers.get("db-name");
  try {
    const auth = await requireAuth(
      rolePermissions.appSettings.createOrUpdateSettings,
    );
    if (!auth.ok) {
      return responseHandler.error(auth.message, auth.status);
    }

    const { clinic } = auth;
    const accessError = checkAccess(clinic, dbName, FeatureMapping.SETTINGS);
    if (accessError) return accessError;

    const body = await req.json();
    const result = await createOrUpdateAppSettings(body, dbName);

    if (!result.success) {
      return responseHandler.error(result.error, 400);
    }

    return responseHandler.success(
      result.data,
      "App settings updated successfully",
      {},
      201,
    );
  } catch (error) {
    console.error("Error in POST /api/appSettings:", error);
    return responseHandler.error(error.message || "Internal Server Error", 500, error);
  }
}
