import { Outlet } from "react-router-dom";
import "./DashboardLayout.scss";
import Header from "../../Header/Header";
import Footer from "../../Footer/Footer";

function DashboardLayout() {
  return (
    <div className="dashLayout bgToMainDiv">
      <div className="dashLayout_header">
        <Header />
      </div>
      <div className="dashLayout_content container">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default DashboardLayout;
