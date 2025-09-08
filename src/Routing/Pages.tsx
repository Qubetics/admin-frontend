import React from "react";
import { Navigate } from "react-router-dom";
import Path from "./Constant/RoutePaths.tsx";
import Login from "../Pages/Login/Login.tsx";
import DashboardLayout from "../Common/Layouts/DashboardLayout/DashboardLayout";
import Plans from "../Pages/Plans/Plans.tsx";
import Node from "../Pages/Node/Node.tsx";

const Dashboard = React.lazy(() => import("../Pages/Dashboard/Dashboard.tsx"));

// Pages function returning public and private pages
export default function PAGES() {
  return {
    // Public pages - accessible without authentication
    PUBLIC_PAGES: [{ path: Path.LOGIN, element: <Login /> }],

    // Private pages - require authentication
    PRIVATE_PAGES: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to={Path.DASHBOARD} replace /> },
          { path: Path.DASHBOARD, element: <Dashboard /> },
          { path: Path.PLANS, element: <Plans /> },
          { path: Path.NODES, element: <Node /> },
          // Add more dashboard-related routes here as children
        ],
      },
    ],
  };
}
