
import "./Node.scss";
import { useState } from "react";

function Node() {
  const data = [
    {
      orgName: "Shinobi Validator",
      nodeAddress: "0x47685...4c8B145",
      nodeStatus: <span className="active">Active</span>,
      requestFor: "Link Node",
    },
    {
      orgName: "Shinobi Validator",
      nodeAddress: "0x47685...4c8B145",
      nodeStatus: <span className="inactive">Inactive</span>,
      requestFor: "Unlink Node",
    },
  ];

  const buttons = ["ALL Nodes", "Active", "Inactive"];
  const [active, setActive] = useState("ALL Nodes");

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
              {data.map((row, i) => (
                <tr key={i}>
                  <td>{row.orgName}</td>
                  <td>{row.nodeAddress}</td>
                  <td>{row.nodeStatus}</td>
                  <td>{row.requestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="page-numbers">
            <button>{"<"}</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>{">"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Node;
