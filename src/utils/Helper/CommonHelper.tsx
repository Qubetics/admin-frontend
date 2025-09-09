import { Buffer } from "buffer";
import { keccak_256 } from "js-sha3";
import { arrayify } from "@ethersproject/bytes";
import { serializeSignDoc } from "@cosmjs/launchpad";
import { recoverPublicKey } from "@ethersproject/signing-key";
import { envConstants } from "../../Constant/envConstants";
import   bech32  from'bech32';


function messageToAminoTransaction(signer: string, data: string) {
  return {
    chain_id: "",
    account_number: "0",
    sequence: "0",
    fee: { gas: "0", amount: [] },
    msgs: [
      {
        type: "sign/MsgSignData",
        value: { signer, data },
      },
    ],
    memo: "",
  };
}

// Crypto Utils
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

    const hashed = keccak_256(arrayify(serialized)); // hex (no 0x prefix)

    const signatureHex = `0x${Buffer.from(signature, "base64").toString(
      "hex"
    )}`;

    return { pubKey: recoverPublicKey("0x" + hashed, signatureHex) };
  } catch (err) {
    return { error: err };
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

      return data ;
    })
    .catch((error) => {
      throw error;
    });
};

export const fetchAccountInfo = async (
  address:string
) => {
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
}


export const convertNodeToWallet=(address:any, walletPrefix:any)=> {
  // Decode node address
  const decoded = bech32.decode(address);
  const words = decoded.words;

  // Re-encode with wallet prefix
  return bech32.encode(walletPrefix, words);
}
