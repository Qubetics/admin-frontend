"use client";

import axios from "axios";
import { apiMethods } from "../Constant/constants";
import { envConstants } from "../Constant/envConstants";
import { useIsLoggedIn } from "../Context/LoggedInContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useNetworkRequest = () => {
  const { setAuthData } = useIsLoggedIn();
  const navigate = useNavigate();

  const useGetApi = async ({
    endpoint,
    method,
    body,
    url,
  }: // checktoast,
  any) => {
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
      // if (checktoast) {
      //   const hideOn = ![
      //     "identity.user.already_registered",
      //     "identity.user.is_pending",
      //   ].includes(error?.message);
      //   hideOn && updateToast("error", error?.message);
      // }
      if (error?.response?.status === 401) {
        localStorage.removeItem("authData");
        sessionStorage.clear();
        setAuthData("");
        toast.error("Unauthorized Access", { toastId: "unauthorized" });
        navigate("/landing");
        return {
          success: false,
          message: "Session expired. Please log in again.",
        };
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
