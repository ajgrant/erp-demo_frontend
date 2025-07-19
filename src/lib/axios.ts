import axios from "axios";
import { getSession } from "next-auth/react";
import { toast } from "sonner";
import { handleApiError } from "./handleApiError";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_URL,
});

//request interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.jwt) {
    config.headers.Authorization = `Bearer ${session?.user?.jwt}`;
  }
  return config;
});

//response interceptor to handle global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    toast.error(handleApiError(error));
    return Promise.reject(error);
  }
);

export default axiosInstance;
