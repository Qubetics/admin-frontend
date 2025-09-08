//@ts-nocheck
import { Buffer } from "buffer";
import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";
// import { SigningStargateClient, GasPrice, calculateFee } from "@cosmjs/stargate";
// import { Registry } from "@cosmjs/proto-signing";
// import Long from "long";
// import * as _m0 from "protobufjs/minimal";
// import { env } from "../../Constant/envConstants";
// import { useIsLoggedIn } from "../../Context/LoggedInContext";

// const {authData}=useIsLoggedIn();
// console.log("🚀 ~ authData:", authData);

// polyfill for Buffer in browser
(window as any).Buffer=Buffer

function messageToAminoTransaction(signer: string, data: string) {
  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: {
      gas: "0",
      amount: [],
    },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: {
          signer,
          data,
        },
      },
    ],
    memo: "",
  };
}

export const computePubKey = (
  address: string,
  signature: string,
  signMessage: string
)=> {
  try {
    // Encode the message into amino format
    const aminoEncoded = messageToAminoTransaction(
      address,
      Buffer.from(signMessage).toString("base64")
    );
    const serialized = serializeSignDoc(aminoEncoded);

    // Hash the amino message that was signed
    const hashed = sha3.keccak_256(arrayify(serialized));

    // Convert signature to hex
    const signatureToCompare = `0x${Buffer.from(signature, "base64").toString(
      "hex"
    )}`;

    // Derive pubkey
    const pubkeyComputed = signatureToPubkey(
      signatureToCompare,
      Buffer.from(hashed, "hex")
    );

    console.log("🚀 ~ computePubKey ~ pubkeyComputed:", pubkeyComputed);
    return pubkeyComputed;
  } catch (err) {
    console.error("computePubKey error:", err);
  }
};




// export default async function initTx() {
//     const config = {
//       rpcEndpoint: env.rpc_endpoint || "http://111.119.235.25:26657",
//       gasPrice: env.gas_price,
//       gasLimit: parseInt(env.gas_limit),
//       prefix: env.chain_prefix ,
//       hdPath: env.hd_path || "m/44'/60'/0'/0/0",
//       chainId:env.chainId
//     };
  
//     if (!window.keplr) {
//       alert("Please install Keplr extension");
//       return;
//     }

//     // Enable the Keplr wallet for your chain
//     await window.keplr.enable(config.chainId);

//     // Get signer
//     const signer = window.keplr.getOfflineSigner(config.chainId);
//     // setOfflineSigner(signer);

//     // Get wallet address
//     const accounts = await signer.getAccounts();
//     const walletAddress = accounts[0].address;
//     // setAddress(walletAddress);
//     console.log( `Using address: ${walletAddress}`);

//     // Setup Registry & Gas Price
//     const newRegistry = new Registry();
//     // setRegistry(newRegistry);
//     const gasPrice = GasPrice.fromString(config.gasPrice);

//     // Connect client
//     const signingClient = await SigningStargateClient.connectWithSigner(
//       config.rpcEndpoint,
//       signer,
//       { gasPrice, registry: newRegistry }
//     );
//     console.log("🚀 ~ initTx ~ signingClient:", signingClient)
//     // setClient(signingClient);

//     return {
//       offlineSigner: signer,
//       client: signingClient,
//       registry: newRegistry,
//       address: walletAddress,
//       config
//     };
//     // { connectWallet, offlineSigner, client, registry, address };
//   }


// export async function linkNode() {
//     try {
//       console.log("🚀 Starting link node...");
  
//       const ctx = await initTx();
//       registerType(ctx, TYPE_URLS.LINK_NODE, MsgLinkNodeRequest);

  
//       const message = buildLinkNodeMessage({
//         id: 8,
//         nodeAddress: "qubeticsnode1ln23krwphrpcph35wgzra5z3all7fnh6lvy740" //node address
//       });
//       console.log("🚀 ~ linkNode ~ message:", message)
      
  
//       const result:any = await broadcastTx(ctx, [message], "Create Plan");
//       console.log("🎉 Success!");
//       console.log(`📋 TX Hash: ${result.transactionHash}`);
//       console.log(`⛽ Gas Used: ${result.gasUsed}`);
//       // return result;
  
//     } catch (error) {
//       console.error("❌ Error:", error instanceof Error ? error.message : error);
//       throw error;
//     }
//   }

