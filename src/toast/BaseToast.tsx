"use client";

import {
  // ComponentPropsWithoutRef,
  // useCallback,
  useEffect,
  useRef,
} from "react";
import { useToast } from "./toast.provider";

export function BaseToast() {
  // refs
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  // context
  const { isToastOpen, toastType, toastMsg, updateToast, setIsToastOpen } =
    useToast();

  // const handleClose = useCallback(() => {
  //   // Clear the timeout if it exists
  //   if (timeoutId.current) clearTimeout(timeoutId.current);

  //   setIsToastOpen(false);
  // }, [updateToast, toastType, toastMsg]);

  useEffect(() => {
    if (!isToastOpen) return;

    // Set a timeout to close the toast after 5 seconds
    timeoutId.current = setTimeout(() => {
      setIsToastOpen(false);
    }, 3000);

    // Cleanup function to clear the timeout if the component unmounts
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
      {/* <div className="flex-shrink-0 pt-0.5">
      {toastType === "warning" && (
        <BaseIcon icon="error" className="w-6 h-6 text-orange-500" />
      )}
      {toastType === "error" && (
        <BaseIcon icon="error" className="w-6 h-6 text-red-500" />
      )}
      {toastType === "success" && (
        <BaseIcon icon="tick" className="w-6 h-6 text-green-500" />
      )}
    </div> */}

      <p className="text-sm font-medium leading-snug flex-1 text-white">
        {toastMsg}
      </p>

      {/* <button
        className="ml-2 text-gray-500 hover:text-black transition-colors"
        onClick={handleClose}
        aria-label="Close"
      >
        <BaseIcon icon="cross" className="w-4 h-4" />
      </button> */}
    </div>
  );
}
