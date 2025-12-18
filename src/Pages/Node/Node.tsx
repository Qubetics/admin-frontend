import CopyText from "../../Common/Copy/CopyText";
import TableSkeleton from "../../Common/Loader/TableSkeleton";
import { apiUrls } from "../../Constant/apiUrls";
import useNetworkRequest from "../../Hooks/useGetApi";
import { toFirstCapital } from "../../utils/Helper/CommonHelper";
import Pagination from "../../utils/pagination";
import "./Node.scss";
import { useEffect, useState } from "react";

type NodeProps = {
  activeOverride?: "active" | "inactive" | "allnodes";
};

function Node({ activeOverride }: NodeProps) {
  const [nodeList, setNodeList] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [limit, setLimit] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(true);

  const useGetApi = useNetworkRequest();

  const effectiveActive = activeOverride ?? "active";

  const fetchData = async () => {
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist(effectiveActive, page, limit),
    });
    setIsLoading(false);

    if (!success) return;
    setNodeList(data?.data?.response);
    setTotalPages(data?.data?.total ? Math.ceil(data?.data?.total / limit) : 1);
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, effectiveActive]);

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
    <div className="node">
      <div className="node__header">
        <h3>Node List</h3>
      </div>

      <div className="custom-table-wrapper commonTable node-table">
        <div className="outerTable">
          <table className="custom-table">
            {!isLoading && (
              <thead>
                <tr>
                  <th>Operator Name</th>
                  <th>Node Address</th>

                  {effectiveActive !== "active" &&
                    effectiveActive !== "inactive" && <th>Node Status</th>}
                  <th>Request Type</th>
                  <th>Request Status</th>
                </tr>
              </thead>
            )}
            <tbody>
              {isLoading ? (
                <TableSkeleton rows={2} columns={4} />
              ) : nodeList.length === 0 ? (
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
                      <span
                        className="address_nord"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {row?.nodeAddress}
                        <div className="copy-btn">
                          <CopyText text={row?.nodeAddress} />
                        </div>
                      </span>
                    </td>
                    {effectiveActive !== "active" &&
                      effectiveActive !== "inactive" && (
                        <td>
                          <span className={getStatusClass(row?.nodeStatus)}>
                            {row?.nodeStatus || "-"}
                          </span>
                        </td>
                      )}
                    <td>{row?.requestFor}</td>
                    <td>
                      <span className={getStatusClass(row?.status)}>
                        {toFirstCapital(row?.status) || "-"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
      </div>
    </div>
  );
}

export default Node;
