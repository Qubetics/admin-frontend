import { useNavigate } from "react-router-dom";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import { envConstants } from "../../Constant/envConstants";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import "./Login.scss";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";

export default function Login() {
  const { authData, setAuthData } = useIsLoggedIn();
  const navigate = useNavigate();
  const useGetApi = useNetworkRequest();

  const handleClick = async () => {
    console.log("sfasdf", authData, "authData");

    if (!window?.keplr) {
      console.error("Install Keplr Wallet extension");
      return;
    }

    const chainId = envConstants.chainId;
    console.log("🚀 ~ handleClick ~ chainId:", chainId);

    try {
      await window.keplr.disable(chainId);
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts.length) {
        console.error("No accounts found in Keplr");
        return;
      }
      setAuthData(accounts[0].address);

      const payload: any = { address: accounts[0]?.address };

      await login();

      navigate("/dashboard");
    } catch (error: any) {
      return;
    }
  };

  const login = async () => {
    const { success, data } = await useGetApi({ endpoint: apiUrls.login });

    if (!success) return;
    console.log(data);
  };

  // Login form handling using formik
  return (
    <div className="loginForm">
      <h3>Login</h3>
      <div className="connectBtn">
        <ButtonCustom
          label="Connect Wallet"
          type="submit"
          tabIndex={3}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}
