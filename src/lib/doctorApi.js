import axios from "axios";

export const fetchDoctors = async ({ getUnassigned }) => {
  const response = await axios.get("/api/doctors", {
    params: getUnassigned === true ? { getUnassigned: true } : {},
  });

  return response.data.data;
};

export const addNewDoctor = async ({ doctorData }) => {
  const response = await axios.post("/api/doctors", doctorData);
  return response.data.data;
};

export const updateDoctor = async ({ id, doctorData }) => {
  const response = await axios.put(`/api/doctors/${id}`, doctorData);
  return response.data.data;
};

export const deleteDoctor = async ({ id }) => {
  const response = await axios.delete(`/api/doctors/${id}`, {});
  return response.data;
};

export const fetchDoctorById = async ({ id }) => {
  const response = await axios.get(`/api/doctors/${id}`, {});
  return response.data;
};
