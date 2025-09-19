import { Navigate, Outlet } from "react-router-dom";
import { useIsLoggedIn } from "../../Context/LoggedInContext.tsx";
import Path from "../Constant/RoutePaths.tsx";
import Loader from "../../Common/Loader/Loader.tsx";

const Private = () => {
  const {loading,authData } = useIsLoggedIn();

  if (loading) return <Loader/>;

  return authData!="" ? <Outlet /> : <Navigate to={Path.LANDING} replace={true} />;
};

export default Private;
