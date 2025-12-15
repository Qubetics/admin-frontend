import { Navigate } from "react-router-dom";
import Path from "./Constant/RoutePaths.tsx";
import DashboardLayout from "../Common/Layouts/DashboardLayout/DashboardLayout";
import Plans from "../Pages/Plans/Plans.tsx";
import Node from "../Pages/Node/Node.tsx";
import LandingPage from "../Pages/LandingPage/LandingPage.tsx";
import Dashboard from "../Pages/Dashboard/Dashboard.tsx";
import ServiceProvider from "../Pages/ServiceProvider/ServiceProvider.tsx";
import RegisterPage from "../Pages/Register/RegisterPage.tsx";

export default function PAGES() {
  return {
    PUBLIC_PAGES: [
      { path: Path.LANDING, element: <LandingPage /> },
      {
        path: Path.SERVICE_PROVIDER,
        element: <RegisterPage />,
        children: [
          {
            path: Path.SERVICE_PROVIDER,
            element: <ServiceProvider />,
          },
        ],
      },
    ],

    PRIVATE_PAGES: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to={Path.DASHBOARD} replace /> },
          { path: Path.LANDING, element: <LandingPage /> },
          { path: Path.DASHBOARD, element: <Dashboard /> },
          { path: Path.PLANS, element: <Plans /> },
          { path: Path.NODES, element: <Node /> },
        ],
      },
    ],
  };
}
