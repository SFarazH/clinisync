import axios from "axios";

export const getClinicConfig = async () => {
  const response = await axios.get("/api/app-settings");
  return response.data.data;
};

export const updateClinicConfig = async (configData) => {
  const response = await axios.post("/api/app-settings", configData);
  return response.data.data;
};
