import { apiClient } from "@/utils";

export const getClinicConfig = async ({ dbName }) => {
  return apiClient.get("/api/app-settings", {
    headers: { "db-name": dbName },
  });
};

export const updateClinicConfig = async ({ configData, dbName }) => {
  return apiClient.post("/api/app-settings", configData, {
    headers: { "db-name": dbName },
  });
};
