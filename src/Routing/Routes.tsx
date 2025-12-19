import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./Private/Private";
import PublicRoute from "./Public/Public";
import PAGES from "./Pages";
import NotFound from "../Pages/NotFound/NotFound";

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
    element: <NotFound />,
  },
]);

export default router;
