import { useEffect, useState } from "react";
import "./Dashboard.scss";
import Modal from "react-bootstrap/Modal";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import Pagination from "../../utils/pagination";
import Long from "long";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import {
  buildLinkNodeMessage,
  buildStartLeaseStatusMessage,
  buildUnlinkNodeMessage,
} from "../../service/BuildMessage/buildMessage";
import { convertNodeToWallet } from "../../utils/Helper/CommonHelper";
import { provWalletPrefix } from "../../Constant/constants";
// import { linkNode } from "../../utils/Helper/CommonHelper";

interface CardBoxProps {
  title: string;
  value: string | number;
}

interface TableRow {
  orgName: string;
  email: string;
  location: string;
  nodeAddress: string;
  bandwidth: string;
  plan: string;
  requestFor: string;
}

export default function Dashboard() {
  const [rejectShow, setRejectShow] = useState(false);
  const [show, setShow] = useState(false);
  const [nodeList, setNodeList] = useState<TableRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const handleClose = () => setShow(false);
  // const handleShow = () => setShow(true);

  const handleRejectClose = () => setRejectShow(false);
  // const handleRejectShow = () => setRejectShow(true);

  const { authData } = useIsLoggedIn();
  const useGetApi = useNetworkRequest();

  // manage this in state
  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const CardBox: React.FC<CardBoxProps> = ({ title, value }) => {
    return (
      <div className="card-box">
        <p className="card-title">{title}</p>
        <h2 className="card-value">{value}</h2>
      </div>
    );
  };

  const onApproval = async (address: string, type: string) => {
    if (type === "Unlink") {
      try {
        const message = buildUnlinkNodeMessage({
          from: provAddress,
          id: Long.fromString("1"),
          nodeAddress: address, //node address
        });
        await processTransaction(message);
        setShow(true);
      } catch (err: any) {
        console.error(err.message);
        setRejectShow(true);
      }

      return;
    }

    try {
      const leaseMessage = buildStartLeaseStatusMessage({
        from: provAddress,
        nodeAddress: address,
        hours: Long.fromString("620"),
        denom: "tics",
        renewalPricePolicy: 0,
      });

      await processTransaction(leaseMessage);
      setShow(true);
    } catch (err: any) {
      console.error(err.message);
      setRejectShow(true);
    }

    try {
      const message = buildLinkNodeMessage({
        from: provAddress,
        id: Long.fromString("1"),
        nodeAddress: address, //node address
      });
      await processTransaction(message);
      setShow(true);
    } catch (err: any) {
      console.error(err.message);
      setRejectShow(true);
    }
  };

  const onReject = async () => {};

  const fetchData = async () => {
    setNodeList([]);
    setTotalCount(0);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.postNodeRequest,
    });

    if (!success) return;

    setNodeList(data?.data?.nodeList);
    setTotalCount(data?.data?.count);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

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
              {nodeList?.map((row, i) => (
                <tr key={i}>
                  <td>{row?.orgName}</td>
                  <td>{row?.email}</td>
                  <td>{row?.location}</td>
                  <td>{row?.nodeAddress}</td>
                  <td>{row?.bandwidth}</td>
                  <td>{row?.plan}</td>
                  <td>{row?.requestFor}</td>
                  <td>
                    <div className="action-btns">
                      <button
                        className="approve-btn"
                        onClick={() =>
                          onApproval(row?.nodeAddress, row?.requestFor)
                        }
                      >
                        Approve
                      </button>
                      <button className="reject-btn" onClick={() => onReject()}>
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
        <Pagination
          currentPage={page}
          totalPages={totalCount}
          onPageChange={(newPage) => setPage(newPage)}
        />
        <Modal show={show} onHide={handleClose} centered>
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
        <Modal show={rejectShow} onHide={handleRejectClose} centered>
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
