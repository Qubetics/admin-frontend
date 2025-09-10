import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.tsx";
import { ToastProvider } from "./toast/toast.provider.tsx";
// import { BaseToast } from "./toast/BaseToast.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      {/* <BaseToast /> */}
    </ToastProvider>
  </StrictMode>
);
