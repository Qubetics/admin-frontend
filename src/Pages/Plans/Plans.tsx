import { useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import Modal from "react-bootstrap/Modal";

function Plans() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [createShow, setCreateShow] = useState(false);

  const handleCreateClose = () => setCreateShow(false);
  const handleCreateShow = () => setCreateShow(true);

  interface TableRow {
    planId: string;
    price: string;
    bytes: string;
    creationDate: string;
    hours: string;
  }

  const data: TableRow[] = [
    {
      planId: "Pl1209",
      price: "100 TICS",
      bytes: "1000 MB",
      creationDate: "2023-01-01",
      hours: "24",
    },
    {
      planId: "Pl1209",
      price: "100 TICS",
      bytes: "1000 MB",
      creationDate: "2023-01-01",
      hours: "24",
    },
  ];
  return (
    <div className="plans container">
      <div className="plans__header">
        <h1>Plans</h1>
        <ButtonCustom label="Create Plan" onClick={handleCreateShow} />
      </div>
      <div className="custom-table-wrapper commonTable">
        <div className="outerTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Price</th>
                <th>Bytes</th>
                <th>Creation Date</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.planId}</td>
                  <td>{row.price}</td>
                  <td>{row.bytes}</td>
                  <td>{row.creationDate}</td>
                  <td>{row.hours}</td>
                  <td>
                    <div className="action-btns">
                      <button className="approve-btn">
                        Activate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="page-numbers">
            <button>{"<"}</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>{">"}</button>
          </div>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>dVPN Plan</h2>
                <p>Plan Created Successfully!</p>
                <div className="action-btns">
                  <button className="gradient-btn">Ok</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={createShow} onHide={handleCreateClose}>
          <Modal.Header closeButton>
            <h2>Create Plan</h2>
          </Modal.Header>
          <Modal.Body>
            <div className="createPlan">
            <div className="form-container">
              <div className="form-group">
                <label>Plan Price</label>
                <input type="text" placeholder="Enter Plan Price" />
              </div>

              <div className="form-group">
                <label>Plan GB</label>
                <input type="text" placeholder="Enter GB" />
              </div>

              <div className="form-group">
                <label>Validity (Hours)</label>
                <input type="text" placeholder="Enter Validity (hours)" />
              </div>

              <ButtonCustom label="Create" onClick={handleShow} />
            </div>
            </div> 
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Plans;
