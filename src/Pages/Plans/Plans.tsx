import { useEffect, useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import { apiUrls } from "../../Constant/apiUrls";
import type { Plan } from "../../utils/Interfaces";
import useNetworkRequest from "../../Hooks/useGetApi";
import CreatePlanModal from "./createPlanModal";
import Pagination from "../../utils/pagination";
import { buildUpdatePlanStatusMessage } from "../../service/BuildMessage/buildMessage";
import { STATUS_ENUM, bytesToGb, provWalletPrefix } from "../../Constant/constants";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import Long from "long";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import { Timestamp, convertNodeToWallet, formatDuration, getValueWithUnit } from "../../utils/Helper/CommonHelper";
import InnerLoader from "../../Common/Loader/InnerLoader";
import { toast } from "react-toastify";

const Plans = () => {
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(5);
  const [totalPages, setTotalPages] = useState<number>(0);
  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();
  const [createShow, setCreateShow] = useState(false);

  // manage this in state 
  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const getAllPlan = async () => {
    setIsLoading(true);
    const { success, data } = await useGetApi({
      endpoint: apiUrls.getAllPlan(page, limit),
    });
    setIsLoading(false);

    if (!success) return;

    setPlanList(data?.data || []);
    setTotalPages(data?.total?.total ? Math.ceil(data?.total?.total / limit) : 1);
  };

  const handleClick = async (val: any) => {
    const message = buildUpdatePlanStatusMessage({
      from: provAddress,
      id: Long.fromString(val?.id),   //paln Id
      status: val?.status === "active" ? STATUS_ENUM.STATUS_INACTIVE : STATUS_ENUM.STATUS_ACTIVE
    });

    const TxHash = await processTransaction(message)

    if (!TxHash) {
      toast.error("Transaction failed")
      return;
    }
    toast.success("Sucessfully Activated")
    getAllPlan();
  }

  useEffect(() => {
    getAllPlan();
  }, [page, limit]);

  return (
    <div className="plans">
      <div className="plans__header">
        <h3>Plans List</h3>
        <ButtonCustom className="btn_create" label="Create Plan" onClick={() => setCreateShow(true)} />
      </div>
      <div className="custom-table-wrapper commonTable">
        <div className="outerTable">
          <table className="custom-table plans-table ">
            <thead>
              <tr>
                <th>Plan ID</th>
                <th>Price</th>
                <th>Bytes</th>
                <th>Creation Date</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={100}>
                    <InnerLoader />
                  </td>
                </tr>
              ) : planList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No plans found
                  </td>
                </tr>
              ) : (
                planList?.map((row: any) => (
                  <tr key={row?.id}>
                    <td>{row?.id}</td>
                    <td>
                      {row?.prices?.length > 0
                        ? `${getValueWithUnit(row?.prices[0]?.quote_value)} ${(String(row?.prices[0]?.denom)).toUpperCase()}`
                        : "-"}
                    </td>
                    <td>{bytesToGb(Number(row?.gigabytes)) + " GB" || ""}</td>
                    <td>{Timestamp(row?.status_at)}</td>
                    <td>{formatDuration(Number(row?.hours))}</td>
                    <td>
                      <div className="action-btns">
                        <button className={`approve-btn ${row.status === "active" ? "disabled" : ""}`} onClick={() => handleClick(row)} disabled={row.status === "active"}>
                          {row.status === "active" ? "Activated" : "Activate"}
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
        {totalPages > 1 && <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(newPage: any) => setPage(newPage)}
          limit={limit}
          onLimitChange={(limit: number) => { setLimit(limit), setPage(1) }}
        />}

        <CreatePlanModal createShow={createShow} setCreateShow={setCreateShow} getAllPlan={getAllPlan} provAddress={provAddress} />
      </div>
    </div>
  );
};

export default Plans;
