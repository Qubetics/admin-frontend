"use client";
import { createProtobufRpcClient, QueryClient } from "@cosmjs/stargate";
import { QueryClientImpl } from "cosmjs-types/cosmos/bank/v1beta1/query";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";
import { noExponential } from "../utils/Helper/CommonHelper";
import { envConstants } from "../Constant/envConstants";

export async function getUserBalance(address: string) {
  try {
    const rpcEndpoint = import.meta.env.VITE_RPC_ENDPOINT as string;
    const tendermint = await Tendermint37Client.connect(rpcEndpoint);
    const queryClient = new QueryClient(tendermint);
    const rpcClient = createProtobufRpcClient(queryClient);
    const bankQueryService = new QueryClientImpl(rpcClient);
    const denom = envConstants.denom;
    const { balance } = await bankQueryService.Balance({
      address,
      denom,
    });
    const remainingBalance = noExponential(Number(balance?.amount) / 10 ** 18);
    return remainingBalance;
  } catch (error) {
    console.error("Error fetching user balance:", error);
    return "0";
  }
}
