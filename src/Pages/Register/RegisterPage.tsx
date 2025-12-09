import { Navigate, Outlet } from "react-router-dom";
import Path from "../../Routing/Constant/RoutePaths";

const RegisterPage = () => {
  const providerName = localStorage.getItem("providerName");

  if (providerName) {
    return <Navigate to={Path.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RegisterPage;
