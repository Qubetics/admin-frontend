import { Tab, Tabs } from "react-bootstrap";
import "./Node.scss";

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
  return (
    <div className="node container">
      <div className="node__header">
        <h1>Node List</h1>
      </div>
      <Tabs
        defaultActiveKey="all"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="all" title="ALL Nodes">
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
        </Tab>
        <Tab eventKey="active" title="Active ">
          Tab content for Active Nodes
        </Tab>
        <Tab eventKey="inactive" title="Inactive ">
          Tab content for Inactive Nodes
        </Tab>
      </Tabs>
    </div>
  );
}

export default Node;
