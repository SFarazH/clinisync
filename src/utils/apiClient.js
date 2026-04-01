import axios from "axios";
import { toast } from "react-hot-toast";

export const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.message) {
      toast.success(res.message, {
        style: {
          background: "green",
          color: "#fff",
        },
      });
    }
    return res; // return only data
  },
  (error) => {
    const message = error?.response?.data?.message || "Something went wrong";

    toast.error(message);

    return Promise.reject(error);
  },
);
