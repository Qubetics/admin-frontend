import "./Header.scss";
import Logo from "../../assets/Logo.svg";
import { Link, useLocation } from "react-router-dom";
import Path from "../../Routing/Constant/RoutePaths";

function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === Path.LOGIN;
  
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
          <button className="header__wallet">0x4655...a46</button>
        </header>
      )}
    </>
  );
}

export default Header;
