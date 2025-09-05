import { Navigate, Outlet } from 'react-router-dom';
import Path from '../Constant/RoutePaths.tsx';

const Private = () => {
  const isAuthenticated = true; // Replace with your actual authentication logic

  return isAuthenticated ? <Outlet /> : <Navigate to={Path.LOGIN} replace={true} />;
};

export default Private;
