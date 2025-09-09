"use client";

import {
  createContext,
  useContext,
  useState,
  type FC,
  type ReactNode,
} from "react";

export type ToastContextType = {
  isToastOpen: boolean;
  toastType: ToastTypeProps;
  toastMsg: string;
  updateToast: (type: ToastTypeProps, msg: string) => void;
  setIsToastOpen: (val: boolean) => void;
};

export type ToastTypeProps = "warning" | "error" | "success";

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (p0?: string) => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [toastType, setToastType] = useState<ToastTypeProps>("success");
  const [toastMsg, setToastMsg] = useState("");

  const updateToast: ToastContextType["updateToast"] = (type, data) => {
    setIsToastOpen(true);
    setToastType(type);
    setToastMsg(data);
  };

  const value = {
    setIsToastOpen,
    isToastOpen,
    toastType,
    toastMsg,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
