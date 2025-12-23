// @ts-nocheck
import { envConstants } from "../../Constant/envConstants";
import { simulateMsgs } from "../../utils/Helper/stimulateMsg";
import { sendMsgs } from "../../utils/Helper/sendMsg";

import { toast } from "react-toastify";
import { PROCESS_TRANSACTION_ERRORS } from "../../Constant/constants";

export const processTransaction = async (message) => {
  if (window?.keplr) {
    try {
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
        [{ denom: "tics", amount: "100000000" }]
      );

      if (gasUsed > 0) {
        const gasLimit = Math.floor(gasUsed * 1.3);
        const feeAmount = Math.ceil(envConstants.gas_limit * gasPrice).toString();
        const res = await sendMsgs(window.keplr, key.bech32Address, [message], {
          amount: [{ denom: "tics", amount: feeAmount }],
          gas: Math.floor(gasUsed * 1.5).toString(),
        });
        return res;
      } else {
        return false;
      }
    } catch (error) {
      const message = error?.message || String(error);

      for (const err of PROCESS_TRANSACTION_ERRORS) {
        if (message && message.includes(err.match)) {
          toast.error(err.toast, { toastId: err.id });
        }
      }

      console.log(error, "error while signing transaction");
      return false;
    }
  }
};
