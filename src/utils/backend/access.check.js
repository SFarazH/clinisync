import { responseHandler } from "@/utils/responseHandler";

export const checkAccess = (clinic, dbName, featureKey) => {
  if (!clinic) {
    return responseHandler.error("Clinic information missing", 400);
  }

  if (dbName !== "clinisync") {
    if (clinic.databaseName !== dbName) {
      return responseHandler.error("Unauthorized access", 403);
    }
  }

  if (featureKey && !clinic.features?.[featureKey]) {
    return responseHandler.error("Feature not enabled for this clinic", 403);
  }

  return null;
};
