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
import { TendermintTxTracer } from "@keplr-wallet/cosmos";

export const sendMsgs = async (
  keplr: any,
  sender: string,
  proto: any,
  fee: any,
  memo = ""
) => {
  const account = await fetchAccountInfo(sender);
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
          amount: fee.amount.map((coin: any) => {
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

    const signed = await keplr.signDirect(
      envConstants.chainId,
      sender,
      signDoc
    );

    const signedTx = {
      tx: TxRaw.encode({
        bodyBytes: signed.signed.bodyBytes,
        authInfoBytes: signed.signed.authInfoBytes,
        signatures: [Buffer.from(signed.signature.signature, "base64")],
      }).finish(),
      signDoc: signed.signed,
    };

    const txHash = await broadcastTxSync(
      keplr,
      envConstants.chainId,
      signedTx.tx
    );
    const txTracer = new TendermintTxTracer(envConstants.rpc_endpoint, "/websocket");
    await txTracer.traceTx(txHash).then((tx:any) => {
      console.log(tx,"Transaction commit successfully");
    });

    return txHash;
  }
};

export const broadcastTxSync = async (keplr: any, chainId: any, tx: any) => {
  try {
    return keplr.sendTx(chainId, tx, "sync");
  } catch (errr) {
    console.log(errr, "error while broadcast");
  }
};
