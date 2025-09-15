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
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, handleClose]);

  if (!show) return null;

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
