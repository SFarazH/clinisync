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
