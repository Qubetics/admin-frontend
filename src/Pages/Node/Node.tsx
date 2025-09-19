import CopyText from "../../Common/Copy/CopyText";
import { apiUrls } from "../../Constant/apiUrls";
import { provWalletPrefix } from "../../Constant/constants";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import { convertNodeToWallet } from "../../utils/Helper/CommonHelper";
import Pagination from "../../utils/pagination";
import "./Node.scss";
import { useEffect, useState } from "react";

function Node() {
  const [nodeList, setNodeList] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  // const [isLoading, setIsLoading] = useState(false);
  const [activeAccount, setActiveAccount] = useState<any>();

  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();

  const buttons = [
    {
      label: "All Nodes",
      value: "allnodes",
      count: activeAccount?.totalCount || 0,
    },
    { label: "Active", value: "active", count: activeAccount?.activeCount || 0 },
    {
      label: "Inactive",
      value: "inactive",
      count: activeAccount?.inactiveCount || 0,
    },
  ];
  const [active, setActive] = useState("allnodes");

  const fetchData = async () => {
    const provAddress = convertNodeToWallet(authData, provWalletPrefix);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist(provAddress, active, page, limit),
    });
    if (!success) return;
    setNodeList(data?.data?.response);
    setTotalPages(data?.data?.total ? Math.ceil(data?.data?.total / limit) : 1);
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
  }, [page, limit, active]);
  useEffect(() => {
    fetchNodeNumber();
  }, []);
  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "status-badge active";
      case "inactive":
        return "status-badge inactive";
      case "pending":
        return "status-badge pending";
      case "approved":
        return "status-badge approved";
      case "rejected":
        return "status-badge rejected";
      default:
        return "status-badge default";
    }
  };

  return (
    <div className="node container">
      <div className="node__header">
        <h1>Node List</h1>
      </div>
      <div className="node__btns">
        {buttons.map(({ count, label, value }) => (
          <button
            key={value}
            className={active === value ? "active" : "dashboardBtn"}
            onClick={() => setActive(value)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      <div className="custom-table-wrapper commonTable node-table">
        <div className="outerTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Operator Name</th>
                <th>Node Address</th>
                {active !== "active" && active !== "inactive" && (
                  <th>Node Status</th>
                )}
                <th>Request Type</th>
                <th>Request Status</th>
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

                // ):
                nodeList.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center" }}>
                      No data found
                    </td>
                  </tr>
                ) : (
                  nodeList?.map((row, i) => (
                    <tr key={i}>
                      <td>{row?.orgName ? row?.orgName : "-"}</td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>{row?.nodeAddress}
                          <CopyText text={row?.nodeAddress} /></span>
                      </td>
                      {active !== "active" && active !== "inactive" && (
                        <td>
                          <span className={getStatusClass(row?.nodeStatus)}>
                            {row?.nodeStatus || "-"}
                          </span>
                        </td>
                      )}
                      <td>{row?.requestFor}</td>
                      <td>
                        <span className={getStatusClass(row?.status)}>
                          {row?.status || "-"}
                        </span>
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
            onLimitChange={(limit: number) => { setLimit(limit), setPage(1) }}
          />
        )}
      </div>
    </div>
  );
}

export default Node;
