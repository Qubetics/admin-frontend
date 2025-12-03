import React from "react";
import { createPortal } from "react-dom";
import "./ConfirmationModal.scss";
import ButtonCustom from "../ButtonCustom/ButtonCustom";

type ConfirmationModalProps = {
  show: boolean;
  heading?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  heading = "Confirm Action",
  description = "Are you sure you want to continue?",
  confirmLabel = "Yes",
  cancelLabel = "No",
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return createPortal(
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <button className="close-btn" onClick={onCancel}>
          ×
        </button>

        <strong>{heading}</strong>
        <p>{description}</p>

        <div className="confirmation-buttons">
          <ButtonCustom
            label={cancelLabel}
            onClick={onCancel}
            type="button"
            className="no-btn"
          />
          <ButtonCustom
            label={confirmLabel}
            onClick={onConfirm}
            type="button"
            className="yes-btn"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
