import { TYPE_URLS } from "../../Constant/constants";
import {
  MsgCreatePlanRequest,
  MsgLinkNodeRequest,
  MsgUnlinkNodeRequest,
  MsgUpdatePlanStatusRequest,
} from "../../proto-gen/src/codec/qubetics/plan/v3/msg";
import { MsgStartLeaseRequest } from "../../proto-gen/src/codec/qubetics/lease/v1/msg";
import {
  MsgRegisterProviderRequest,
  MsgUpdateProviderStatusRequest,
} from "../../proto-gen/src/codec/qubetics/provider/v3/msg";

export function buildCreatePlanMessage(params?: {
  from?: any;
  gigabytes?: any;
  hours?: any;
  prices?: Array<{ denom: string; baseValue: string; quoteValue: string }>;
}) {
  return {
    typeUrl: TYPE_URLS.CREATE_PLAN,
    value: MsgCreatePlanRequest.encode({
      from: params?.from,
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
  from?: any;
  id?: any;
  nodeAddress?: any;
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

export function buildUnlinkNodeMessage(params: {
  from?: any;
  id?: any;
  nodeAddress?: any;
}) {
  return {
    typeUrl: TYPE_URLS.UNLINK_NODE,
    value: MsgUnlinkNodeRequest.encode({
      from: params?.from,
      id: params?.id,
      nodeAddress: params?.nodeAddress,
    }).finish(),
  };
}

export function buildStartLeaseStatusMessage(params: {
  from?: any;
  nodeAddress?: any;
  hours?: any;
  denom?: any;
  renewalPricePolicy?: any;
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

export function buildUpdatePlanStatusMessage(params: {
  from?: any;
  id: any;
  status: number;
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

export function buildRegisterProviderMessage(params?: {
  from?: string;
  name?: string;
  identity?: string;
  website?: string;
  description?: string;
}) {
  return {
    typeUrl: TYPE_URLS.REGISTER_PROVIDER,
    value: MsgRegisterProviderRequest.fromPartial({
      from: params?.from, // bech32 address and also signer msg with same msnemnics for thsi transaction
      name: params?.name || "",
      identity: params?.identity || "",
      website: params?.website || "",
      description: params?.description || "",
    }),
  };
}

export function buildUpdateProviderStatusMessage(params?: {
  from?: string;
  status?: number;
}) {
  return {
    typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
    value: MsgUpdateProviderStatusRequest.fromPartial({
      from: params?.from, //provider address
      status: params?.status,
    }),
  };
}
