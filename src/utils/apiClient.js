import axios from "axios";
import { toast } from "sonner";

export const apiClient = axios.create();

apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.message) {
      toast.success(res.message, {
        style: {
          "--normal-bg":
            "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
          "--normal-text":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          "--normal-border":
            "light-dark(var(--color-green-600), var(--color-green-400))",
          borderRadius: "16px",
          fontSize: "15px",
        },
        className: "shadow-xl shadow-emerald-500/5",
      });
    }
    return res; // return only data
  },
  (error) => {
    const message = error?.response?.data?.message || "Something went wrong";

    toast.error(message, {
      // description: "A critical error occurred in the processing kernel.",
      style: {
        "--normal-bg":
          "color-mix(in oklab, var(--destructive) 10%, var(--background))",
        "--normal-text": "var(--destructive)",
        "--normal-border": "var(--destructive)",
        borderRadius: "16px",
        fontSize: "15px",
      },
      className: "shadow-xl shadow-destructive/5",
    });
    return Promise.reject(error);
  },
);
