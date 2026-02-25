import { WEI } from "../../Constant/constants";
import BigNumber from "bignumber.js";
import { Buffer } from "buffer";
import * as _m0 from "protobufjs/minimal";

window.Buffer = Buffer;

import { envConstants } from "../../Constant/envConstants";

import bech32 from "bech32";
import { DECIMAL_PLACES } from "../../Constant/constants";
import type { ButtonItem } from "../Interfaces";

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
    console.error("This may be a new account. Please send some tokens to this account first.");

    return undefined;
  }
};

export const convertNodeToWallet = (address: string, walletPrefix: string) => {
  if (!address) {
    return "";
  }
  const decoded = bech32.decode(address);
  const words = decoded.words;

  return bech32.encode(walletPrefix, words);
};

export const ModifyNum = (value: string) => {
  if (value.includes(".")) {
    const data = value.split(".")[1];
    const res = value.replace(".", "");
    const zeroes = "0".repeat(DECIMAL_PLACES - data.length);
    return res + zeroes;
  } else {
    const zeroes = "0".repeat(DECIMAL_PLACES);
    return value + zeroes;
  }
};

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";

  hours = hours % 12 || 12;

  return `${year}-${month}-${day} ${String(hours).padStart(2, "0")}:${minutes}${ampm}`;
};

export const Timestamp = (value: string | number | Date): string => {
  const date = new Date(value);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  return date.toLocaleString("en-US", options);
};

export const truncateValue = (value: string, start: number = 4, end: number = 4) => {
  if (!value) return "";
  if (value.length <= start + end) return value;
  return `${value.slice(0, start)}...${value.slice(-end)}`;
};

export const formatDuration = (hours: number) => {
  if (!hours && hours !== 0) return "";

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    const dayLabel = days === 1 ? "day" : "days";
    const hourLabel = remainingHours === 1 ? "hr" : "hrs";

    if (remainingHours > 0) {
      return `${days} ${dayLabel} ${remainingHours} ${hourLabel}`;
    } else {
      return `${days} ${dayLabel}`;
    }
  } else {
    const hourLabel = hours === 1 ? "hr" : "hrs";
    return `${hours} ${hourLabel}`;
  }
};

export const copyToClipboard = (text: string) => {
  return navigator.clipboard.writeText(text);
};

export const formatBalance = (amount: number) => {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getValueWithUnit = (value: string | number, unit: string = envConstants.currency) => {
  let unitBn: BigNumber.Value;
  switch (unit) {
    case envConstants.currency:
      unitBn = WEI;
      break;
    default:
      unitBn = new BigNumber(1);
  }

  const valueBn = new BigNumber(value);
  const valueCurr = valueBn.dividedBy(unitBn);
  const valueStr = valueCurr.toFixed();
  return valueStr;
};

export const toFirstCapital = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function noExponents(num: number): string {
  const n = Number(num);
  if (isNaN(n)) return "0";

  const data = String(n).split(/[eE]/);
  if (data.length === 1) return data[0];

  let z = "";
  const sign = n < 0 ? "-" : "";
  const str = data[0].replace(".", "");
  let mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace("-", "");
  }
  mag -= str.length;
  while (mag--) z += "0";
  return str + z;
}

export const noExponential = (num: number) => {
  return noExponents(num);
};

export const fetchStakeAmount = async () => {
  const uri = `${envConstants.swagger_api}/qubetics/provider/v3/params`;
  const response = await api(uri);

  const stake_amount = Number(response.params.deposit.amount) / 10 ** 18;

  return stake_amount;
};

export const toFirstCapitalCase = (str: string): string => {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const convertPlanString = (plan: any, tokenPrice: any): string => {
  const price = parseFloat(String(tokenPrice));
  const hasFiat = !isNaN(price) && price > 0;

  const fmt = (n: number): string => (Number.isInteger(n) ? String(n) : n.toFixed(2));

  if (plan?.prices?.length) {
    const priceObj = plan.prices[0];
    const denom = String(priceObj.denom ?? "TICS").toUpperCase();
    const raw = parseFloat(String(priceObj.quote_value));
    if (isNaN(raw)) return "-";
    const tics = raw / 1e18;
    if (hasFiat) return `$${(tics * price).toFixed(4)}/month (${fmt(tics)} ${denom})`;
    return `${fmt(tics)} ${denom}/month`;
  }

  if (plan !== null && plan !== undefined) {
    const raw = parseFloat(String(plan));
    if (isNaN(raw)) return String(plan);
    const tics = raw / 1e18;
    if (hasFiat) return `$${(tics * price).toFixed(4)}/month (${fmt(tics)} TICS)`;
    return `${fmt(tics)} TICS/month`;
  }

  return "-";
};

export const truncateDecimals = (value: string, decimalPlaces: number): string => {
  if (!value || isNaN(Number(value))) return "";
  const num = Number(value);
  return num.toFixed(decimalPlaces);
};

export const sanitizeInput = (value: string, field: string): string => {
  if (!value) return "";

  const htmlTag = /<\/?[^>]+>/gi;
  if (htmlTag.test(value)) return "";

  const jsAttack = /(javascript:|onerror=|onload=|<script|<\/script)/gi;
  if (jsAttack.test(value)) return "";

  const sqlAttack = /\b(drop table|insert into|delete from|update .* set|select .* from)\b/gi;
  if (sqlAttack.test(value)) return "";

  if (field === "email") {
    return value.replace(/\s+/g, "").replace(/[^a-zA-Z0-9@._-]/g, "");
  }

  if (field === "name") {
    let clean = value.replace(/<\/?[^>]+>/g, "");
    clean = clean.replace(/[^\p{L}\p{M}\p{N}\s.'-]/gu, "");
    clean = clean.replace(/^\s+/, "");
    clean = clean.replace(/\s{2,}/g, " ");
    return clean;
  }

  if (field === "website") {
    return value.replace(/"/g, "").replace(/<|>/g, "").trim();
  }

  return value;
};

export const getStatusClass = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "status-badge active";
    case "inactive":
      return "status-badge inactive";
    case "pending":
      return "status-badge pending";
    case "approved":
      return "status-badge approved";
    case "rejected":
      return "status-badge rejected";
    default:
      return "status-badge default";
  }
};

export const buttons = (countAccount?: {
  totalCount?: number;
  linkCount?: number;
  UnlinkCount?: number;
}): ButtonItem[] => [
  {
    label: (
      <>
        All <span>Requests</span>
      </>
    ),
    value: "allrequest",
    count: countAccount?.totalCount ?? 0,
  },
  {
    label: (
      <>
        Link <span>Requests</span>
      </>
    ),
    value: "Link",
    count: countAccount?.linkCount ?? 0,
  },
  {
    label: (
      <>
        Unlink <span>Requests</span>
      </>
    ),
    value: "Unlink",
    count: countAccount?.UnlinkCount ?? 0,
  },
];
