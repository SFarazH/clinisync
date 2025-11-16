import axios from "axios";

export const getUsers = async ({ role, dbName }) => {
  try {
    const response = await axios.get("/api/users/list", {
      params: role ? { role } : {},
      headers: { "db-name": dbName },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const getUsersByRole = async ({ dbName }) => {
  try {
    const response = await axios.get("/api/users/count", {
      headers: { "db-name": dbName },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};
