import { Navigate, Outlet } from 'react-router-dom';
import Path from '../Constant/RoutePaths.tsx';
import OnboardAuthLayout from '../../Common/Layouts/OnboardAuth/OnboardAuthLayout.tsx';

const Public = () => {
  // Check if the user is authenticated by looking for the authorization token in local storage
  // const isAuthenticated = sessionStorage.getItem('authorizationToken');
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Navigate to={Path.DASHBOARD} replace={true} />;
  }

  return (
    <OnboardAuthLayout>
      <Outlet />
    </OnboardAuthLayout>
  );
};

export default Public;
