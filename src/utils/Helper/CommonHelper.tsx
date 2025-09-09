import { Buffer } from "buffer";
import sha3 from "js-sha3";
import { Registry } from "@cosmjs-evm/proto-signing";
import {
  SigningStargateClient,
  GasPrice,
  calculateFee,
} from "@cosmjs-evm/stargate";

import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { envConstants } from "../../Constant/envConstants";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";

window.Buffer = Buffer;

declare module "@hanchon/signature-to-pubkey" {
  export function signatureToPubkey(sig: string, msgHash: Uint8Array): string;
}

// Common Helpers
function isSet(value: unknown): boolean {
  return value !== null && value !== undefined;
}

function messageToAminoTransaction(signer: string, data: string) {
  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: { gas: "0", amount: [] },
    msgs: [{ type: "sign/MsgSignData", value: { signer, data } }],
    memo: "",
  };
}

export const computePubKey = (
  address: string,
  signature: string,
  signMessage: string
) => {
  try {
    const aminoEncoded = messageToAminoTransaction(
      address,
      Buffer.from(signMessage).toString("base64")
    );
    const serialized = serializeSignDoc(aminoEncoded);
    const hashed = sha3.keccak_256(arrayify(serialized));

    const signatureToCompare = `0x${Buffer.from(signature, "base64").toString(
      "hex"
    )}`;
    const pubkeyComputed = signatureToPubkey(
      signatureToCompare,
      Buffer.from(hashed, "hex")
    );

    return pubkeyComputed;
  } catch (err) {
    console.error("err", err);
  }
};

// Wallet / Client Init
export async function initTx() {
  const config = {
    rpcEndpoint: envConstants.rpc_endpoint,
    gasPrice: envConstants.gas_price,
    gasLimit: parseInt(envConstants.gas_limit),
    prefix: envConstants.chain_prefix,
    hdPath: envConstants.hd_path || "m/44'/60'/0'/0/0",
    chainId: envConstants.chainId,
  };

  if (!window.keplr) return { error: "Please install Keplr extension" };

  await window.keplr.enable(config.chainId);
  const signer: any = window.keplr.getOfflineSigner(config.chainId);
  const accounts = await signer.getAccounts();
  const walletAddress = accounts[0].address;

  const registry = new Registry();
  const gasPrice = GasPrice.fromString(config.gasPrice);

  const signingClient = await SigningStargateClient.connectWithSigner(
    config.rpcEndpoint,
    signer,
    { gasPrice, registry }
  );

  return {
    offlineSigner: signer,
    client: signingClient,
    registry,
    address: walletAddress,
    config,
  };
}

// Msg Types & Builders
export const TYPE_URLS = {
  CREATE_PLAN: "/qubetics.plan.v3.MsgCreatePlanRequest",
  UPDATE_PLAN_STATUS: "/qubetics.plan.v3.MsgUpdatePlanStatusRequest",
  START_LEASE: "/qubetics.lease.v1.MsgStartLeaseRequest",
  UPDATE_NODE_STATUS: "/qubetics.node.v3.MsgUpdateNodeStatusRequest",
  LINK_NODE: "/qubetics.plan.v3.MsgLinkNodeRequest",
  UNLINK_NODE: "/qubetics.plan.v3.MsgUnlinkNodeRequest",
};

function createBaseMsgLinkNodeRequest() {
  return { from: "", id: Long.UZERO, nodeAddress: "" };
}

export const MsgLinkNodeRequest = {
  encode(message: any, writer = _m0.Writer.create()) {
    if (message.from !== "") writer.uint32(10).string(message.from);
    if (!message.id.equals(Long.UZERO)) writer.uint32(16).uint64(message.id);
    if (message.nodeAddress !== "") {
      writer.uint32(26).string(message.nodeAddress);
    }

    return writer;
  },
  decode(input: any, length?: number) {
    const reader =
      input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message: any = createBaseMsgLinkNodeRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.from = reader.string();
          continue;
        case 2:
          message.id = reader.uint64();
          continue;
        case 3:
          message.nodeAddress = reader.string();
          continue;
      }
      if ((tag & 7) === 4 || tag === 0) break;
      reader.skipType(tag & 7);
    }

    return message;
  },
  fromJSON(obj: any) {
    return {
      from: isSet(obj.from) ? String(obj.from) : "",
      id: isSet(obj.id) ? Long.fromValue(obj.id) : Long.UZERO,
      nodeAddress: isSet(obj.nodeAddress) ? String(obj.nodeAddress) : "",
    };
  },
  toJSON(message: any) {
    return {
      from: message.from || "",
      id: message.id?.toString() || "0",
      nodeAddress: message.nodeAddress || "",
    };
  },
  fromPartial(object: any) {
    return {
      from: object.from ?? "",
      id: object.id ? Long.fromValue(object.id) : Long.UZERO,
      nodeAddress: object.nodeAddress ?? "",
    };
  },
};

export function buildLinkNodeMessage(params: {
  from: string;
  id: number;
  nodeAddress: string;
}) {
  return {
    typeUrl: TYPE_URLS.LINK_NODE,
    value: MsgLinkNodeRequest.fromPartial(params),
  };
}

// Broadcast Utils
export async function broadcastTx(ctx: any, messages: any[], memo: string) {
  const prepared = messages.map((m) => ({
    typeUrl: m.typeUrl,
    value: m.value,
  }));
  const gasPrice = GasPrice.fromString(ctx.config.gasPrice);
  const fee = calculateFee(ctx.config.gasLimit, gasPrice);

  const result = await ctx.client.signAndBroadcast(
    ctx.address,
    prepared,
    fee,
    memo
  );

  if (result.code !== 0) {
    throw new Error(`Transaction failed: ${result.rawLog}`);
  }

  return result;
}

// Example Flow
export async function linkNode(authData: string) {
  try {
    const ctx: any = await initTx();

    ctx.registry.register(TYPE_URLS.LINK_NODE, MsgLinkNodeRequest);

    const message = buildLinkNodeMessage({
      from: authData,
      id: 8,
      nodeAddress: "qubeticsnode1ln23krwphrpcph35wgzra5z3all7fnh6lvy740",
    });

    const result = await broadcastTx(ctx, [message], "Create Plan");

    return {
      txnHash: result.transactionHash,
      gasUsed: result.gasUsed,
    };
  } catch (error) {
    return { error };
  }
}
