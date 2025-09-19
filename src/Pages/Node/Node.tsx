import { apiUrls } from "../../Constant/apiUrls";
import {  provWalletPrefix } from "../../Constant/constants";
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

  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();

  const buttons = [
    { label: "All Nodes", value: "allnodes" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  const [active, setActive] = useState("allnodes");

  const fetchData = async () => {
    // setIsLoading(true)
    const provAddress = convertNodeToWallet(authData, provWalletPrefix);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist(provAddress, active, page, limit),
    });
    // setIsLoading(false)
    if (!success) return;
    setNodeList(data?.data?.response);
    setTotalPages(data?.data?.total ? Math.ceil(data?.data?.total / limit) : 1);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, active]);

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
        {buttons.map(({ label, value }) => (
          <button
            key={value}
            className={active === value ? "active" : "dashboardBtn"}
            onClick={() => setActive(value)}
          >
            {label}
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
                {active !== "active" && active !== 'inactive' && <th>Node Status</th>}
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
                      <td>{row?.orgName ? row?.orgName : '-'}</td>
                      <td>{row?.nodeAddress || '-'}</td>
                      {active !== "active" && active !== 'inactive' && <td>
                        <span className={getStatusClass(row?.nodeStatus)}>
                          {row?.nodeStatus || '-'}
                        </span>
                      </td>}
                      <td>{row?.requestFor}</td>
                      <td><span className={getStatusClass(row?.status)}>
                        {row?.status || '-'}
                      </span></td>


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
      </div>
    </div>
  );
}

export default Node;
