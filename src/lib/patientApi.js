import { apiClient } from "@/utils";

export const fetchPaginatedPatients = async ({
  page = 1,
  limit = 10,
  search = "",
  dbName,
} = {}) => {
  return apiClient.get("/api/patients", {
    headers: { "db-name": dbName },
    params: { page, limit, search },
  });
};

export const listPatients = async ({ dbName }) => {
  return apiClient.get("/api/patients/list", {
    headers: { "db-name": dbName },
  });
};

export const createNewPatient = async ({ patientData, dbName }) => {
  return apiClient.post("/api/patients", patientData, {
    headers: { "db-name": dbName },
    withCredentials: true,
  });
};

export const updatePatient = async ({ id, patientData, dbName }) => {
  return apiClient.put(`/api/patients/${id}`, patientData, {
    headers: { "db-name": dbName },
  });
};

export const deletePatient = async ({ id, dbName }) => {
  return apiClient.delete(`/api/patients/${id}`, {
    headers: { "db-name": dbName },
  });
};
