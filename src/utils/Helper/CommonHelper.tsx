import { Buffer } from "buffer";
import sha3 from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { signatureToPubkey } from "@hanchon/signature-to-pubkey";

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
