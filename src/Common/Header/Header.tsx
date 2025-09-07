import "./Header.scss";
import Logo from "../../assets/Logo.svg";
import { Link, useLocation } from "react-router-dom";
import Path from "../../Routing/Constant/RoutePaths";
import { env } from "../../Constant/envConstants";
import { useIsLoggedIn } from "../../Context/LoggedInContext";

interface Window {
  keplr?: any; // or type it properly if you know the exact type
}

function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === Path.LOGIN;
  const { authData, setAuthData } = useIsLoggedIn();

  const handleClick = async () => {
    if (!window.keplr) {
      console.error("Install Keplr Wallet extension");
      return;
    }

    const chainId = env.chainId;

    try {
      await window.keplr.disable(chainId);
      await window.keplr.enable(chainId);

      const offlineSigner = window.keplr.getOfflineSigner(chainId);
      const accounts = await offlineSigner.getAccounts();

      if (!accounts.length) {
        console.error("No accounts found in Keplr");
        return;
      }

      // const evmAddress = await showEVMAddress(accounts[0].address);
      // console.log("🚀 ~ connectWallet ~ evmAddress:", evmAddress)
      // const valoperAddress = await convertToValoperAddress(
      //   accounts[0].address
      // );

      setAuthData(accounts[0].address);
      console.log("Wallet connected successfully!");
    } catch (error) {
      console.error("Keplr login error:", error);
      console.error("Failed to connect Keplr: " + error.message);
    }
  };


  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };
  return (
    <>
      {isLoginPage ? (
        // Login Header
        <div className="header-main">
          <div className="header-main__bottom container">
            <div className="">
              <Link to={""}>
                <img src={Logo} alt="Logo" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <header className="header ">
          {/* Left Section: Logo + Title */}
          <div className="header__left">
            <img src={Logo} alt="logo" className="header__logo" />

            {/* Center Navigation */}
            <nav className="header__nav">
              <a href={Path.DASHBOARD} className={isActive(Path.DASHBOARD)}>Dashboard</a>
              <a href={Path.PLANS} className={isActive(Path.PLANS)}>Plans</a>
              <a href={Path.NODES} className={isActive(Path.NODES)}>Nodes</a>
            </nav>
          </div>

          {/* Right Section: Wallet */}
          {authData && <span style={{ backgroundColor: "white" }}>{authData.slice(0, 6)}...{authData.slice(-4)}</span>}
          <button className="header__wallet" onClick={handleClick}>Connect Wallet</button>
        </header>
      )}
    </>
  );
}

export default Header;
