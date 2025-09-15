import { Navigate, Outlet } from "react-router-dom";
import Path from "../Constant/RoutePaths.tsx";
import { useIsLoggedIn } from "../../Context/LoggedInContext.tsx";

const Private = () => {
  const { authData, loading } = useIsLoggedIn();

  if (loading) return null;

  // return !authData ? <Outlet /> : <Navigate to={Path.LOGIN} replace={true} />;
  return <Outlet /> ;
};

export default Private;
