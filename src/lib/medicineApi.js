import axios from "axios";

export const fetchPaginatedMedicines = async ({
  page = 1,
  limit = 20,
  search = "",
} = {}) => {
  const response = await axios.get("/api/medicines", {
    headers: { "db-name": "clinisync" },
    params: { page, limit, search },
  });

  return response.data; // { success, data, pagination }
};
