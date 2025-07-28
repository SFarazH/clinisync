import axios from "axios";

export const fetchAppointments = async ({
  startDate,
  endDate,
  isPaginate,
  doctorId,
  page,
  limit,
  status,
} = {}) => {
  const response = await axios.get("/api/appointments", {
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

export const addAppointment = async (appointmentData) => {
  const response = await axios.post("/api/appointments", appointmentData);
  return response.data.data;
};

export const updateAppointment = async ({ id, appointmentData }) => {
  const response = await axios.put(`/api/appointments/${id}`, appointmentData);
  return response.data.data;
};

export const deleteAppointment = async (id) => {
  const response = await axios.delete(`/api/appointments/${id}`);
  return response.data;
};
