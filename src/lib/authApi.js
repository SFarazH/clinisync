import axios from "axios";

export const register = async (registerData) => {
  const response = await axios.post("/api/auth/register", registerData);
  return response.data;
};

export const logIn = async (loginData) => {
  const response = await axios.post("/api/auth/login", loginData);
  return response.data;
};

export const logOut = async () => {
  try {
    const response = await axios.post("/api/auth/logout", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const verifyUser = async () => {
  try {
    const response = await axios.get("/api/auth/verify", {
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    console.error(e);
    return { success: false };
  }
};

export const updateUserFunc = async ({ id, userData }) => {
  try {
    const response = await axios.put(`/api/auth/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const addClinicAdmin = async (clinicAdminData) => {
  try {
    const response = await axios.post(
      `/api/auth/register/admin`,
      clinicAdminData
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};
