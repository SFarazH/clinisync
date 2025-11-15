import axios from "axios";

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
  const response = await axios.get("/api/appointments", {
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
  if (isPaginate) {
    return response.data;
  } else {
    return response.data.data;
  }
};

export const addAppointment = async ({ appointmentData, dbName }) => {
  const response = await axios.post("/api/appointments", appointmentData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const updateAppointment = async ({ id, appointmentData, dbName }) => {
  console.log(id, "id from api");
  console.log(appointmentData, "payload from api");
  const response = await axios.put(`/api/appointments/${id}`, appointmentData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const deleteAppointment = async ({ id, dbName }) => {
  const response = await axios.delete(`/api/appointments/${id}`, {
    headers: { "db-name": dbName },
  });
  return response.data;
};
