import axios from "axios";

export const fetchPaginatedPatients = async ({
  page = 1,
  limit = 10,
  search = "",
  dbName,
} = {}) => {
  const response = await axios.get("/api/patients", {
    headers: { "db-name": dbName },
    params: { page, limit, search },
  });
  return response.data; // returns { success, data, pagination }
};

export const listPatients = async ({ dbName }) => {
  const response = await axios.get("/api/patients/list", {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const createNewPatient = async ({ patientData, dbName }) => {
  const response = await axios.post(
    "/api/patients",
    patientData,
    { headers: { "db-name": dbName } },
    {
      withCredentials: true,
    }
  );
  return response.data.data;
};

export const updatePatient = async ({ id, patientData, dbName }) => {
  const response = await axios.put(`/api/patients/${id}`, patientData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const deletePatient = async ({ id, dbName }) => {
  const response = await axios.delete(`/api/patients/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};
