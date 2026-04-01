import axios from "axios";
import { apiClient } from "@/utils";

export const s3UploadApi = async ({ formData, dbName }) => {
  return apiClient.post("/api/s3", formData, {
    headers: { "db-name": dbName },
  });
};

export const s3GetImage = async ({ key, dbName }) => {
  const res = await axios.get(`/api/s3/${key}`, {
    responseType: "arraybuffer",
    headers: { "db-name": dbName },
  });

  return {
    bufferResponse: res.data,
    contentType: res.headers["content-type"],
  };
};
