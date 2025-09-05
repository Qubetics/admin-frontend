import { Outlet } from 'react-router-dom';
import './DashboardLayout.scss';
import Header from '../../Header/Header';

function DashboardLayout() {
  return (
    <div className="dashLayout">
      <div className="dashLayout_header">
        <Header />
      </div>
      <div className="dashLayout_content">
       
        <div className="dashLayout_content_body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
