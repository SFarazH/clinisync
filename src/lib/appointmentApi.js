import { apiClient } from "@/utils";

export const fetchAppointments = async ({
  dbName,
  startDate,
  endDate,
  isPaginate,
  doctorId,
  page,
  limit,
  status,
} = {}) => {
  return apiClient.get("/api/appointments", {
    headers: { "db-name": dbName },
    params: {
      doctorId,
      startDate,
      endDate,
      isPaginate,
      page: isPaginate ? page : null,
      limit: isPaginate ? limit : null,
      status,
    },
  });
};

export const addAppointment = async ({ appointmentData, dbName }) => {
  return apiClient.post("/api/appointments", appointmentData, {
    headers: { "db-name": dbName },
  });
};

export const updateAppointment = async ({ id, appointmentData, dbName }) => {
  return apiClient.put(`/api/appointments/${id}`, appointmentData, {
    headers: { "db-name": dbName },
  });
};

export const deleteAppointment = async ({ id, dbName }) => {
  return apiClient.delete(`/api/appointments/${id}`, {
    headers: { "db-name": dbName },
  });
};
