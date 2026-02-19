import axios from "axios";

export const getClinicsApi = async ({ dbName }) => {
  try {
    const response = await axios.get("/api/clinic", {
      headers: { "db-name": dbName },
    });
    return response.data.data;
  } catch (e) {
    return e;
  }
};

export const getClinicById = async ({ id, dbName }) => {
  try {
    const response = await axios.get(`/api/clinic/${id}`, {
      headers: { "db-name": dbName },
    });
    return response.data.data;
  } catch (e) {
    return e;
  }
};

export const addClinicApi = async ({ clinicData }) => {
  try {
    const response = await axios.post("/api/clinic", clinicData, {
      headers: {
        dbName: "clinisync",
      },
    });
    return response.data.data;
  } catch (error) {
    console.log(error, "in api");
    return error;
  }
};

export const updateClinicApi = async ({ id, clinicData }) => {
  try {
    const response = await axios.patch(`/api/clinic/${id}`, clinicData, {
      headers: {
        dbName: "clinisync",
      },
    });
    return response.data.data;
  } catch (error) {
    return e;
  }
};
