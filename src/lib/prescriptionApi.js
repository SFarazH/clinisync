import { apiClient } from "@/utils";

export const addPrescription = async ({ prescriptionData, dbName }) => {
  return apiClient.post("/api/prescriptions", prescriptionData, {
    headers: { "db-name": dbName },
  });
};

export const updatePrescription = async ({ id, prescriptionData, dbName }) => {
  return apiClient.put(`/api/prescriptions/${id}`, prescriptionData, {
    headers: { "db-name": dbName },
  });
};

export const getPaginatedPrescriptions = async ({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  dbName,
} = {}) => {
  return apiClient.get("/api/prescriptions", {
    headers: { "db-name": dbName },
    params: { page, limit, search, startDate, endDate },
  });
};
