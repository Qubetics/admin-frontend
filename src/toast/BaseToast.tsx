"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./toast.provider";

export function BaseToast() {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const { isToastOpen, toastType, toastMsg, updateToast, setIsToastOpen } =
    useToast();

  useEffect(() => {
    if (!isToastOpen) return;

    timeoutId.current = setTimeout(() => {
      setIsToastOpen(false);
    }, 3000);

    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [isToastOpen, updateToast, toastType, toastMsg, setIsToastOpen]);

  return (
    <div
      className={`
      fixed top-3 right-1 z-[9999] max-w-sm w-80 
      px-3 py-3 rounded-lg border shadow-lg flex items-start gap-3 
      bg-opacity-100 transition-transform duration-500 ease-out
      ${toastType === "warning" && "bg-red-700 border-red text-red-900"}
      ${toastType === "error" && "bg-red-700 border-red text-red-900"}
      ${toastType === "success" && "bg-[#26A543] border-0 text-white"}
      ${isToastOpen ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"}
    `}
    >
      <p className="text-sm font-medium leading-snug flex-1 text-white">
        {toastMsg}
      </p>
    </div>
  );
}
