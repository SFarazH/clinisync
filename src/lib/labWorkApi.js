import axios from "axios";

export const fetchPaginatedLabWorks = async ({
  page = 1,
  limit = 10,
  patientId = "",
  isReceived = "",
  paginate = true,
} = {}) => {
  const response = await axios.get("/api/lab-work", {
    params: { paginate, page, limit, patientId, isReceived },
  });
  return response.data; // returns { success, data, pagination }
};

export const listAllLabWorks = async () => {
  const response = await axios.get("/api/lab-work", {
    params: { paginate: false },
  });
  return response.data.data;
};

// ✅ Create new lab work
export const addNewLabWork = async (labWorkData) => {
  const response = await axios.post("/api/lab-work", labWorkData);
  return response.data.data;
};

// ✅ Update existing lab work
export const updateLabWork = async ({ id, labWorkData }) => {
  const response = await axios.put(`/api/lab-work/${id}`, labWorkData);
  return response.data.data;
};

// ✅ Mark lab work as complete (isReceived = true)
export const markLabWorkComplete = async (id) => {
  const response = await axios.patch(`/api/lab-work/${id}`);
  return response.data.data;
};

// ✅ Delete a lab work
export const deleteLabWork = async (id) => {
  const response = await axios.delete(`/api/lab-work/${id}`);
  return response.data;
};
