import { Suspense } from "react";
import "./App.css";
import "./index.scss";
import { RouterProvider } from "react-router-dom";
import router from "./Routing/Routes";
import ErrorBoundary from "./ErrorBoundary/ErrorBoundary";
import { LoggedInProvider } from "./Context/LoggedInContext";
import { TokenPriceProvider } from "./Context/TokenPriceContext";
import Loader from "./Common/Loader/Loader";
import { ToastContainer } from "react-toastify";

function AppContent() {
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div>
            <Loader />
          </div>
        }
      >
        <TokenPriceProvider>
          <LoggedInProvider>
            <AppContent />
          </LoggedInProvider>
        </TokenPriceProvider>
      </Suspense>
      <ToastContainer position="top-right" autoClose={3000} />
    </ErrorBoundary>
  );
}

export default App;
