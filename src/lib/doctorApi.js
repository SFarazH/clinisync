import { apiClient } from "@/utils";

export const fetchDoctors = async ({ dbName, getUnassigned }) => {
  return apiClient.get("/api/doctors", {
    headers: { "db-name": dbName },
    params: getUnassigned === true ? { getUnassigned: true } : {},
  });
};

export const addNewDoctor = async ({ doctorData, dbName }) => {
  return apiClient.post("/api/doctors", doctorData, {
    headers: { "db-name": dbName },
  });
};

export const updateDoctor = async ({ id, doctorData, dbName }) => {
  return apiClient.put(`/api/doctors/${id}`, doctorData, {
    headers: { "db-name": dbName },
  });
};

export const deleteDoctor = async ({ id, dbName }) => {
  return apiClient.delete(`/api/doctors/${id}`, {
    headers: { "db-name": dbName },
  });
};

export const fetchDoctorById = async ({ id, dbName }) => {
  return apiClient.get(`/api/doctors/${id}`, {
    headers: { "db-name": dbName },
  });
};
