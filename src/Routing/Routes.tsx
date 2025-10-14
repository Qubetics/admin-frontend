import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./Private/Private";
import PublicRoute from "./Public/Public";
import PAGES from "./Pages";
import Path from "./Constant/RoutePaths";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicRoute />,
    children: PAGES().PUBLIC_PAGES,
  },
  {
    path: "/",
    element: <PrivateRoute />,
    children: PAGES().PRIVATE_PAGES,
  },
  {
    path: "*",
    element: <Navigate to={Path.LANDING} replace />,
  },
]);

export default router;
