import { useEffect, useState } from "react";
import ButtonCustom from "../../Common/ButtonCustom/ButtonCustom";
import "./Plans.scss";
import Modal from "react-bootstrap/Modal";
import useGetApi from "../../Hooks/useGetApi";
import { apiUrls } from "../../Constant/apiUrls";
import { apiMethods } from "../../Constant/constants";
import type { Plan } from "../../utils/Interfaces";

const Plans = () => {
  const [show, setShow] = useState(false);
  const [planList, setPlanList] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page,setPage]=useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [createShow, setCreateShow] = useState(false);

  const handleCreateClose = () => setCreateShow(false);
  const handleCreateShow = () => setCreateShow(true);

  const getAllPlan = async () => {
    try {
      setIsLoading(false);
      const result = await useGetApi(
        apiUrls.getAllPlan(page,2),
        apiMethods.GET
      );
      console.log("🚀 ~ getAllPlan ~ result:", result?.data?.data);
      setPlanList(result?.data?.data || []);
      if (result?.data?.total) {
        setTotalPages(Math.ceil(result.data.total / 2));
      } else {
        setTotalPages(1); // fallback: manually set pages
      }
    } catch (error) {
      console.error(error, "error");
    } finally {
      setIsLoading(false);
    }
  }

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
        <ButtonCustom label="Create Plan" onClick={handleCreateShow} />
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

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton></Modal.Header>
          <Modal.Body>
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>dVPN Plan</h2>
                <p>Plan Created Successfully!</p>
                <div className="action-btns">
                  <button className="gradient-btn">Ok</button>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>

        <Modal show={createShow} onHide={handleCreateClose}>
          <Modal.Header closeButton>
            <h2>Create Plan</h2>
          </Modal.Header>
          <Modal.Body>
            <div className="createPlan">
              <div className="form-container">
                <div className="form-group">
                  <label>Plan Price</label>
                  <input type="text" placeholder="Enter Plan Price" />
                </div>

                <div className="form-group">
                  <label>Plan GB</label>
                  <input type="text" placeholder="Enter GB" />
                </div>

                <div className="form-group">
                  <label>Validity (Hours)</label>
                  <input type="text" placeholder="Enter Validity (hours)" />
                </div>

                <ButtonCustom label="Create" onClick={handleShow} />
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
}

export default Plans;
