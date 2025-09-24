import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import Long from "long";
import { buildCreatePlanMessage } from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { ModifyNum } from "../../utils/Helper/CommonHelper";
import { gbToBytes } from "../../Constant/constants";
import { toast } from "react-toastify";
import CustomInput from "../../Common/CustomInput/CustomInput";

const createPlanModal = ({
  createShow,
  setCreateShow,
  getAllPlan,
  provAddress,
}: any) => {
  const initialFormData = {
    hours: "",
    bytes: "",
    price: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    price: "",
    bytes: "",
    hours: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let errorMsg = "";
    if (!/^[1-9]\d*$/.test(value) && value !== "") {
      // toast.error("Only number in decimal is allowed");

      errorMsg = "Only positive numbers allowed";

      setErrors((prev) => ({
        ...prev,
        [name]: errorMsg,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const [show, setShow] = useState(false);
  const handleClose = () => {
    getAllPlan();
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleClick = async () => {
    if (!formData.bytes || !formData.hours || !formData.price) {
      // console.log("All fields are required");
      toast.error("All field are required");
      return;
    }
    setIsLoading(true);
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
    setCreateShow(false);
    // handleClose();
    handleShow();
  };
  const handleHide = () => {
    setCreateShow(false);
    setFormData(initialFormData)
  }

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>dVPN Plan</h2>
              <p>Plan Created Successfully!</p>
              <div className="action-btns">
                {/* <button className="gradient-btn">Ok</button> */}
                <ButtonCustom label="OK" onClick={handleClose} />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

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
                  placeholder="Enter Plan Price"
                  value={formData.price}
                  onChange={handleChange}
                />
                {errors.price && <p style={{ color: "red", fontSize: "12px" }}>{errors.price}</p>}
              </div>

              <div className="form-group">
                <label>Plan GB</label>
                <CustomInput
                  type="text"
                  name="bytes"
                  placeholder="Enter GB"
                  value={formData.bytes}
                  onChange={handleChange}
                />
                {errors.bytes && <p style={{ color: "red", fontSize: "12px" }}>{errors.bytes}</p>}
              </div>
              <div className="create-form">
                <div className="form-group">
                  <label>Validity (Hours)</label>
                  <CustomInput
                    type="text"
                    name="hours"
                    placeholder="Enter Validity (hours)"
                    value={formData.hours}
                    onChange={handleChange}
                  />
                  {errors.hours && <p style={{ color: "red", fontSize: "12px" }}>{errors.hours}</p>}
                </div>
              </div>
              <div className="create-btn">

              <ButtonCustom
                label="Create"
                onClick={handleClick}
                disabled={isLoading || !formData.bytes || !formData.hours || !formData.price}
              />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default createPlanModal;