import axios from "axios";

export const s3UploadApi = async ({ formData, dbName }) => {
  const response = await axios.post("/api/s3", formData, {
    headers: { "db-name": dbName },
  });
  return response.data.data;
};

export const s3GetImage = async ({ key, dbName }) => {
  try {
    const res = await axios.get(`/api/s3/${key}`, {
      responseType: "arraybuffer",
      headers: { "db-name": dbName },
    });

    return {
      bufferResponse: res.data,
      contentType: res.headers["content-type"],
    };
  } catch (error) {
    console.error("Failed to fetch image from S3:", error);
    return null;
  }
};
