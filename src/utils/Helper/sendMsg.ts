import {
  AuthInfo,
  Fee,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import Long from "long";
import { Buffer } from "buffer";
import { fetchAccountInfo } from "./CommonHelper";
import { envConstants } from "../../Constant/envConstants";


export const sendMsgs = async (
  keplr:any,
  sender: string,
  proto: any,
  fee:any,
  memo = ""
) => {
  const account = await fetchAccountInfo( sender);
  console.log("🚀 ~ sendMsgs ~ account:", account)
  const { pubKey } = await keplr.getKey(envConstants.chainId);

  if (account) {
    const signDoc = {
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: proto,
          memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          {
            publicKey: {
              typeUrl: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
              value: PubKey.encode({
                key: pubKey,
              }).finish(),
            },
            modeInfo: {
              single: {
                mode: SignMode.SIGN_MODE_DIRECT,
              },
              multi: undefined,
            },
            sequence: account.base_account.sequence,
          },
        ],
        fee: Fee.fromPartial({
          amount: fee.amount.map((coin:any) => {
            return {
              denom: coin.denom,
              amount: coin.amount.toString(),
            };
          }),
          gasLimit: fee.gas,
        }),
      }).finish(),
      chainId: envConstants.chainId,
      accountNumber: Long.fromString(account.base_account.account_number),
    };
    console.log("🚀 ~ sendMsgs ~ signDoc:", envConstants.chainId, sender, signDoc)
    

    const signed = await keplr.signDirect(envConstants.chainId, sender, signDoc);
    console.log("🚀 ~ sendMsgs ~ signed:", signed)

    const signedTx = {
      tx: TxRaw.encode({
        bodyBytes: signed.signed.bodyBytes,
        authInfoBytes: signed.signed.authInfoBytes,
        signatures: [Buffer.from(signed.signature.signature, "base64")],
      }).finish(),
      signDoc: signed.signed,
    };
    console.log("🚀 ~ sendMsgs ~ signedTx:", signedTx)

    const txHash = await broadcastTxSync(keplr, envConstants.chainId, signedTx.tx);
    console.log("🚀 ~ sendMsgs ~ txHash:", txHash)
    // const txTracer = new TendermintTxTracer(envConstants.rpc_endpoint, "/websocket");
    // txTracer.traceTx(txHash).then((tx) => {
    //   console.log("Transaction commit successfully");
    // });

    return txHash;
  }
};

export const broadcastTxSync = async (
  keplr:any ,
  chainId:any,
  tx:any
) => {
try{

    console.log(`🚀 ~ broadcastTxSync ~ hainId, tx, "sync":`, chainId, tx.toString(), "sync")
    return keplr.sendTx(chainId, tx, "sync" );
}
catch(errr)
{
    console.log(errr,"<<<<<<<<<<<<<<<<<<<<<<<<errr!!!!!")
}
};