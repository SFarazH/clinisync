import { apiClient } from "@/utils";

export const getUsers = async ({ role, dbName }) => {
  return apiClient.get("/api/users/list", {
    params: role ? { role } : {},
    headers: { "db-name": dbName },
  });
};

export const getUsersByRole = async ({ dbName }) => {
  return apiClient.get("/api/users/count", {
    headers: { "db-name": dbName },
  });
};
