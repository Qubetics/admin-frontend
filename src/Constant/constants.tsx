export const apiMethods = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
};

export const TYPE_URLS = {
  // Plan messages
  CREATE_PLAN: "/qubetics.plan.v3.MsgCreatePlanRequest",
  UPDATE_PLAN_STATUS: "/qubetics.plan.v3.MsgUpdatePlanStatusRequest",
  START_LEASE: "/qubetics.lease.v1.MsgStartLeaseRequest",
  UPDATE_NODE_STATUS: "/qubetics.node.v3.MsgUpdateNodeStatusRequest",
  LINK_NODE: "/qubetics.plan.v3.MsgLinkNodeRequest",
  UNLINK_NODE: "/qubetics.plan.v3.MsgUnlinkNodeRequest",
};

export const provWalletPrefix = "qubeticsprov";
export const DECIMAL_PLACES = 18;

export const gbToBytes = (gb: any): string => {
  return (Number(gb) * 1024 * 1024 * 1024).toString();
};

export const bytesToGb = (bytes: number): number => {
  return bytes / (1024 * 1024 * 1024);
};

export const STATUS_ENUM = {
  STATUS_UNSPECIFIED: 0,
  STATUS_ACTIVE: 1,
  STATUS_INACTIVE_PENDING: 2,
  STATUS_INACTIVE: 3,
  UNRECOGNIZED: -1,
};

export const HEADING = {
  LEASE_NODE: "NODE Provided On Lease",
  EXIST_LEASE: "Existing Leased Node",
};

export const DESCRIPTION = {
  LEASE_NODE: "Node provided on lease successfully!",
  EXIST_LEASE: "This node already exists within the ecosystem!",
};

export const UNDEFINED = "undefined";
