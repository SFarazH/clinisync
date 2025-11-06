import axios from "axios";

export const fetchPaginatedPatients = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const response = await axios.get("/api/patients", {
    params: { page, limit, search },
  });
  return response.data; // returns { success, data, pagination }
};

export const listPatients = async () => {
  const response = await axios.get("/api/patients/list");
  return response.data.data;
};

export const createNewPatient = async (patientData) => {
  const response = await axios.post("/api/patients", patientData, {
    withCredentials: true,
  });
  return response.data.data;
};

export const updatePatient = async ({ id, patientData }) => {
  const response = await axios.put(`/api/patients/${id}`, patientData);
  return response.data.data;
};

export const deletePatient = async (id) => {
  const response = await axios.delete(`/api/patients/${id}`);
  return response.data;
};
