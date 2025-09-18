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
import {
  convertNodeToWallet,
  truncateValue,
} from "../../utils/Helper/CommonHelper";
import {
  DESCRIPTION,
  HEADING,
  UNDEFINED,
  provWalletPrefix,
} from "../../Constant/constants";
import type { RejectShowState } from "../../Interface/CustomComp.interface";
import NotificationToast from "../../Common/NotificationModal/NotificationModal";
// import InnerLoader from "../../Common/Loader/InnerLoader";
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
  const [rejectShow, setRejectShow] = useState<RejectShowState>({
    show: false,
    nodeAddress: null,
  });
  const [lease, setLease] = useState(false);
  const [unLease, setUnLease] = useState(false);
  const [show, setShow] = useState(false);
  const [nodeList, setNodeList] = useState<TableRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [activeAccount, setActiveAccount] = useState<any>();
  // const [isLoading,setIsLoading]=useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

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

    if (!success) {
      console.log("Server Error");
      return false;
    }
    fetchData();
    return true;
  };

  const onApproval = async (address: string, type: string, val?: any) => {
    if (type === "Unlink") {
      try {
        const message = buildUnlinkNodeMessage({
          from: provAddress,
          id: Long.fromString(val?.planId),
          nodeAddress: address, //node address
        });
        const TxHash = await processTransaction(message);
        if (!TxHash) {
          console.log("Transaction failed");
          return;
        }
        setShow(true);
        await updateStatus(address, "APPROVED");
      } catch (err: any) {
        console.error(err.message);
        // setRejectShow(true);
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

     const res = await processTransaction(leaseMessage);
     if(!res)
      {
        setUnLease(true)
      }
      else{
        setLease(true)

      }
    } catch (err: any) {
      console.error(err.message,"err");
      // setRejectShow(true);
    }

    try {
      const message = buildLinkNodeMessage({
        from: provAddress,
        id: Long.fromString(val?.planId),
        nodeAddress: address, //node address
      });
      const TxHash = await processTransaction(message);
      if (!TxHash) {
        console.log("Transaction failed");
        return;
      }
      const status = await updateStatus(address, "APPROVED");
      if (!status) return;
      handleShow();
    } catch (err: any) {
      console.error(err.message);
      // setRejectShow(true);
    }
  };

  const onReject = (nodeAddress: string) => {
    setRejectShow({ show: true, nodeAddress: nodeAddress });
  };

  const handleRejectCall = async (address: string) => {
    handleRejectClose();
    await updateStatus(address, "REJECTED");
  };

  const fetchData = async () => {
    // setIsLoading(true)
    setNodeList([]);
    setTotalPages(0);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodeRequestedList(page, limit),
    });

    // setIsLoading(false)
    if (!success) return;
    setNodeList(data?.data?.nodeList);
    // setTotalCount(data?.data?.count);
    setTotalPages(data?.total ? Math.ceil(data?.total / limit) : 1);
  };

  const fetchNodeNumber = async () => {
    const provAddress = convertNodeToWallet(authData, provWalletPrefix);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodeCount(provAddress),
    });

    if (!success) {
      console.log("unable to fetch the active account");
      return;
    }
    setActiveAccount(data?.data);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  useEffect(() => {
    fetchNodeNumber();
  }, []);


  const cards: CardBoxProps[] = [
    // { title: "Total Earnings", value: "2000 TICS" },
    { title: "All Nodes", value: activeAccount?.totalCount || 0 },
    { title: "Active Nodes", value: activeAccount?.activeCount || 0  },
    { title: "Inactive Nodes", value: activeAccount?.inactiveCount || 0 },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1>Dashboard</h1>
      </div>
      <div className="cardSection">
        {cards.map((card, index) => (
          <CardBox key={index} title={card.title} value={card.value} />
        ))}
      </div>

      <div className="custom-table-wrapper commonTable">
        <h2 className="table-title">Node Requests</h2>
        <div className="outerTable">
          <table className="custom-table dashboard-table">
            <thead>
              <tr>
                <th>Opt Name</th>
                <th>Email Address</th>
                <th>Location</th>
                <th>Node Address</th>
                <th>Bandwidth</th>
                <th>Plan</th>
                <th>Request Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {
                // isLoading ? (
                //   <tr>
                //     <td colSpan={100}>
                //    <InnerLoader/>
                //     </td>
                //   </tr>

                // ) :
                nodeList?.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  nodeList?.map((row, i) => (
                    <tr key={i}>
                      <td>{row?.orgName !== UNDEFINED ? row?.orgName : "-"}</td>
                      <td>{row?.orgName !== UNDEFINED ? row?.email : "-"}</td>
                      <td>{row?.location || "-"}</td>
                      <td>{truncateValue(row?.nodeAddress)}</td>
                      <td>{row?.bandwidth}</td>
                      <td>{row?.plan || "-"}</td>
                      <td>{row?.requestFor} Node</td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="approve-btn"
                            onClick={() =>
                              onApproval(row?.nodeAddress, row?.requestFor, row)
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => onReject(row?.nodeAddress)}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(newPage: any) => setPage(newPage)}
            limit={limit}
            onLimitChange={(limit: number) => setLimit(limit)}
          />
        )}
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Node Request</h2>
                <p>Node Approved successfully!</p>
                <div className="action-btns">
                  <button className="gradient-btn" onClick={handleClose}>
                    OK
                  </button>
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
                  <button className="reject-btn" onClick={handleRejectClose}>
                    No
                  </button>
                  <button
                    className="gradient-btn"
                    onClick={() => {
                      handleRejectCall(String(rejectShow.nodeAddress));
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
      <NotificationToast
        show={unLease}
        handleClose={() => setUnLease(false)}
        heading={HEADING.EXIST_LEASE}
        description={DESCRIPTION.EXIST_LEASE}
      />
      <NotificationToast
        show={lease}
        handleClose={() => setLease(false)}
        heading={HEADING.LEASE_NODE}
        description={DESCRIPTION.LEASE_NODE}
      />
    </div>
  );
}
