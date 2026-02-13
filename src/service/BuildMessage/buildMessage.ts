import { TYPE_URLS } from "../../Constant/constants";
import {
  MsgCreatePlanRequest,
  MsgLinkNodeRequest,
  MsgUpdatePlanStatusRequest,
} from "../../proto-gen/src/codec/qubetics/plan/v3/msg";
import {
  MsgEndLeaseRequest,
  MsgStartLeaseRequest,
} from "../../proto-gen/src/codec/qubetics/lease/v1/msg";
import {
  MsgRegisterProviderRequest,
  MsgUpdateProviderStatusRequest,
} from "../../proto-gen/src/codec/qubetics/provider/v3/msg";
import Long from "long";
import type { RenewalPricePolicy } from "../../proto-gen/src/codec/qubetics/types/v1/renewal";
import type { Status } from "../../proto-gen/src/codec/qubetics/types/v1/status";

export function buildCreatePlanMessage(params: {
  from: string;
  gigabytes: Long;
  hours: Long;
  prices: Array<{ denom: string; baseValue: string; quoteValue: string }>;
}) {
  return {
    typeUrl: TYPE_URLS.CREATE_PLAN,
    value: MsgCreatePlanRequest.encode({
      from: params.from,
      gigabytes: params?.gigabytes,
      hours: params?.hours,
      prices: params?.prices || [
        {
          //make it dynamic
          denom: "tics",
          baseValue: "200",
          quoteValue: "200",
        },
      ],
    }).finish(),
  };
}

export function buildLinkNodeMessage(params: {
  from: string;
  id: Long;
  nodeAddress: string;
}) {
  return {
    typeUrl: TYPE_URLS.LINK_NODE,
    value: MsgLinkNodeRequest.encode({
      from: params?.from,
      id: params?.id,
      nodeAddress: params?.nodeAddress,
    }).finish(),
  };
}

export function buildStartLeaseStatusMessage(params: {
  from: string;
  nodeAddress: string;
  hours: Long;
  denom: string;
  renewalPricePolicy: RenewalPricePolicy;
}) {
  return {
    typeUrl: TYPE_URLS.START_LEASE,
    value: MsgStartLeaseRequest.encode({
      from: params?.from,
      nodeAddress: params?.nodeAddress,
      hours: params?.hours,
      denom: params?.denom,
      renewalPricePolicy: 3,
    }).finish(),
  };
}
export function buildEndLeaseStatusMessage(params: {
  from: string;
  id: number;
}) {
  return {
    typeUrl: TYPE_URLS.END_LEASE,
    value: MsgEndLeaseRequest.encode({
      from: params?.from,
      id: Long.fromNumber(params.id),
    }).finish(),
  };
}

export function buildUpdatePlanStatusMessage(params: {
  from: string;
  id: Long;
  status: Status;
}) {
  return {
    typeUrl: TYPE_URLS.UPDATE_PLAN_STATUS,
    value: MsgUpdatePlanStatusRequest.encode({
      from: params?.from,
      id: params?.id,
      status: params?.status,
    }).finish(),
  };
}

export function buildRegisterProviderMessage(params: {
  from: string;
  name?: string;
  identity?: string;
  website?: string;
  description?: string;
}) {
  return {
    typeUrl: TYPE_URLS.REGISTER_PROVIDER,
    value: MsgRegisterProviderRequest.encode({
      from: params?.from, // bech32 address and also signer msg with same msnemnics for thsi transaction
      name: params?.name || "",
      identity: params?.identity || "",
      website: params?.website || "",
      description: params?.description || "",
    }).finish(),
  };
}

export function buildUpdateProviderStatusMessage(params: {
  from: string;
  status: Status;
}) {
  return {
    typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
    value: MsgUpdateProviderStatusRequest.encode({
      from: params.from, //provider address
      status: params.status,
    }).finish(),
  };
}
