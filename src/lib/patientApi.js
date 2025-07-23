import axios from "axios";

export const fetchPatients = async () => {
  const response = await axios.get("/api/patients");
  return response.data.data;
};

export const createNewPatient = async (patientData) => {
  const response = await axios.post("/api/patients", patientData);
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
