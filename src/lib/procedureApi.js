import { apiClient } from "@/utils";

export const fetchProceudres = async ({ dbName }) => {
  return apiClient.get("/api/procedures", {
    headers: { "db-name": dbName },
  });
};

export const addProcedure = async ({ procedureData, dbName }) => {
  return apiClient.post("/api/procedures", procedureData, {
    headers: { "db-name": dbName },
  });
};

export const updateProcedure = async ({ id, procedureData, dbName }) => {
  return apiClient.put(`/api/procedures/${id}`, procedureData, {
    headers: { "db-name": dbName },
  });
};

export const deleteProcedure = async ({ id, dbName }) => {
  return apiClient.delete(`/api/procedures/${id}`, {
    headers: { "db-name": dbName },
  });
};
