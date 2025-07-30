import axios from "axios";

export const register = async () => {};

export const logIn = async (loginData) => {
  const response = await axios.post("/api/auth/login", loginData);
  return response.data;
};
export const logOut = async () => {};

export const verifyUser = async () => {
  try {
    const response = await axios.get("/api/auth/verify", {
      withCredentials: true,
    });
    return response.data;
  } catch (e) {
    console.error;
    return { success: false };
  }
};
