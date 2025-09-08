import { useState } from "react";
import "./Dashboard.scss";
import Modal from "react-bootstrap/Modal";
// import { linkNode } from "../../utils/Helper/CommonHelper";

interface CardBoxProps {
  title: string;
  value: string | number;
}

interface TableRow {
  org: string;
  email: string;
  location: string;
  address: string;
  bandwidth: string;
  plan: string;
  request: string;
}
export default function Dashboard() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [rejectShow, setRejectShow] = useState(false);

  const handleRejectClose = () => setRejectShow(false);
  const handleRejectShow = () => setRejectShow(true);

  const CardBox: React.FC<CardBoxProps> = ({ title, value }) => {
    return (
      <div className="card-box">
        <p className="card-title">{title}</p>
        <h2 className="card-value">{value}</h2>
      </div>
    );
  };

  const onClick= ()=> {
  //  const result = linkNode(); 
  //  console.log("🚀 ~ onClick ~ result:", result)
  }

  const data: TableRow[] = [
    {
      org: "Mysterium",
      email: "sam@gmail.com",
      location: "India",
      address: "qu.betics...cyt1239wc",
      bandwidth: "1000 MB",
      plan: "1000 TICS/month",
      request: "Link Node",
    },
    {
      org: "Mysterium",
      email: "sam@gmail.com",
      location: "China",
      address: "qu.betics...cyt1239wc",
      bandwidth: "100 KB",
      plan: "1000 TICS/month",
      request: "Unlink Node",
    },
  ];

  return (
    <div className="dashboard container">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
      </div>
      <div className="cardSection">
        <CardBox title="Total Earnings" value="2000 TICS" />
        <CardBox title="Active Nodes" value="100" />
      </div>

      <div className="custom-table-wrapper commonTable">
        <h2 className="table-title">Node Requests</h2>
        <div className="outerTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Org Name</th>
                <th>Email Address</th>
                <th>Location</th>
                <th>Node Address</th>
                <th>Bandwidth</th>
                <th>Plan</th>
                <th>Request For</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.org}</td>
                  <td>{row.email}</td>
                  <td>{row.location}</td>
                  <td>{row.address}</td>
                  <td>{row.bandwidth}</td>
                  <td>{row.plan}</td>
                  <td>{row.request}</td>
                  <td>
                    <div className="action-btns">
                      <button className="approve-btn" onClick={onClick}>
                        Approve
                      </button>
                      <button className="reject-btn" onClick={handleRejectShow}>
                        Reject
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
                <h2>Node Request</h2>
                <p>Node Approved successfully!</p>
                <div className="action-btns">
                  <button className="gradient-btn">Ok</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <Modal show={rejectShow} onHide={handleRejectClose}>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Node Request</h2>
                <p>Are you sure you want to reject the request?</p>
                <div className="action-btns">
                  <button className="reject-btn">No</button>
                  <button className="gradient-btn">Yes</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
