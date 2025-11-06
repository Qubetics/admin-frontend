import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./Header.scss";
import Logo from "../../assets/Logo.svg";
import mobLogo from "../../assets/MobileLogo.svg";
import Path from "../../Routing/Constant/RoutePaths";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import { envConstants } from "../../Constant/envConstants";
import { apiMethods } from "../../Constant/constants";
import { api, computePubKey, formatBalance, truncateValue } from "../../utils/Helper/CommonHelper";
import ButtonCustom from "../ButtonCustom/ButtonCustom";
import CopyText from "../Copy/CopyText";
import useCurrentWidth from "../../Hooks/useCurrentWidth";

// Types
interface KeplrWindow extends Window {
  keplr?: {
    enable: (chainId: string) => Promise<void>;
    disable: (chainId: string) => Promise<void>;
    getOfflineSigner: (chainId: string) => {
      getAccounts: () => Promise<Array<{ address: string }>>;
    };
    signArbitrary: (
      chainId: string,
      address: string,
      message: string
    ) => Promise<{
      signature: string;
      pub_key: any;
    }>;
  };
}

declare const window: KeplrWindow;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { authData, setAuthData } = useIsLoggedIn();
  const useGetApi = useNetworkRequest();
  const menuRef = useRef<HTMLDivElement>(null);
  // function to logo resize
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const width = useCurrentWidth();

  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".hamburger")
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isActive = useCallback(
    (path: string): string => {
      return location.pathname === path ? "active" : "";
    },
    [location.pathname]
  );

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const fetchAccountBalance = useCallback(async (address: string): Promise<void> => {
    if (!address) {
      console.warn("No address provided for balance fetch");
      return;
    }

    setIsLoading(true);
    try {
      const uri = `${envConstants.swagger_api}/cosmos/bank/v1beta1/balances/${address}`;
      const response = await api(uri);

      if (response?.balances?.[0]?.amount) {
        const balanceAmount = Number(response.balances[0].amount) / 1e18;
        setBalance(balanceAmount);
      } else {
        setBalance(0);
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
      setBalance(0);
      toast.error("Failed to fetch account balance");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    localStorage.clear();
    sessionStorage.clear();
    setAuthData("");
    setBalance(0);
    setIsLoading(true);
    try {
      const { success } = await useGetApi({
        endpoint: apiUrls.logout,
      });
      if (!success) {
        toast.error("Failed to logout. Please try again.");
        return;
      }
      localStorage.clear();
      sessionStorage.clear();
      setAuthData("");
      setBalance(0);

      navigate("/landing");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    } finally {
      setIsLoading(false);
    }
  }, [useGetApi, navigate, setAuthData, isLoading]);

  const connectKeplr = useCallback(async (): Promise<string | null> => {
    if (!window.keplr) {
      if (/Android/i.test(navigator.userAgent)) {
        window.location.href = "intent://wc#Intent;package=com.chainapsis.keplr;scheme=keplrwallet;end;";
      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = "keplrwallet://";
      } else {
        toast.error("Install Keplr extension first");
      }
      return null;
    }

    const chainId = envConstants.chainId;
    if (!chainId) {
      toast.error("Chain ID not configured");
      return null;
    }

    try {
      // await window.keplr!.disable(chainId);
      await window.keplr!.enable(chainId);

      const offlineSigner = window.keplr!.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts?.length) {
        toast.error("No accounts found in Keplr wallet");
        return null;
      }

      return accounts[0].address;
    } catch (error: any) {
      console.error("Keplr connection error:", error);

      if (error?.message?.includes("rejected")) {
        toast.error("Connection rejected by user");
      } else if (error?.message?.includes("not found")) {
        toast.error("Chain not found in Keplr");
      } else {
        toast.error("Failed to connect to Keplr wallet");
      }
      return null;
    }
  }, []);

  const signMessage = useCallback(
    async (address: string): Promise<boolean> => {
      if (!window?.keplr || !address) return false;

      try {
        const message = address;
        const chainId = envConstants.chainId;

        const { signature, pub_key } = await window.keplr.signArbitrary(chainId, address, message);

        if (!signature || !pub_key) {
          toast.error("Failed to sign message");
          return false;
        }

        const pubKeyFromSignature = computePubKey(address, signature, message);

        if (!pubKeyFromSignature) {
          toast.error("Could not compute public key from signature");
          return false;
        }
        const { success, message: errormassage } = await useGetApi({
          endpoint: apiUrls.login,
          method: apiMethods.POST,
          body: {
            address,
            pubKey: pubKeyFromSignature,
            signature: { pub_key, signature },
          },
        });

        if (!success) {
          if (errormassage.includes("role")) {
            toast.error("Role information missing or invalid");
          } else {
            toast.error("Authentication failed. Please try again.");
          }
          setAuthData(address);
          navigate(Path.SERVICE_PROVIDER);
          return false;
        }
        setAuthData(address);
        navigate("/dashboard");
        return true;
      } catch (error: any) {
        if (error?.message?.includes("rejected")) {
          toast.error("Signing rejected by user");
        } else {
          toast.error("Failed to sign message");
        }

        sessionStorage.clear();
        setAuthData("");
        return false;
      }
    },
    [useGetApi, navigate, setAuthData]
  );

  const handleWalletConnect = useCallback(async (): Promise<void> => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const address = await connectKeplr();
      if (address) {
        await signMessage(address);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [connectKeplr, signMessage, isConnecting]);

  useEffect(() => {
    if (authData) {
      fetchAccountBalance(authData);
    } else {
      setBalance(0);
    }
  }, [authData]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { path: Path.DASHBOARD, label: "Dashboard" },
    { path: Path.PLANS, label: "Plans" },
    { path: Path.NODES, label: "Nodes" },
  ];
  const hasHeaderActions = location.pathname !== "/";
  const hideNavItems = location.pathname === Path.SERVICE_PROVIDER;

  return (
    <div className='header-main'>
      <div className='header-main__bottom container'>
        <div className='header__left'>
          <Link to={Path.LANDING}>
            {isMobile ? (
              <img src={mobLogo} alt='Mobile Logo' className='mobile-logo' />
            ) : (
              <img src={Logo} alt='Web Logo' className='web-logo' />
            )}
          </Link>
        </div>
        {hasHeaderActions && authData && (
          <div className={`header__details ${isMenuOpen ? "active" : ""}`} ref={menuRef}>
            {authData && !hideNavItems && (
              <>
                <nav className={`header__nav ${isMenuOpen ? "active" : ""}`}>
                  {navigationItems.map(({ path, label }) => (
                    <Link key={path} to={path} className={isActive(path)} onClick={() => setIsMenuOpen(false)}>
                      {label}
                    </Link>
                  ))}
                  <>
                    {/* <div className="responsiveDrawerData">
              <span className="customButton balance-display">
                {formatBalance(balance)} TICS
              </span>
              <div className="header__wallet-address customButton">
                <div>{truncateValue(authData)}</div>
                <CopyText text={authData} />
              </div>
              <ButtonCustom
                // className="web-logout"
                // label={isConnecting ? "Logging out..." : "Logout"}
                label='logout'
                onClick={handleLogout}
                // disabled={isLoading}
                type="button"
              />
              </div> */}
                  </>
                </nav>
                <div className='responsiveDrawerData'>
                  <span className='customButton balance-display'>{formatBalance(balance)} TICS</span>
                  <div className='header__wallet-address customButton'>
                    <div>{truncateValue(authData)}</div>
                    <CopyText text={authData} />
                  </div>
                  <ButtonCustom
                    className='mobile-logout'
                    label={isConnecting ? "Logging out..." : "Logout"}
                    onClick={handleLogout}
                    disabled={isLoading}
                    type='button'
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Right Section */}
        <div className={`header__right ${isMenuOpen ? "active" : ""}`}>
          {!authData ? (
            <ButtonCustom
              label={isConnecting ? "Connecting..." : "Connect Keplr Wallet"}
              type='button'
              tabIndex={3}
              onClick={handleWalletConnect}
              disabled={isConnecting}
            />
          ) : (
            width > 991 && (
              <>
                <span className='customButton balance-display'>{formatBalance(balance)} TICS</span>
                <div className='header__wallet-address customButton'>
                  <div>{truncateValue(authData)}</div>
                  <CopyText text={authData} />
                </div>
                <ButtonCustom
                  className='web-logout'
                  label={isConnecting ? "Logging out..." : "Logout"}
                  onClick={handleLogout}
                  disabled={isLoading}
                  type='button'
                />
              </>
            )
          )}
        </div>

        {hasHeaderActions && authData && (
          <button className={`hamburger ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu} aria-label='Toggle menu'>
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
