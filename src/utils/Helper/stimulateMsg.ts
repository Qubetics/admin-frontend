//@ts-nocheck
import {
  AuthInfo,
  Fee,
  SignerInfo,
  TxBody,
  TxRaw,
} from "@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing";
import { PubKey } from "@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys";
import { api, fetchAccountInfo } from "./CommonHelper";
import { envConstants } from "../../Constant/envConstants";
import { Buffer } from "buffer";

export const simulateMsgs = async (
  keplr,
  chainId,
  sender,
  proto,
  fee,
  memo
) => {
  const account = await fetchAccountInfo(sender);
  console.log("🚀 ~ simulateMsgs ~ account:", account)


  const { pubKey } = await keplr.getKey(chainId);
  console.log("🚀 ~ simulateMsgs ~ pubKey:", pubKey)
  
  if (account) {
    const unsignedTx = TxRaw.encode({
      bodyBytes: TxBody.encode(
        TxBody.fromPartial({
          messages: proto,
          memo,
        })
      ).finish(),
      authInfoBytes: AuthInfo.encode({
        signerInfos: [
          SignerInfo.fromPartial({
            // Pub key is ignored.
            // It is fine to ignore the pub key when simulating tx.
            // However, the estimated gas would be slightly smaller because tx size doesn't include pub key.
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
          }),
        ],
        fee: Fee.fromPartial({
          amount: fee.map((coin:any) => {
            return {
              denom: coin.denom,
              amount: coin.amount.toString(),
            };
          }),
        }),
      }).finish(),
      // Because of the validation of tx itself, the signature must exist.
      // However, since they do not actually verify the signature, it is okay to use any value.
      signatures: [new Uint8Array(64)],
    }).finish();

    const simulatedResult = await api(
      `${envConstants.swagger_api}/cosmos/tx/v1beta1/simulate`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          tx_bytes: Buffer.from(unsignedTx).toString("base64"),
        }),
      }
    );

    const gasUsed = parseInt(simulatedResult?.gas_info.gas_used);
    if (Number.isNaN(gasUsed)) {
      throw new Error(
        `Invalid integer gas: ${simulatedResult?.gas_info.gas_used}`
      );
    }

    return gasUsed;
  }

  return undefined;
};