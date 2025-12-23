import BigNumber from "bignumber.js";

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
  REGISTER_PROVIDER: "/qubetics.provider.v3.MsgRegisterProviderRequest",
  UPDATE_STATUS_PROVIDER:
    "/qubetics.provider.v3.MsgUpdateProviderStatusRequest",
};

export const provWalletPrefix = "qubeticsprov";
export const DECIMAL_PLACES = 18;
export const WEI = new BigNumber(10 ** 18);

export const gbToBytes = (gb: any): string => {
  return (Number(gb) * 1024 * 1024 * 1024).toString();
};

export const bytesToGb = (bytes: number): number => {
  if (!bytes) return 0;

  return Math.round(bytes / (1024 * 1024 * 1024));
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
  REGISTER_PROVIDER: "Provider registered succesfully",
  PROVIDER_STATUS: "Provider Status updated Succesfully",
};

export const DESCRIPTION = {
  LEASE_NODE: "Node provided on lease successfully!",
  EXIST_LEASE: "This node already exists within the ecosystem!",
};

export const UNDEFINED = "undefined";

export const ERROR_MSG = {
  LOW_BALANCE: "Low wallet Balance",
  FAILED_FETCHING_BALANCE: "Error fetching balance",
};

export const hoursDropdown = [
  { label: "30 Days", value: 30 * 24 },
  { label: "60 Days", value: 60 * 24 },
  { label: "90 Days", value: 90 * 24 },
];

export const ERROR_MESSAGES = {
  PRICE_LESS_THAN_1: "The price plan cannot be less than 1",
  PRICE_DECIMAL: "Price value cannot be in decimal",
  BANDWIDTH_LESS_THAN_1: "Plan bandwidth cannot be less than 1",
  BANDWIDTH_DECIMAL: "Plan bandwidth cannot be in decimal",
  DISPOSABLE_EMAIL: "Sorry, but we do not accept your mail provider.",
};

export const PROCESS_TRANSACTION_ERRORS = [
  {
    match: "Request rejected",
    toast: "Transaction rejected",
    id: "tx_rejected",
  },
  {
    match: "gigabytes cannot be negative",
    toast: "Value can be negative",
    id: "negative_gb",
  },
  {
    match: "account sequence mismatch",
    toast: "Account Mismatch",
    id: "account_mismatch",
  },
  {
    match: "node for plan not found",
    toast: "Node is not present in this plan",
    id: "node_not_in_plan",
  },
  {
    match: "duplicate node for plan",
    toast: "Node is linked to a plan",
    id: "duplicate_node",
  },
  {
    match: "invalid node status",
    toast: "Node address is not present on the chain",
    id: "node_not_present",
  },
  {
    match: "duplicate provider",
    toast: "Provider Already Exists",
    id: "duplicate_provider",
  },
];
export const defaultOnLimitChange = () => {};

export const emailRegex =
  /^(?!\s)(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const nameRegex = /^(?!\s)(?!.*\s$)(?!.*\s{2,})[\p{L}\p{M}\p{N}' .-]+$/u;

export const activeStatus = "active";

export const errMessages = {
  somethingErr: "Something went wrong",
  leaseErr: "Lease something went wrong",
};

export const linkStatus = { link: "link", unlink: "Unlink" };
export const requestStatus = { approve: "APPROVED", rejected: "REJECTED" };
