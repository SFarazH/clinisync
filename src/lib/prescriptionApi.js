import axios from "axios";

export const addPrescription = async (prescriptionData) => {
  const response = await axios.post("/api/prescriptions", prescriptionData);
  return response.data.data;
};

export const updatePrescription = async ({ id, prescriptionData }) => {
  const response = await axios.put(
    `/api/prescriptions/${id}`,
    prescriptionData
  );
  return response.data.data;
};

export const getPaginatedPrescriptions = async ({
  page = 1,
  limit = 10,
  search = "",
  startDate = "",
  endDate = "",
} = {}) => {
  const response = await axios.get("/api/prescriptions", {
    params: { page, limit, search, startDate, endDate },
  });
  return response.data; // returns { success, data, pagination }
};
