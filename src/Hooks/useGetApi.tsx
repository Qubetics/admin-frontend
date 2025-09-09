"use client";

import axios from "axios";
import { apiMethods } from "../Constant/constants";
import { envConstants } from "../Constant/envConstants";

const useNetworkRequest = () => {
  // const { updateToast } = useToast();

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

      return {
        success: false,
        message: error?.message,
      };
    }
  };

  return useGetApi;
};

export default useNetworkRequest;
