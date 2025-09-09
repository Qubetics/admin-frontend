// @ts-nocheck
import { isMsgSend } from "@cosmjs/launchpad";
import { envConstants } from "../../Constant/envConstants";
import { simulateMsgs } from "../../utils/Helper/stimulateMsg";
import { MsgSend } from "../../proto-gen/src/codec/cosmos/bank/v1beta1/tx";
import { TYPE_URLS } from "../../Constant/constants";
import { sendMsgs } from "../../utils/Helper/sendMsg";
import Long from "long";
import { calculateFee, GasPrice } from "@cosmjs-evm/stargate";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { buildCreatePlanMessage } from "../BuildMessage/buildMessage";

export const processTransaction = async (message) => {
  if (window?.keplr) {
    try{
    const chainInfos = await window.keplr?.getChainInfosWithoutEndpoints();
    const chainId = envConstants.chainId;
    const gasPrice = envConstants.gas_price;
    const feeObj = chainInfos.find((c) => c.chainId === chainId);
    const key = await window.keplr?.getKey(chainId);

    const gasUsed = await simulateMsgs(
      window.keplr,
      chainId,
      key.bech32Address,
      [message],
      [{ denom: "tics", amount: "100000000" }] //Dummy payload just to get estimate fee
    );

    if (gasUsed > 0) {
    const gasLimit = Math.floor(gasUsed * 1.3); //Buffer added
    const feeAmount = Math.ceil(envConstants.gas_limit * gasPrice).toString();
    const res = await sendMsgs(window.keplr, key.bech32Address, [message], {
      amount: [{ denom: "tics", amount: feeAmount }],
      gas: Math.floor(gasUsed * 1.5).toString(),
    });
    }

    }catch(error)
    {
      console.log(error,"errror while signing transaction")
    }
  }
};


