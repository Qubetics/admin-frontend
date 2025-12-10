import { Navigate, Outlet } from "react-router-dom";
import Path from "../../Routing/Constant/RoutePaths";

const RegisterPage = () => {
  const isExist = localStorage.getItem("isExist") === "true";
  
  if (isExist) {
    return <Navigate to={Path.DASHBOARD} replace />;
  }

  return <Outlet />;
};

export default RegisterPage;
