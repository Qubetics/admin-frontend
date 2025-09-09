import { apiUrls } from "../../Constant/apiUrls";
import useNetworkRequest from "../../Hooks/useGetApi";
import Pagination from "../../utils/pagination";
import "./Node.scss";
import { useEffect, useState } from "react";

function Node() {
  const [nodeList, setNodeList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const useGetApi = useNetworkRequest();

  const buttons = ["ALL Nodes", "Active", "Inactive"];
  const [active, setActive] = useState("ALL Nodes");

  const fetchData = async () => {
    setNodeList([]);
    setTotalCount(0);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist,
    });

    if (!success) return;

    setNodeList(data?.data?.nodeList);
    setTotalCount(data?.data?.count);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  return (
    <div className="node container">
      <div className="node__header">
        <h1>Node List</h1>
      </div>
      <div className="node__btns">
        {buttons.map((label) => (
          <button
            key={label}
            className={active === label ? "active" : "dashboardBtn"}
            onClick={() => setActive(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="custom-table-wrapper commonTable">
        <div className="outerTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Org Name</th>
                <th>Node Address</th>
                <th> Status</th>
                <th>Request For</th>
              </tr>
            </thead>
            <tbody>
              {nodeList?.map((row, i) => (
                <tr key={i}>
                  <td>{row?.orgName}</td>
                  <td>{row?.nodeAddress}</td>
                  <td>{row?.nodeStatus}</td>
                  <td>{row?.requestFor}</td>
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
      </div>
    </div>
  );
}

export default Node;
