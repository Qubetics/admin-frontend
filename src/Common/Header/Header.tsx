import "./Header.scss";
import Logo from "../../assets/Logo.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Path from "../../Routing/Constant/RoutePaths";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import { useState } from "react";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import { copyToClipboard } from "../../utils/Helper/CommonHelper";
import { CopyIcon } from "../../assets/StoreAsset/StoreAsset";
import Login from "../../Pages/Login/Login";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === Path.LANDING;
  console.log(isLoginPage,"isLoginPage");
  const { authData, setAuthData } = useIsLoggedIn();
  const useGetApi = useNetworkRequest();
  const navigate = useNavigate();

  // Function to check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const onLogout = async () => {
    const { success } = await useGetApi({ endpoint: apiUrls.logout });
    if (!success) return;
    navigate("/landing");
    localStorage.clear();
    sessionStorage.clear();
    setAuthData("");
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
            <div>
              <Login />
            </div>
          </div>
        </div>
      ) : (
        <header className="header">
          <div className="header__container">
            {/* Left Section: Logo + Title */}
            <div className="header__left">
              <img src={Logo} alt="logo" className="header__logo" />

              {/* Navigation */}
              <nav className={`header__nav ${isMenuOpen ? "active" : ""}`}>
                <a href={Path.DASHBOARD} className={isActive(Path.DASHBOARD)}>
                  Dashboard
                </a>
                <a href={Path.PLANS} className={isActive(Path.PLANS)}>
                  Plans
                </a>
                <a href={Path.NODES} className={isActive(Path.NODES)}>
                  Nodes
                </a>
              </nav>
            </div>

            {/* Right Section: Wallet */}
            <div className={`header__right ${isMenuOpen ? "active" : ""}`}>
              {authData && (
                <span
                  className="header__wallet-address customButton"
                  onClick={() => copyToClipboard(authData)}
                >
                  <span>
                    {authData.slice(0, 6)}...{authData.slice(-4)}
                  </span>{" "}
                  <CopyIcon />
                </span>
              )}
              {/* to be implemented */}
              {/* <span className="customButton">100.00 tics</span> */} 
              <span className="customButton" onClick={() => onLogout()}>
                Logout
              </span>
              {/* <button className="header__wallet" onClick={handleClick}>
                {authData ? "Connected" : "Connect Wallet"}
              </button>
             */}
              {/* Mobile Menu Toggle Button */}
              <button
                className={`header__menu-toggle ${isMenuOpen ? "open" : ""}`}
                onClick={toggleMenu}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

export default Header;
