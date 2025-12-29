"use client";

import axios from "axios";
import { apiMethods } from "../Constant/constants";
import { envConstants } from "../Constant/envConstants";
import { useIsLoggedIn } from "../Context/LoggedInContext";
import { toast } from "react-toastify";

const useNetworkRequest = () => {
  const { logout } = useIsLoggedIn();

  const useGetApi = async ({ endpoint, method, body, url }: any) => {
    try {
      const response = await axios({
        method: method || apiMethods.GET,
        url: url ? url : envConstants.baseApiUrls + endpoint,
        data: body || undefined,
        withCredentials: true,
      });

      return {
        success: true,
        data: response.data,
        headers: { totalCount: response.headers["total"] },
        message: response.data.message || "Success",
      };
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.error("Unauthorized Access", { toastId: "unauthorized" });
        logout();
        return {
          success: false,
          message: "Session expired. Please log in again.",
        };
      }
      if (error?.response?.status === 429) {
        toast.error("Too many requests. Please try again later.", { toastId: "too-many-requests" });
      }
      return {
        success: false,
        message: error?.response?.data?.message,
        data: error?.response?.data,
      };
    }
  };

  return useGetApi;
};

export default useNetworkRequest;
