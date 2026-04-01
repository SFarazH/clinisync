import { apiClient } from "@/utils";

export const fetchPaginatedMedicines = async ({
  page = 1,
  limit = 20,
  search = "",
} = {}) => {
  return apiClient.get("/api/medicines", {
    headers: { "db-name": "clinisync" },
    params: { page, limit, search },
  });
};
