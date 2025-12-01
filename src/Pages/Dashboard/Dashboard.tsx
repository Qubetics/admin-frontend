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
import { convertNodeToWallet, convertPlanString, truncateValue } from "../../utils/Helper/CommonHelper";
import { DESCRIPTION, HEADING, bytesToGb, provWalletPrefix } from "../../Constant/constants";
import type { RejectShowState } from "../../Interface/CustomComp.interface";
import NotificationToast from "../../Common/NotificationModal/NotificationModal";
import CopyText from "../../Common/Copy/CopyText";
import { toast } from "react-toastify";
import { Col, Row, Tooltip } from "antd";
import { CircleCheckIcon } from "../../assets/SvgIcon/SvgIcon";
// import InnerLoader from "../../Common/Loader/InnerLoader";
// import { linkNode } from "../../utils/Helper/CommonHelper";

interface CardBoxProps {
  title: string;
  value: string | number;
  icons?: any;
}

interface TableRow {
  orgName: string;
  email: string;
  location: string;
  nodeAddress: string;
  bandwidth: string;
  plan: string;
  requestFor: string;
  planId: string;
  hours: string;
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
  const [countAccount, setCountAccount] = useState<any>();
  // const [isLoading,setIsLoading]=useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true);
  };

  const buttons = [
    {
      label: (
        <>
          All <span>Requests</span>
        </>
      ),
      value: "allrequest",
      count: countAccount?.totalCount || 0,
    },
    {
      label: (
        <>
          Link <span>Requests</span>
        </>
      ),
      value: "Link",
      count: countAccount?.linkCount || 0,
    },
    {
      label: (
        <>
          Unlink <span>Requests</span>
        </>
      ),
      value: "Unlink",
      count: countAccount?.UnlinkCount || 0,
    },
  ];

  const [active, setActive] = useState("allrequest");

  const handleRejectClose = () => setRejectShow({ ...rejectShow, show: false });
  // const handleRejectShow = () => setRejectShow(true);

  const { authData } = useIsLoggedIn();
  const useGetApi = useNetworkRequest();

  // manage this in state
  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const CardBox: React.FC<CardBoxProps> = ({ title, value, icons }) => {
    return (
      <div className='card-box'>
        <div className='card-box-icons'>{icons}</div>
        <div className='right-text'>
          <p className='card-title'>{title}</p>
          <h2 className='card-value'>{value}</h2>
        </div>
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

  const onApproval = async (address: string, type: string, planId: string, hours: string) => {
    if (type === "Unlink") {
      try {
        const message = buildUnlinkNodeMessage({
          from: provAddress,
          id: Long.fromString(planId),
          nodeAddress: address,
        });
        const TxHash = await processTransaction(message);
        if (!TxHash) {
          return;
        }
        setShow(true);
        await updateStatus(address, "APPROVED");
      } catch (err: any) {
        toast.error("Something went wrong");
        console.error(err.message);
        // setRejectShow(true);
      }
      return;
    }

    try {
      const leaseMessage = buildStartLeaseStatusMessage({
        from: provAddress,
        nodeAddress: address,
        hours: Long.fromString(hours),
        denom: "tics",
        renewalPricePolicy: 3,
      });

      const res = await processTransaction(leaseMessage);
      if (!res) {
        setUnLease(true);
      } else {
        setLease(true);
      }
    } catch (err: any) {
      toast.error(" lease Something went wrong");
      console.error(err.message, "err");
      return;
      // setRejectShow(true);
    }

    try {
      const message = buildLinkNodeMessage({
        from: provAddress,
        id: Long.fromString(planId),
        nodeAddress: address, //node address
      });
      const TxHash = await processTransaction(message);
      if (!TxHash) {
        return;
      }
      const status = await updateStatus(address, "APPROVED");
      if (!status) return;
      handleShow();
    } catch (err: any) {
      toast.error("Something went wrong")
      console.error(err.message);
      // setRejectShow(true);
    }
    fetchNodeRequestNumber();
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
      endpoint: apiUrls.nodeRequestedList(page, limit, active, authData),
    });

    // setIsLoading(false)
    if (!success) {
      return;
    }
    setNodeList(data?.data?.nodeList);
    // setTotalCount(data?.data?.count);
    setTotalPages(data?.total ? Math.ceil(data?.total / limit) : 1);
  };

  const fetchNodeNumber = async () => {
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodeCount,
    });

    if (!success) {
      return;
    }
    setActiveAccount(data?.data);
  };

  const fetchNodeRequestNumber = async () => {
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodeRequestCount,
    });

    if (!success) {
      return;
    }
    setCountAccount(data?.data);
  };

  const handleTabChange = (value: string) => {
    setActive(value);
    setPage(1);
    setLimit(5);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, active]);

  useEffect(() => {
    fetchNodeNumber();
    fetchNodeRequestNumber();
  }, [nodeList?.length]);

  const cards: CardBoxProps[] = [
    // { title: "Total Earnings", value: "2000 TICS" },
    // {
    //   icons: <NordsIcon />,
    //   title: "All Nodes",
    //   value: activeAccount?.totalCount || 0,
    // },
    {
      icons: <CircleCheckIcon />,
      title: "Active Nodes",
      value: activeAccount?.activeCount || 0,
    },
    /*     {
      icons: <CircleCloseIcon />,
      title: "Inactive Nodes",
      value: activeAccount?.inactiveCount || 0,
    }, */
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h3>Dashboard</h3>
      </div>
      <div className="cardSection">
        <Row gutter={[25, 20]} className="card-row">
          {cards.map((card, index) => (
            <Col className="gutter-row" lg={8} md={8} sm={12} xs={24}>
              <CardBox
                key={index}
                title={card.title}
                value={card.value}
                icons={card.icons}
              />
            </Col>
          ))}
        </Row>
      </div>

      <div className="custom-table-wrapper commonTable">
        <h3 className="table-title">Node Requests</h3>
        <div className="node__btns">
          {buttons.map(({ label, value, count }) => (
            <button
              key={value}
              className={active === value ? "active" : "dashboardBtn"}
              onClick={() => handleTabChange(value)}
            >
              {label}&nbsp;({count})
            </button>
          ))}
        </div>
        <div className="outerTable">
          <table className="custom-table dashboard-table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Email Address</th>
                <th>Location</th>
                <th>Node Address</th>
                <th>Bandwidth</th>
                <th>Plan</th>
                {active === "allrequest" && <th>Request Type</th>}
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
                  nodeList?.map((row, i) => {
                    return (
                      <tr key={i}>
                        <td>{row?.orgName ? row?.orgName : "-"}</td>
                        <td>
                          <Tooltip title={row?.email}>
                          <span>
                            {row?.email ? truncateValue(row?.email, 3, 3) : "-"}
                          </span>
                          </Tooltip>
                        </td>

                        <td>{row?.location || "-"}</td>
                        <td>
                          <div  style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          <Tooltip title={row?.nodeAddress}>
                          <span
                            className="address_nord"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            {truncateValue(row?.nodeAddress)}
                          </span>
                          </Tooltip>
                          <span className="copy-btn">
                              <CopyText text={row?.nodeAddress} />
                            </span>
                            </div>
                        </td>
                        <td>
                          {bytesToGb(Number(row?.bandwidth)) + " GB" || ""}
                        </td>
                        <td
                          title={row?.plan ? convertPlanString(row?.plan) : "-"}
                        >
                          {row?.plan
                            ? convertPlanString(row?.plan)
                            : "-"}
                        </td>
                        {active === "allrequest" && <td>{row?.requestFor}</td>}
                        <td>
                          <div className="action-btns">
                            <button
                              className="approve-btn"
                              onClick={() =>
                                onApproval(
                                  row?.nodeAddress,
                                  row?.requestFor,
                                  row?.planId,
                                  row?.hours
                                )
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
                    );
                  })
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
            onLimitChange={(limit: number) => {
              setLimit(limit), setPage(1);
            }}
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
