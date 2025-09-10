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

}

export const provWalletPrefix = "qubeticsprov";
export const DECIMAL_PLACES = 18;