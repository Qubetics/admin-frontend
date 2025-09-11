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
  const [limit,setLimit]=useState<number>(5);

  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();

  const buttons = [
    { label: "All Nodes", value: "allnodes" },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ];
  const [active, setActive] = useState("allnodes");

  const fetchData = async () => {
    const provAddress = convertNodeToWallet(authData, provWalletPrefix);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.nodelist(provAddress,active,page,limit),
    });

    if (!success) return;
    setNodeList(data?.data?.response);
    setTotalPages(data?.data?.total ? Math.ceil(data?.data?.total / limit) : 1);
  };

  useEffect(() => {
    fetchData();
  }, [page,limit,active]);

  return (
    <div className="node container">
      <div className="node__header">
        <h1>Node List</h1>
      </div>
      <div className="node__btns">
        {buttons.map(({label,value}) => (
          <button
            key={value}
            className={active === value ? "active" : "dashboardBtn"}
            onClick={() => setActive(value)}
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
        {totalPages>1 && <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: any) => setPage(newPage)}
          limit={limit}
          onLimitChange={(limit: number)=> setLimit(limit)}
        />}
      </div>
    </div>
  );
}

export default Node;
