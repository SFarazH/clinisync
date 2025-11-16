import axios from "axios";

export const fetchPaginatedLabWorks = async ({
  page = 1,
  limit = 10,
  patientId = "",
  isReceived = "",
  paginate = true,
  startDate = null,
  endDate = null,
  dbName,
} = {}) => {
  const response = await axios.get("/api/lab-work", {
    headers: { "db-name": dbName },
    params: {
      paginate,
      page,
      limit,
      patientId,
      isReceived,
      startDate,
      endDate,
    },
  });
  return response.data; // returns { success, data, pagination }
};

export const listAllLabWorks = async ({ dbName }) => {
  const response = await axios.get("/api/lab-work", {
    headers: { "db-name": dbName },
    params: { paginate: false },
  });
  return response.data.data;
};

// ✅ Create new lab work
export const addNewLabWork = async ({ labWorkData, dbName }) => {
  const response = await axios.post("/api/lab-work", labWorkData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

// ✅ Update existing lab work
export const updateLabWork = async ({ id, labWorkData, dbName }) => {
  const response = await axios.put(`/api/lab-work/${id}`, labWorkData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

// ✅ Mark lab work as complete (isReceived = true)
export const markLabWorkComplete = async ({ id, dbName }) => {
  const response = await axios.patch(
    `/api/lab-work/${id}`,
    {},
    {
      headers: { "db-name": dbName },
    }
  );
  return response.data.data;
};

// ✅ Delete a lab work
export const deleteLabWork = async ({ id, dbName }) => {
  const response = await axios.delete(`/api/lab-work/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};
