import axios from "axios";

export const fetchProceudres = async () => {
  const response = await axios.get("/api/procedures");
  return response.data.data;
};

export const addProcedure = async (procedureData) => {
  const response = await axios.post("/api/procedures", procedureData);
  return response.data.data;
};

export const updateProcedure = async ({ id, procedureData }) => {
  const response = await axios.put(`/api/procedures/${id}`, procedureData);
  return response.data.data;
};

export const deleteProcedure = async (id) => {
  const response = await axios.delete(`/api/procedures/${id}`);
  return response.data;
};
