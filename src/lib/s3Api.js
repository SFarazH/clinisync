import { getImage, s3Upload } from "@/services";

export const s3UploadApi = async (file) => {
  try {
    const res = await s3Upload(file);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const s3GetImage = async (key) => {
  try {
    const res = await getImage(key);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
