import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import Long from "long";
import { buildCreatePlanMessage } from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { ModifyNum, sanitizeInput } from "../../utils/Helper/CommonHelper";
import {
  ERROR_MESSAGES,
  gbToBytes,
  hoursDropdown,
} from "../../Constant/constants";
import { toast } from "react-toastify";
import CustomInput from "../../Common/CustomInput/CustomInput";
import NotificationToast from "../../Common/NotificationModal/NotificationModal";
import type { CreatePlanModalProps } from "../../utils/Interfaces";

const CreatePlanModal = ({
  createShow,
  setCreateShow,
  getAllPlan,
  provAddress,
}: CreatePlanModalProps) => {
  const initialFormData = {
    hours: "",
    bytes: "",
    price: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({
    price: "",
    bytes: "",
    hours: "",
  });
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const safeValue = sanitizeInput(value, name);

    let errorMsg = "";

    if (name === "price") {
      if (Number(safeValue) < 1 || safeValue === "-") {
        errorMsg = ERROR_MESSAGES.PRICE_LESS_THAN_1;
      } else if (safeValue.includes(".")) {
        errorMsg = ERROR_MESSAGES.PRICE_DECIMAL;
      } else if (!/^[1-9]\d*$/.test(safeValue) && safeValue !== "") {
        errorMsg = ERROR_MESSAGES.PRICE_LESS_THAN_1;
      }
    } else if (name === "bytes") {
      if (Number(safeValue) < 1 || safeValue === "-") {
        errorMsg = ERROR_MESSAGES.BANDWIDTH_LESS_THAN_1;
      } else if (safeValue.includes(".")) {
        errorMsg = ERROR_MESSAGES.BANDWIDTH_DECIMAL;
      } else if (!/^[1-9]\d*$/.test(safeValue) && safeValue !== "") {
        errorMsg = ERROR_MESSAGES.BANDWIDTH_LESS_THAN_1;
      }
    }

    if (errorMsg) {
      if (safeValue === "") {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        return;
      }
      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: safeValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleClick = async () => {
    if (!formData.bytes || !formData.hours || !formData.price) {
      toast.error("All field are required");
      return;
    }
    const message = buildCreatePlanMessage({
      from: provAddress,
      gigabytes: Long.fromString(gbToBytes(formData?.bytes)),
      hours: Long.fromString(formData?.hours),
      prices: [
        {
          denom: "tics",
          baseValue: ModifyNum(formData?.price),
          quoteValue: ModifyNum(formData?.price),
        },
      ],
    });

    const TxHash = await processTransaction(message);
    setIsLoading(false);
    if (!TxHash) {
      return;
    }
    setFormData(initialFormData);
    handleHide();
    getAllPlan();
    setShowNotification(true);
  };

  const handleHide = () => {
    setCreateShow(false);
    setFormData(initialFormData);

    setErrors({
      price: "",
      bytes: "",
      hours: "",
    });
    setShowNotification(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <>
      <Modal show={createShow} onHide={handleHide} centered>
        <Modal.Header closeButton>
          <h2>Create Plan</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="createPlan">
            <div className="form-container">
              <div className="form-group">
                <label>Plan Price</label>
                <CustomInput
                  type="text"
                  name="price"
                  placeholder="Enter Plan Price in TICS"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {errors.price}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Plan Bandwidth</label>
                <CustomInput
                  type="text"
                  name="bytes"
                  placeholder="Enter Bandwidth in GB"
                  value={formData.bytes}
                  onChange={handleChange}
                />
                {errors.bytes && (
                  <p style={{ color: "red", fontSize: "12px" }}>
                    {errors.bytes}
                  </p>
                )}
              </div>

              <div className="create-form">
                <div className="form-group">
                  <label>Duration</label>
                  <CustomInput
                    type="select"
                    name="hours"
                    placeholder="Choose"
                    value={formData.hours}
                    onChange={handleInputChange}
                    disable={false}
                    options={hoursDropdown}
                  />
                  {errors.hours && (
                    <p style={{ color: "red", fontSize: "12px" }}>
                      {errors.hours}
                    </p>
                  )}
                </div>
              </div>

              <div className="create-btn">
                <ButtonCustom
                  label="Create"
                  onClick={handleClick}
                  disabled={
                    isLoading ||
                    !formData.bytes ||
                    !formData.hours ||
                    !formData.price
                  }
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <NotificationToast
        show={showNotification}
        handleClose={() => setShowNotification(false)}
        heading="Plan"
        description="Plan Created Successfully!"
      />
    </>
  );
};

export default CreatePlanModal;
