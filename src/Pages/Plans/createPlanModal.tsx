import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import Long from "long";
import { buildCreatePlanMessage } from "../../service/BuildMessage/buildMessage";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { ModifyNum } from "../../utils/Helper/CommonHelper";
import { gbToBytes } from "../../Constant/constants";

const createPlanModal = ({ createShow, setCreateShow, getAllPlan, provAddress }: any) => {
  const initialFormData = {
    hours: "",
    bytes: "",
    price: "",
  };
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [show, setShow] = useState(false);
  const handleClose = () => { getAllPlan(); setShow(false) };
  const handleShow = () => setShow(true);

  const handleClick = async () => {
    if (!formData.bytes || !formData.hours || !formData.price) {
      console.log("All fields are required")
      return;
    }
    setIsLoading(true)
    const message = buildCreatePlanMessage({
      from: provAddress,
      gigabytes: Long.fromString(gbToBytes(formData.bytes)),
      hours: Long.fromString(formData.hours),
      prices: [
        {
          //make it dynamic
          denom: "tics",
          baseValue: ModifyNum(formData.price),
          quoteValue: formData.price,
        },
      ]
    });
    const TxHash = await processTransaction(message)
    setIsLoading(false)
    if (!TxHash) {
      console.log("Transaction failed");
      return;
    }
    setFormData(initialFormData)
    setCreateShow(false);
    // handleClose();
    handleShow();
  };

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

      <Modal show={createShow} onHide={() => setCreateShow(false)} centered>
        <Modal.Header closeButton>
          <h2>Create Plan</h2>
        </Modal.Header>
        <Modal.Body>
          <div className="createPlan">
            <div className="form-container">
              <div className="form-group">
                <label>Plan Price</label>
                <input
                  type="number"
                  name="price"
                  placeholder="Enter Plan Price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Plan GB</label>
                <input
                  type="number"
                  name="bytes"
                  placeholder="Enter GB"
                  value={formData.bytes}
                  onChange={handleChange}
                />
              </div>
              <div className="create-form">

                <div className="form-group">
                  <label>Validity (Hours)</label>
                  <input
                    type="number"
                    name="hours"
                    placeholder="Enter Validity (hours)"
                    value={formData.hours}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <ButtonCustom label="Create" onClick={handleClick} disabled={isLoading} />
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default createPlanModal;
