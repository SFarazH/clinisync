import { apiClient } from "@/utils";

export const getClinicsApi = async ({ dbName }) => {
  return apiClient.get("/api/clinic", {
    headers: { "db-name": dbName },
  });
};

export const getClinicById = async ({ id, dbName }) => {
  return apiClient.get(`/api/clinic/${id}`, {
    headers: { "db-name": dbName },
  });
};

export const addClinicApi = async ({ clinicData }) => {
  return apiClient.post("/api/clinic", clinicData, {
    headers: {
      dbName: "clinisync",
    },
  });
};

export const updateClinicApi = async ({ id, clinicData }) => {
  return apiClient.patch(`/api/clinic/${id}`, clinicData, {
    headers: {
      dbName: "clinisync",
    },
  });
};
