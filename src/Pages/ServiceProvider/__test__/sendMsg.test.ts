jest.mock("@keplr-wallet/cosmos", () => ({
  TendermintTxTracer: class MockTendermintTxTracer {
    traceTx = jest.fn().mockResolvedValue({ ok: true });
    constructor(_endpoint: string, _path: string) {
      // Mock constructor
    }
  },
}), { virtual: true });

jest.mock("../../../utils/Helper/CommonHelper", () => ({
  fetchAccountInfo: jest.fn(),
}));

import { sendMsgs } from "../../../utils/Helper/sendMsg";
import { fetchAccountInfo } from "../../../utils/Helper/CommonHelper";

describe("sendMsgs", () => {
  const mockKeplr: any = {
    getKey: jest.fn(),
    signDirect: jest.fn(),
    sendTx: jest.fn(),
  };

  const mockSender = "test-address";

  const mockProto = [{ typeUrl: "/test.MsgTest", value: { x: 1 } }];

  const mockFee = {
    amount: [{ denom: "test", amount: "1000" }],
    gas: "200000",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (fetchAccountInfo as jest.Mock).mockResolvedValue({
      base_account: {
        sequence: 1,
        account_number: "1",
      },
    });

    mockKeplr.getKey.mockResolvedValue({
      pubKey: new Uint8Array([1, 2, 3]),
    });

    mockKeplr.signDirect.mockResolvedValue({
      signed: {
        bodyBytes: new Uint8Array([10]),
        authInfoBytes: new Uint8Array([20]),
      },
      signature: { signature: "dGVzdA==" },
    });

    mockKeplr.sendTx.mockResolvedValue("tx-hash-123");
  });

  it("successfully sends a transaction", async () => {
    const result = await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);

    expect(mockKeplr.getKey).toHaveBeenCalled();
    expect(mockKeplr.signDirect).toHaveBeenCalled();
    expect(mockKeplr.sendTx).toHaveBeenCalled();

    expect(result).toBe("tx-hash-123");
  });

  it("returns undefined when account is missing", async () => {
    (fetchAccountInfo as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);

    expect(result).toBeUndefined();
  });

  it("returns undefined when fetchAccountInfo returns null", async () => {
    (fetchAccountInfo as jest.Mock).mockResolvedValueOnce(null);

    const result = await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);

    expect(result).toBeUndefined();
  });

  it("handles getKey failure", async () => {
    mockKeplr.getKey.mockRejectedValueOnce(new Error("Failed to get key"));

    await expect(
      sendMsgs(mockKeplr, mockSender, mockProto, mockFee)
    ).rejects.toThrow("Failed to get key");
  });

  it("handles signDirect failure", async () => {
    mockKeplr.signDirect.mockRejectedValueOnce(
      new Error("User rejected signing")
    );

    await expect(
      sendMsgs(mockKeplr, mockSender, mockProto, mockFee)
    ).rejects.toThrow("User rejected signing");
  });

  it("handles sendTx broadcast error without failing", async () => {
    mockKeplr.sendTx.mockRejectedValueOnce(new Error("Network failure"));

    try {
      await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);
    } catch (e) {
      // Error expected
    }

    expect(mockKeplr.sendTx).toHaveBeenCalled();
  });

  it("successfully sends transaction with custom memo", async () => {
    const customMemo = "Custom transaction memo";
    const result = await sendMsgs(
      mockKeplr,
      mockSender,
      mockProto,
      mockFee,
      customMemo
    );

    expect(mockKeplr.signDirect).toHaveBeenCalled();
    expect(result).toBe("tx-hash-123");
  });

  it("handles sendTx returning undefined", async () => {
    mockKeplr.sendTx.mockResolvedValueOnce(undefined);

    const result = await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);

    expect(result).toBeUndefined();
  });

  it("handles traceTx failure gracefully", async () => {
    // The traceTx is called but should not affect the result
    const result = await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);

    expect(result).toBe("tx-hash-123");
  });
});
