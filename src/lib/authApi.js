import { apiClient } from "@/utils";

export const register = async ({ registerData, dbName }) => {
  return apiClient.post("/api/auth/register", registerData, {
    headers: { "db-name": dbName },
  });
};

export const logIn = async (loginData) => {
  return apiClient.post("/api/auth/login", loginData);
};

export const logOut = async () => {
  return apiClient.post("/api/auth/logout", {
    withCredentials: true,
  });
};

export const verifyUser = async () => {
  return apiClient.get("/api/auth/verify", {
    withCredentials: true,
  });
};

export const updateUserFunc = async ({ id, userData, dbName }) => {
  return apiClient.put(`/api/auth/${id}`, userData, {
    headers: { "db-name": dbName },
  });
};

export const addAdmin = async (clinicAdminData) => {
  return apiClient.post(`/api/auth/register/admin`, clinicAdminData);
};
