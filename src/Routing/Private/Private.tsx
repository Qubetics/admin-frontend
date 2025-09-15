import { Outlet } from "react-router-dom";
import { useIsLoggedIn } from "../../Context/LoggedInContext.tsx";

const Private = () => {
  const {loading } = useIsLoggedIn();

  if (loading) return null;

  // return !authData ? <Outlet /> : <Navigate to={Path.LOGIN} replace={true} />;
  return <Outlet /> ;
};

export default Private;
