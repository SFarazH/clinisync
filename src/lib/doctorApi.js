import axios from "axios";

export const fetchDoctors = async ({ dbName, getUnassigned }) => {
  const response = await axios.get(
    "/api/doctors",
    { headers: { "db-name": dbName } },
    {
      params: getUnassigned === true ? { getUnassigned: true } : {},
    }
  );

  return response.data.data;
};

export const addNewDoctor = async ({ dbName, doctorData }) => {
  const response = await axios.post(
    "/api/doctors",
    { headers: { "db-name": dbName } },
    doctorData
  );
  return response.data.data;
};

export const updateDoctor = async ({ id, doctorData, dbName }) => {
  const response = await axios.put(
    `/api/doctors/${id}`,
    { headers: { "db-name": dbName } },
    doctorData
  );
  return response.data.data;
};

export const deleteDoctor = async ({ id, dbName }) => {
  const response = await axios.delete(`/api/doctors/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};

export const fetchDoctorById = async ({ id, dbName }) => {
  const response = await axios.get(`/api/doctors/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};
