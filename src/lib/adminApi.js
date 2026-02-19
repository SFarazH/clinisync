import axios from "axios";

export const getUnallottedUsersListApi = async () => {
  try {
    const response = await axios.get(`/api/admin/list`, {
      headers: { "db-name": "clinisync" },
    });
    return response.data.data;
  } catch (e) {
    return e;
  }
};
