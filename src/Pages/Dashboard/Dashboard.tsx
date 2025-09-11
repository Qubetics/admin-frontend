import { useEffect, useState } from "react";
import "./Dashboard.scss";
import Modal from "react-bootstrap/Modal";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import Pagination from "../../utils/pagination";
import Long from "long";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import { buildLinkNodeMessage, buildStartLeaseStatusMessage, buildUnlinkNodeMessage } from "../../service/BuildMessage/buildMessage";
import { convertNodeToWallet } from "../../utils/Helper/CommonHelper";
import { provWalletPrefix } from "../../Constant/constants";
import type { RejectShowState } from "../../Interface/CustomComp.interface";
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
  const [rejectShow, setRejectShow] = useState<RejectShowState>({ show: false, nodeAddress: null });
  const [show, setShow] = useState(false);
  const [nodeList, setNodeList] = useState<TableRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);

  }

  const handleRejectClose = () => setRejectShow({ ...rejectShow, show: false });
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

  const updateStatus = async (nodeAddress: string, status: string) => {
    const { success } = await useGetApi({
      endpoint: apiUrls.nodeStatusAction(nodeAddress, status),
    });

    if (!success) return false;

    fetchData();

    return true;
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
        // setRejectShow(true);
      }

      await updateStatus(address, "REJECTED");

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
      // setRejectShow(true);
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
      // setRejectShow(true);
    }

    const status = await updateStatus(address, "APPROVED");

    if (!status) return;

    handleShow();

  };

  const onReject = (nodeAddress: string) => {
    setRejectShow({ show: true, nodeAddress: nodeAddress });
  };

  const handleRejectCall = async (address: string) => {
    await updateStatus(address, "REJECTED");
  }

  const fetchData = async () => {
    setNodeList([]);
    setTotalPages(0);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodeRequestedList(page, limit),
    });

    if (!success) return;

    setNodeList(data?.data?.nodeList);
    // setTotalCount(data?.data?.count);
    setTotalPages(data?.total ? Math.ceil(data?.total / limit) : 1);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  return (
    <div className="dashboard container">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
      </div>
      <div className="cardSection">
        {/* <CardBox title="Total Earnings" value="2000 TICS" /> */}
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
                      <button className="reject-btn" onClick={() => onReject(row?.nodeAddress)}>
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
        {totalPages>1 && <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: any) => setPage(newPage)}
          limit={limit}
          onLimitChange={(limit: number) => setLimit(limit)}
        />}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Node Request</h2>
                <p>Node Approved successfully!</p>
                <div className="action-btns">
                  <button className="gradient-btn" onClick={handleClose}>Ok</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
        <Modal show={rejectShow.show} onHide={handleRejectClose} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Node Request</h2>
                <p>Are you sure you want to reject the request?</p>
                <div className="action-btns">
                  <button className="reject-btn" onClick={handleRejectClose}>No</button>
                  <button className="gradient-btn" onClick={() => { handleRejectCall(String(rejectShow.nodeAddress)) }}>Yes</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}
