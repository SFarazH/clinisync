import axios from "axios";

export const getUsers = async (role) => {
  try {
    const response = await axios.get("/api/users/list", {
      params: role ? { role } : {},
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const getUsersByRole = async () => {
  try {
    const response = await axios.get("/api/users/count");
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};
