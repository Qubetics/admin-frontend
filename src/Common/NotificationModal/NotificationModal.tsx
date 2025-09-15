import React, { useEffect } from "react";
import "./NotificationModal.scss";

type NotificationToastProps = {
  show: boolean;
  handleClose: () => void;
  heading: string;
  description: string;
};

const NotificationToast: React.FC<NotificationToastProps> = ({
  show,
  handleClose,
  heading,
  description,
}) => {
  if (!show) return null;
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, handleClose]);


  return (
    <div className="notification-toast">
      <div className="toast-content">
        <strong>{heading}</strong>
        <p>{description}</p>
      </div>
    </div>
  );
};

export default NotificationToast;
