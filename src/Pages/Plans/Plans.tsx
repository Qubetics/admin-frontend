import { useEffect, useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import { apiUrls } from "../../Constant/apiUrls";
import type { Plan } from "../../utils/Interfaces";
import useNetworkRequest from "../../Hooks/useGetApi";
import CreatePlanModal from "./createPlanModal";
import { buildUpdatePlanStatusMessage } from "../../service/BuildMessage/buildMessage";
import { STATUS_ENUM, activeStatus, bytesToGb, provWalletPrefix } from "../../Constant/constants";
import { processTransaction } from "../../service/processTransaction/processTransaction";
import Long from "long";
import { useIsLoggedIn } from "../../Context/LoggedInContext";
import { Timestamp, convertNodeToWallet, formatDuration, getValueWithUnit } from "../../utils/Helper/CommonHelper";
import { toast } from "react-toastify";
import TableSkeleton from "../../Common/Loader/TableSkeleton";

const Plans = () => {
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const useGetApi = useNetworkRequest();
  const { authData } = useIsLoggedIn();
  const [createShow, setCreateShow] = useState(false);
  const [isTxRunning, setIsTxRunning] = useState(false);

  const provAddress = convertNodeToWallet(authData, provWalletPrefix);

  const getAllPlan = async () => {
    const { success, data } = await useGetApi({
      endpoint: apiUrls.getAllPlan(authData),
    });
    setIsLoading(false);

    if (!success) return;

    setPlanList(data?.data || []);
  };

  const handleClick = async (val: Plan) => {
    const id = val?.id;

    setIsTxRunning(true);

    try {
      const message = buildUpdatePlanStatusMessage({
        from: provAddress,
        id: Long.fromString(id),
        status: val?.status === activeStatus ? STATUS_ENUM.STATUS_INACTIVE : STATUS_ENUM.STATUS_ACTIVE,
      });

      const TxHash = await processTransaction(message);

      if (!TxHash) {
        if (!toast.isActive("tx_rejected")) {
          toast.error("Transaction failed", { toastId: "tx_failed" });
        }
        return;
      }

      toast.success("Successfully Activated", { toastId: "tx_success" });
      await getAllPlan();
    } finally {
      setIsTxRunning(false);
    }
  };

  useEffect(() => {
    getAllPlan();
  }, []);

  return (
    <div className="plans">
      <div className="plans__header">
        <h3>Plans List</h3>
        <ButtonCustom className="btn_create" label="Create Plan" onClick={() => setCreateShow(true)} />
      </div>
      <div className="custom-table-wrapper commonTable">
        <div className="outerTable">
          <table className="custom-table plans-table">
            {!isLoading && (
              <thead>
                <tr>
                  <th>Plan ID</th>
                  <th>Price</th>
                  <th>Bandwidth</th>
                  <th>Duration</th>
                  <th>Creation Date</th>
                  <th>Action</th>
                </tr>
              </thead>
            )}

            <tbody>
              {isLoading ? (
                <TableSkeleton rows={4} columns={6} />
              ) : planList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No plans found
                  </td>
                </tr>
              ) : (
                planList?.map((row: Plan) => (
                  <tr key={row?.id}>
                    <td>{row?.id}</td>

                    <td>
                      {row?.prices?.length > 0
                        ? `${getValueWithUnit(row?.prices[0]?.quote_value)} ${String(
                            row?.prices[0]?.denom
                          ).toUpperCase()}`
                        : "-"}
                    </td>

                    <td>{bytesToGb(Number(row?.gigabytes)) + " GB" || ""}</td>

                    <td>{formatDuration(Number(row?.hours))}</td>

                    <td>{Timestamp(row?.status_at)}</td>

                    <td>
                      <div className="action-btns">
                        <button
                          className={`approve-btn ${row.status === activeStatus || isTxRunning ? "disablex" : ""}`}
                          onClick={() => handleClick(row)}
                          disabled={row.status === activeStatus || isTxRunning}
                        >
                          {row.status === activeStatus ? "Activated" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <CreatePlanModal
          createShow={createShow}
          setCreateShow={setCreateShow}
          getAllPlan={getAllPlan}
          provAddress={provAddress}
        />
      </div>
    </div>
  );
};

export default Plans;
