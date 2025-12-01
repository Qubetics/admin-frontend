/* eslint-disable @typescript-eslint/no-explicit-any */
// __test__/processTransaction.test.tsx
import { processTransaction } from "../processTransaction";
import { simulateMsgs } from "../../../utils/Helper/stimulateMsg";
import { sendMsgs } from "../../../utils/Helper/sendMsg";
import { toast } from "react-toastify";

// Mock external modules
jest.mock("../../../utils/Helper/stimulateMsg", () => ({
  simulateMsgs: jest.fn(),
}));

jest.mock("../../../utils/Helper/sendMsg", () => ({
  sendMsgs: jest.fn(),
}));

jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe("processTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // mock window.keplr
    (global as any).window.keplr = {
      getChainInfosWithoutEndpoints: jest.fn().mockResolvedValue([
        { chainId: "testchain" },
      ]),
      getKey: jest.fn().mockResolvedValue({
        bech32Address: "test-address",
      }),
    };
  });

  const mockMsg = { typeUrl: "/test.Msg", value: {} };

  it("processes transaction successfully", async () => {
    (simulateMsgs as jest.Mock).mockResolvedValueOnce(1000);
    (sendMsgs as jest.Mock).mockResolvedValueOnce({
      success: true,
      transactionHash: "hash123",
    });

    const result = await processTransaction(mockMsg);

    expect(sendMsgs).toHaveBeenCalled();
    expect(result).toEqual({
      success: true,
      transactionHash: "hash123",
    });
  });

  it("handles transaction error", async () => {
    (simulateMsgs as jest.Mock).mockResolvedValueOnce(1000);
    (sendMsgs as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: "Error message",
    });

    const result = await processTransaction(mockMsg);

    expect(result).toEqual({
      success: false,
      error: "Error message",
    });
  });

  it("returns false when gasUsed = 0", async () => {
    (simulateMsgs as jest.Mock).mockResolvedValueOnce(0);

    const result = await processTransaction(mockMsg);
    expect(result).toBe(false);
  });

  it("handles generic network error", async () => {
    (simulateMsgs as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    const result = await processTransaction(mockMsg);
    expect(result).toBe(false);
  });

  it('handles "Request rejected" branch', async () => {
    (simulateMsgs as jest.Mock).mockRejectedValueOnce(
      new Error("Request rejected by user")
    );

    const result = await processTransaction(mockMsg);

    expect(toast.error).toHaveBeenCalledWith(
      "Transaction rejected",
      { toastId: "tx_rejected" }
    );
    expect(result).toBe(false);
  });

  it('handles "gigabytes cannot be negative" branch', async () => {
    (simulateMsgs as jest.Mock).mockRejectedValueOnce(
      new Error("gigabytes cannot be negative")
    );

    const result = await processTransaction(mockMsg);

    expect(toast.error).toHaveBeenCalledWith("Value can be negative", { toastId: "negative_gb" });
    expect(result).toBe(false);
  });
});
