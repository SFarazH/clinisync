import { apiClient } from "@/utils";

export const fetchWhatsappMessagesByClinic = async ({ dbName }) => {
  return apiClient.get("/api/whatsapp/messages", {
    headers: { "db-name": dbName },
  });
};
