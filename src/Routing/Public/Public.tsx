import {Outlet } from 'react-router-dom';
import OnboardAuthLayout from '../../Common/Layouts/OnboardAuth/OnboardAuthLayout.tsx';

const Public = () => {

  return (
    <OnboardAuthLayout>
      <Outlet />
    </OnboardAuthLayout>
  );
};

export default Public;
