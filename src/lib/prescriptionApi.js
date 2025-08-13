import axios from "axios";

export const addPrescription = async (prescriptionData) => {
  const response = await axios.post("/api/prescriptions", prescriptionData);
  return response.data.data;
};
