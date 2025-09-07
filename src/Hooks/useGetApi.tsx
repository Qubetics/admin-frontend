import axios from "axios";
import { apiMethods } from "../Constant/constants";
import { env } from "../Constant/envConstants";

// Define method type

const useGetApi = async (
  url: String,
  method?: any,
  body?:any,
  additionalHeaders?: any,
  isIpfs: boolean = false
) : Promise<any> => {
  try {
    const config = {
      method: method || apiMethods.GET,
      url: env.baseApiUrls + url,
      data: body || undefined,
      withCredentials: !isIpfs,
      headers: additionalHeaders,
    };

    const result = await axios(config);
    return result;
  } catch (error: any) {
    const { response } = error;
    const error_message = response?.data?.message || error?.message;
    console.log("🚀 ~ useGetApi ~ error_message:", error_message)
  }
};

export default useGetApi;
