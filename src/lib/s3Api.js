import axios from "axios";

export const s3UploadApi = async (formData) => {
  const response = await axios.post("/api/s3", formData);
  return response.data.data;
};

export const s3GetImage = async (key) => {
  try {
    const res = await axios.get(`/api/s3/${key}`, {
      responseType: "arraybuffer",
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
