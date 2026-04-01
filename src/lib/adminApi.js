import { apiClient } from "@/utils";

export const getUnallottedUsersListApi = async () => {
  return apiClient.get(`/api/admin/list`, {
    headers: { "db-name": "clinisync" },
  });
};
