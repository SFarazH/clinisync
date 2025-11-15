import axios from "axios";

export const getClinicConfig = async ({ dbName }) => {
  const response = await axios.get("/api/app-settings", {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const updateClinicConfig = async (configData, dbName) => {
  const response = await axios.post("/api/app-settings", configData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};
