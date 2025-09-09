import { useEffect, useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import { apiUrls } from "../../Constant/apiUrls";
import type { Plan } from "../../utils/Interfaces";
import useNetworkRequest from "../../Hooks/useGetApi";
import CreatePlanModal from "./createPlanModal";

const Plans = () => {
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const useGetApi = useNetworkRequest();
  
  const [createShow, setCreateShow] = useState(false);

  const getAllPlan = async () => {
    setIsLoading(true);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.getAllPlan(page, 2),
    });
    setIsLoading(false);

    if (!success) return;

    setPlanList(data?.data || []);
    setTotalPages(data?.total ? Math.ceil(data?.total / 2) : 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  useEffect(() => {
    getAllPlan();
  }, []);

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
        <div className="pagination">
          <div className="page-numbers">
            <button onClick={handlePrev} disabled={page === 1}>
              {"<"}
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={page === i + 1 ? "active" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button onClick={handleNext} disabled={page === totalPages}>
              {">"}
            </button>
          </div>
        </div>

           <CreatePlanModal createShow={createShow} setCreateShow={setCreateShow} />
      </div>
    </div>
  );
};

export default Plans;
