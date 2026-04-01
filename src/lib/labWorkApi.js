import { apiClient } from "@/utils";

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
  return apiClient.get("/api/lab-work", {
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
};

export const listAllLabWorks = async ({ dbName }) => {
  return apiClient.get("/api/lab-work", {
    headers: { "db-name": dbName },
    params: { paginate: false },
  });
};

// ✅ Create new lab work
export const addNewLabWork = async ({ labWorkData, dbName }) => {
  return apiClient.post("/api/lab-work", labWorkData, {
    headers: { "db-name": dbName },
  });
};

// ✅ Update existing lab work
export const updateLabWork = async ({ id, labWorkData, dbName }) => {
  return apiClient.put(`/api/lab-work/${id}`, labWorkData, {
    headers: { "db-name": dbName },
  });
};

// ✅ Mark lab work as complete (isReceived = true)
export const markLabWorkComplete = async ({ id, dbName }) => {
  return apiClient.patch(`/api/lab-work/${id}`, {}, {
    headers: { "db-name": dbName },
  });
};

// ✅ Delete a lab work
export const deleteLabWork = async ({ id, dbName }) => {
  return apiClient.delete(`/api/lab-work/${id}`, {
    headers: { "db-name": dbName },
  });
};
