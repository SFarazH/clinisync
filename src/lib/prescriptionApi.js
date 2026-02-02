import axios from "axios";

export const addPrescription = async ({ prescriptionData, dbName }) => {
  const response = await axios.post("/api/prescriptions", prescriptionData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const updatePrescription = async ({ id, prescriptionData, dbName }) => {
  const response = await axios.put(
    `/api/prescriptions/${id}`,
    prescriptionData,
    { headers: { "db-name": dbName } }
  );
  return response.data.data;
};

export const getPaginatedPrescriptions = async ({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
  dbName,
} = {}) => {
  const response = await axios.get("/api/prescriptions", {
    headers: { "db-name": dbName },
    params: { page, limit, search, startDate, endDate },
  });
  return response.data; // returns { success, data, pagination }
};
