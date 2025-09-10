import { apiUrls } from "../../Constant/apiUrls";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import useNetworkRequest from "../../Hooks/useGetApi";
import Pagination from "../../utils/pagination";
import "./Node.scss";
import { useEffect, useState } from "react";

function Node() {
  const [nodeList, setNodeList] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit,setLimit]=useState<number>(5);


  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();

  const buttons = ["All Nodes", "Active", "Inactive"];
  const [active, setActive] = useState("All Nodes");

  const fetchData = async () => {
    setNodeList([]);
    setTotalPages(0);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist(authData),
    });

    if (!success) return;

    setNodeList(data?.data?.nodeList);
    setTotalPages(data?.datda?.total ? Math.ceil(data?.total / limit) : 1);
  };

  useEffect(() => {
    fetchData();
  }, [page,limit]);

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
          totalPages={totalPages}
          onPageChange={(newPage: any) => setPage(newPage)}
          limit={limit}
          onLimitChange={(limit: number)=> setLimit(limit)}
        />
      </div>
    </div>
  );
}

export default Node;
