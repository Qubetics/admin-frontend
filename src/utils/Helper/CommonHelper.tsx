import { Buffer } from "buffer";
import sha3 from "js-sha3";
import * as _m0 from "protobufjs/minimal";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";

window.Buffer = Buffer;

declare module "@hanchon/signature-to-pubkey" {
  export function signatureToPubkey(sig: string, msgHash: Uint8Array): string;
}
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { envConstants } from "../../Constant/envConstants";

import bech32 from "bech32";
import { DECIMAL_PLACES } from "../../Constant/constants";

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

export const api = async (url: string, init?: RequestInit) => {
  return fetch(url, init)
    .then(async (response) => {
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.message || "Something went wrong!";
        throw new Error(errorMessage);
      }

      return data;
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchAccountInfo = async (address: string) => {
  try {
    const uri = `${envConstants.swagger_api}/cosmos/auth/v1beta1/accounts/${address}`;
    const response = await api(uri);
    return response.account;
  } catch (e) {
    console.log(e, "ERROR");
    console.error(
      "This may be a new account. Please send some tokens to this account first."
    );

    return undefined;
  }
};

export const convertNodeToWallet = (address: any, walletPrefix: any) => {
  // Decode node address
  const decoded = bech32.decode(address);
  const words = decoded.words;

  // Re-encode with wallet prefix
  return bech32.encode(walletPrefix, words);
};

export const ModifyNum = (value:any) => {
  if (value.includes('.')) {
    const data = value.split('.')[1]
    const res = value.replace('.', '')
    const zeroes = '0'.repeat(DECIMAL_PLACES - data.length)
    return res + zeroes
  } else {
    const zeroes = '0'.repeat(DECIMAL_PLACES)
    return value + zeroes
  }
};

// Timestamp.tsx
export const Timestamp = (value: string | number | Date): string => {
  // Convert input to Date
  const date = new Date(value);

  // Format options
  const options: Intl.DateTimeFormatOptions = { 
    year: "numeric", 
    month: "numeric", 
    day: "numeric", 
    hour: "numeric", 
    minute: "2-digit", 
    hour12: true 
  };

  return date.toLocaleString("en-US", options);
};
