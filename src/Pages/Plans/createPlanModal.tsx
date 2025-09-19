import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Select } from "antd"; // Ant Design Select
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import CustomInput from "../../Common/CustomInput/CustomInput";
import Long from "long";
import { buildCreatePlanMessage } from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { ModifyNum } from "../../utils/Helper/CommonHelper";
import { gbToBytes } from "../../Constant/constants";
import "./Plans.scss";

const { Option } = Select;

const CreatePlanModal = ({
  createShow,
  setCreateShow,
  getAllPlan,
  provAddress,
}: any) => {
  const initialFormData = { hours: "", bytes: "", price: "", durationType: "" };
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, durationType: value }));
  };

  const [show, setShow] = useState(false);
  const handleClose = () => {
    getAllPlan();
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const handleClick = async () => {
    if (
      !formData.bytes ||
      !formData.hours ||
      !formData.price ||
      !formData.durationType
    ) {
      console.log("All fields are required");
      return;
    }

    // Convert duration into hours
    let hours = formData.hours;
    if (formData.durationType === "days") {
      hours = (parseInt(hours) * 24).toString();
    } else if (formData.durationType === "months") {
      hours = (parseInt(hours) * 30 * 24).toString();
    }

    setIsLoading(true);

    const message = buildCreatePlanMessage({
      from: provAddress,
      gigabytes: Long.fromString(gbToBytes(formData.bytes)),
      hours: Long.fromString(hours),
      prices: [
        {
          denom: "tics",
          baseValue: ModifyNum(formData.price),
          quoteValue: formData.price,
        },
      ],
    });

    const TxHash = await processTransaction(message);
    setIsLoading(false);

    if (!TxHash) {
      console.log("Transaction failed");
      return;
    }

    setFormData(initialFormData);
    setCreateShow(false);
    handleShow();
  };

  return (
    <>
      {/* Success Modal */}
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>dVPN Plan</h2>
              <p>Plan Created Successfully!</p>
              <div className="action-btns">
                <ButtonCustom label="OK" onClick={handleClose} />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Create Plan Modal */}
      <Modal show={createShow} onHide={() => setCreateShow(false)} centered>
        <Modal.Header closeButton>
          <h2>Create Plan</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="createPlan">
            <div className="form-container">
              <div className="form-group">
                <label>Plan Price</label>
                <CustomInput
                  type="number"
                  name="price"
                  placeholder="Enter Plan Price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Plan GB</label>
                <CustomInput
                  type="number"
                  name="bytes"
                  placeholder="https://mysterium.network/"
                  value={formData.bytes}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Duration</label>
                <div className="duration-row">
                  <Select
                    placeholder="Choose"
                    value={formData.durationType || undefined}
                    onChange={handleSelectChange}
                    className="duration-select"
                    bordered={false}
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentNode as HTMLElement
                    }
                  >
                    <Option value="hours">Hours</Option>
                    <Option value="days">Days</Option>
                    <Option value="months">Months</Option>
                  </Select>

                  <CustomInput
                    type="number"
                    name="hours"
                    placeholder="Set Duration"
                    value={formData.hours}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="create-btn">
                <ButtonCustom
                  label="Create"
                  onClick={handleClick}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CreatePlanModal;