//   export function registerType(ctx:any, typeUrl:any ,messageClass:any){
//     ctx.registry.register(typeUrl, messageClass);
//   }
//   export const TYPE_URLS = {
//     // Plan messages
//     CREATE_PLAN: "/qubetics.plan.v3.MsgCreatePlanRequest",
//     UPDATE_PLAN_STATUS: "/qubetics.plan.v3.MsgUpdatePlanStatusRequest",
//     START_LEASE: "/qubetics.lease.v1.MsgStartLeaseRequest",
//     UPDATE_NODE_STATUS: "/qubetics.node.v3.MsgUpdateNodeStatusRequest",
//     LINK_NODE: "/qubetics.plan.v3.MsgLinkNodeRequest",
//     UNLINK_NODE: "/qubetics.plan.v3.MsgUnlinkNodeRequest",
  
//   }


//   export const MsgLinkNodeRequest = {
//     encode(message:any, writer = _m0.Writer.create()) {
//       if (message.from !== "") {
//         writer.uint32(10).string(message.from);
//       }
//       if (!message.id.equals(Long.UZERO)) {
//         writer.uint32(16).uint64(message.id);
//       }
//       if (message.nodeAddress !== "") {
//         writer.uint32(26).string(message.nodeAddress);
//       }
//       return writer;
//     },
  
//     //@ts-ignore
//     decode(input:any, length) {
//       const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
//       let end = length === undefined ? reader.len : reader.pos + length;
//       const message = createBaseMsgLinkNodeRequest();
//       while (reader.pos < end) {
//         const tag = reader.uint32();
//         switch (tag >>> 3) {
//           case 1:
//             if (tag !== 10) {
//               break;
//             }
  
//             message.from = reader.string();
//             continue;
//           case 2:
//             if (tag !== 16) {
//               break;
//             }
  
//             message.id = reader.uint64() ;
//             continue;
//           case 3:
//             if (tag !== 26) {
//               break;
//             }
  
//             message.nodeAddress = reader.string();
//             continue;
//         }
//         if ((tag & 7) === 4 || tag === 0) {
//           break;
//         }
//         reader.skipType(tag & 7);
//       }
//       return message;
//     },

//     //@ts-ignore
  
//     fromJSON(object){
//       return {
//         from: isSet(object.from) ? String(object.from) : "",
//         id: isSet(object.id) ? Long.fromValue(object.id) : Long.UZERO,
//         nodeAddress: isSet(object.nodeAddress) ? String(object.nodeAddress) : "",
//       };
//     },

//     //@ts-ignore
  
//     toJSON(message) {
//       const obj:any = {};
//       if (message.from !== "") {
//         obj.from = message.from;
//       }
//       if (!message.id.equals(Long.UZERO)) {
//         obj.id = (message.id || Long.UZERO).toString();
//       }
//       if (message.nodeAddress !== "") {
//         obj.nodeAddress = message.nodeAddress;
//       }
//       return obj;
//     },
  
//     //@ts-ignore
//     create(base) {
//       return MsgLinkNodeRequest.fromPartial(base ?? ({} ));
//     },
//     fromPartial(object:any) {
//       const message = createBaseMsgLinkNodeRequest();
//       message.from = object.from ?? "";
//       message.id = (object.id !== undefined && object.id !== null) ? Long.fromValue(object.id) : Long.UZERO;
//       message.nodeAddress = object.nodeAddress ?? "";
//       return message;
//     },
//   };

//   function createBaseMsgLinkNodeRequest() {
//     return { from: "", id: Long.UZERO, nodeAddress: "" };
//   }

//   //@ts-ignore
//   function isSet(value)  {
//     return value !== null && value !== undefined;
//   }

//   //@ts-ignore
//   export function buildLinkNodeMessage(params){
//     return {
//       typeUrl: TYPE_URLS.LINK_NODE,
//       value: MsgLinkNodeRequest.fromPartial({
//         from: authData,
//         id: params?.id,
//         nodeAddress: params?.nodeAddress,
//       }),
//     };
//   }

//   export async function broadcastTx(ctx, messages, memo) {
//     try {
      
//     } catch (error) {
      
//     }
//     const prepared = messages.map((m) => ({ typeUrl: m.typeUrl, value: m.value }));
//     console.log(ctx,"<<<<<<<<<<<<<ctx.config.gasPrice!!!!")
//     const gasPrice = GasPrice.fromString(ctx.config.gasPrice);
//     const fee = calculateFee(ctx.config.gasLimit, gasPrice);
//     console.log(ctx.address, prepared, fee, memo,"nsjcndsjnjcdsc")
//     const result = await ctx.client.signAndBroadcast(ctx.address, prepared, fee, memo);
//     // if (result.code !== 0) {
//     //   throw new Error(Transaction failed: ${result.rawLog});
//     // }
//     // return result;
//   }