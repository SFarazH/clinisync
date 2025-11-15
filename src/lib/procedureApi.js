import axios from "axios";

export const fetchProceudres = async ({ dbName }) => {
  const response = await axios.get("/api/procedures", {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const addProcedure = async ({ procedureData, dbName }) => {
  const response = await axios.post("/api/procedures", procedureData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const updateProcedure = async ({ id, procedureData, dbName }) => {
  const response = await axios.put(`/api/procedures/${id}`, procedureData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const deleteProcedure = async ({ id, dbName }) => {
  const response = await axios.delete(`/api/procedures/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};
