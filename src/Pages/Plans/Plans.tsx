import { useEffect, useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import { apiUrls } from "../../Constant/apiUrls";
import type { Plan } from "../../utils/Interfaces";
import useNetworkRequest from "../../Hooks/useGetApi";
import CreatePlanModal from "./createPlanModal";
import Pagination from "../../utils/pagination";

const Plans = () => {
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(1);
  const useGetApi = useNetworkRequest();

  const [createShow, setCreateShow] = useState(false);

  const getAllPlan = async () => {
    setIsLoading(true);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.getAllPlan(page, limit),
    });
    setIsLoading(false);

    if (!success) return;

    setPlanList(data?.data || []);
    setTotalPages(data?.total ? Math.ceil(data?.total / limit) : 1);
  };

  useEffect(() => {
    getAllPlan();
  }, [page,limit]);

  return (
    <div className="plans container">
      <div className="plans__header">
        <h1>Plans</h1>
        <ButtonCustom label="Create Plan" onClick={() => setCreateShow(true)} />
      </div>
      <div className="custom-table-wrapper commonTable">
        <div className="outerTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Price</th>
                <th>Bytes</th>
                <th>Creation Date</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    Loading...
                  </td>
                </tr>
              ) : planList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No plans found
                  </td>
                </tr>
              ) : (
                planList.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>
                      {row.prices.length > 0
                        ? `${row.prices[0].amount} ${row.prices[0].denom}`
                        : "-"}
                    </td>
                    <td>{row.gigabytes}</td>
                    <td>{row.hours}</td>
                    <td>{row.status}</td>
                    <td>
                      <div className="action-btns">
                        <button className="approve-btn">
                          {row.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: any) => setPage(newPage)}
          limit={limit}
          onLimitChange={(limit: number) => setLimit(limit)}
        />

        <CreatePlanModal createShow={createShow} setCreateShow={setCreateShow} />
      </div>
    </div>
  );
};

export default Plans;
