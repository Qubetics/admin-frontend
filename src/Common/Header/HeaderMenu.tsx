import { Link } from "react-router-dom";
import "./Header.scss"

// import MobLogo from '../../assets/MobLogo.svg';
function HeaderMenu() {
  return (
    <>
      <ul className="mob__List">
        <li value="Dashboard">
          <Link to={""}>Dashboard</Link>
        </li>
      </ul>
    </>
  );
}

export default HeaderMenu;
