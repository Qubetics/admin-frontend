import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import { envConstants } from "../../Constant/envConstants";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import { toast } from "react-toastify";
import { apiUrls } from "../../Constant/apiUrls";
import { computePubKey } from "../../utils/Helper/CommonHelper";
import { apiMethods } from "../../Constant/constants";

export default function Login() {
  const { authData,setAuthData } = useIsLoggedIn();
  const navigate = useNavigate();
  const useGetApi = useNetworkRequest();

  const handleClick = async () => {
    if (!window?.keplr) {
      toast.error("Install Keplr Wallet extension");
      return;
    }

    const chainId = envConstants.chainId;

    try {
      await window.keplr.disable(chainId);
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts?.length) {
        console.error("No accounts found in Keplr");
        return;
      }
      await handleSign(accounts[0]?.address);
    } catch (error: any) {
      return;
    }
  };

  const handleSign = async (address: string) => {
    try {
      const message = address;

      const { signature, pub_key } = await (
        window?.keplr as any
      )?.signArbitrary(envConstants.chainId, address, message);

      const pubKeyFromSignature = computePubKey(address, signature, message);

      if (!pubKeyFromSignature) {
        console.error("Could not compute public key from signature.");
        return;
      }
      const { success } = await useGetApi({
        endpoint: apiUrls.login,
        method: apiMethods.POST,
        body: {
          address,
          pubKey: pubKeyFromSignature,
          signature: { pub_key, signature },
        },
      });

      if (!success){
        toast.error("Failed to Login");
        return;
      } 

      setAuthData(address);
      navigate("/dashboard");
    } catch (error: any) {
      sessionStorage.clear();
      setAuthData("");
      console.error("Signing failed: " + error?.message);
    }
  };

  // Login form handling using formik
  return (
    
    <ButtonCustom
      label={authData ? "Logout":"Connect Keplr Wallet"}
      type="submit"
      tabIndex={3}
      onClick={() => handleClick()}
    />
  );
}
