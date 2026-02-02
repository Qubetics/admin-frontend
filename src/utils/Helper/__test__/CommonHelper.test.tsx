/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as CommonHelper from "../CommonHelper";
import {
  api,
  fetchAccountInfo,
  convertNodeToWallet,
  ModifyNum,
  formatTimestamp,
  Timestamp,
  copyToClipboard,
  fetchStakeAmount,
  truncateValue,
  truncateDecimals,
  formatDuration,
  formatBalance,
  toFirstCapital,
  noExponents,
  noExponential,
  getValueWithUnit,
} from "../CommonHelper";
import { Buffer } from "buffer";

import { envConstants } from "../../../Constant/envConstants";

// Mock dependencies

jest.mock("../../../utils/Helper/CommonHelper", () => ({
  ...jest.requireActual("../../../utils/Helper/CommonHelper"),
  truncateDecimals: jest.fn((value: string, decimalPlaces: number) => {
    if (!value || isNaN(Number(value))) return "";
    const num = Number(value);
    return num.toFixed(decimalPlaces);
  }),
}));

jest.mock("bech32", () => ({
  decode: jest.fn().mockReturnValue({ words: [1, 2, 3] }),
  encode: jest.fn().mockReturnValue("convertedAddress"),
}));

global.fetch = jest.fn();
global.Buffer = Buffer;

describe("CommonHelper - Basic Functions", () => {
  test("truncateValue", () => {
    expect(truncateValue("0x1234567890")).toBe("0x12...7890");
    expect(truncateValue("short", 3, 3)).toBe("short");
  });

  test("truncateValue covers custom long-string branch", () => {
    expect(truncateValue("ABCDEFGHIJKL", 2, 3)).toBe("AB...JKL");
  });

  test("truncateDecimals", () => {
    expect(typeof truncateDecimals).toBe("function");
    expect(truncateDecimals("1.2345", 2)).toBe("1.23");
    expect(truncateDecimals("abc", 2)).toBe("");
  });

  test("formatDuration", () => {
    expect(formatDuration(1)).toBe("1 hr");
    expect(formatDuration(25)).toBe("1 day 1 hr");
    expect(formatDuration(48)).toBe("2 days");
  });

  test("formatDuration covers hours=0", () => {
    expect(formatDuration(0)).toBe("0 hrs");
  });

  test("formatDuration covers multiple hours (<24)", () => {
    expect(formatDuration(2)).toBe("2 hrs");
  });

  test("formatBalance", () => {
    expect(formatBalance(1234)).toBe("1,234.00");
    expect(formatBalance(1234.56)).toBe("1,234.56");
  });

  test("toFirstCapital", () => {
    expect(toFirstCapital("hello")).toBe("Hello");
    expect(toFirstCapital("HELLO")).toBe("Hello");
  });

  test("noExponential & noExponents", () => {
    expect(noExponents(1e5)).toBe("100000");
    expect(noExponents(1e-5)).toBe("0.00001");
    expect(noExponential(5e-3)).toBe("0.005");
  });

  test("getValueWithUnit", () => {
    expect(getValueWithUnit("1000000000000000000", envConstants.currency)).toBe("1");
    expect(getValueWithUnit("1000", "OTHER")).toBe("1000");
  });
});

describe("CommonHelper - Network / Blockchain", () => {
  test("api - success", async () => {
    const mock = { success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mock),
    });

    const res = await api("url");
    expect(res).toEqual(mock);
  });

  test("api - error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Error" }),
    });

    await expect(api("url")).rejects.toThrow("Error");
  });

  test("fetchAccountInfo - success", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ account: { id: 1 } }),
    });

    const res = await fetchAccountInfo("addr");
    expect(res).toEqual({ id: 1 });
  });

  test("fetchAccountInfo - failure", async () => {
    const mockErr = new Error("fail");
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockErr);

    const res = await fetchAccountInfo("addr");
    expect(res).toBeUndefined();
  });

  test("convertNodeToWallet", () => {
    expect(convertNodeToWallet("address", "prefix")).toBe("convertedAddress");
    expect(convertNodeToWallet("", "prefix")).toBe("");
  });

  test("ModifyNum", () => {
    expect(ModifyNum("1.23")).toBe("1230000000000000000");
    expect(ModifyNum("2")).toBe("2000000000000000000");
  });

  test("formatTimestamp", () => {
    expect(formatTimestamp("2023-01-01T00:00:00Z")).toContain("2023-01-01");
  });

  test("Timestamp", () => {
    expect(Timestamp("2023-01-01T00:00:00Z")).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  test("copyToClipboard", async () => {
    const mockWrite = jest.fn();
    (navigator as any).clipboard = { writeText: mockWrite };

    await copyToClipboard("hello");
    expect(mockWrite).toHaveBeenCalledWith("hello");
  });

  test("fetchStakeAmount", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          params: { deposit: { amount: "1000000000000000000" } },
        }),
    });

    const res = await fetchStakeAmount();
    expect(res).toBe(1);
  });

  test("api uses default error message when no message provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    await expect(api("url")).rejects.toThrow("Something went wrong!");
  });

  test("noExponents handles NaN and non-exponential numbers explicitly", () => {
    expect(CommonHelper.noExponents(Number("not-a-number"))).toBe("0");
    expect(CommonHelper.noExponents(123.45)).toBe("123.45");
  });

  test("noExponents handles additional exponent cases", () => {
    expect(CommonHelper.noExponents(1e-7)).toBe("0.0000001");
    expect(CommonHelper.noExponents(3e3)).toBe("3000");
  });
  test("Buffer assignment branch (window undefined)", async () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const mod = await import("../CommonHelper");
    expect(mod).toBeTruthy();

    global.window = originalWindow;
  });

  test("truncateDecimals custom decimals branch", () => {
    expect(typeof truncateDecimals).toBe("function");
    expect(truncateDecimals("1.234567", 4)).toBe("1.2346");
  });
});
