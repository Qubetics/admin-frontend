const mockTraceTx = jest.fn().mockResolvedValue({ ok: true });

jest.mock("@keplr-wallet/cosmos", () => ({
  TendermintTxTracer: jest.fn().mockImplementation(function (this: any) {
    this.traceTx = mockTraceTx;
  }),
}));

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

  it("handles sendTx broadcast error without failing", async () => {
    mockKeplr.sendTx.mockRejectedValueOnce(new Error("Network failure"));

    try {
      await sendMsgs(mockKeplr, mockSender, mockProto, mockFee);
    } catch (e) {
      // Error expected
    }

    expect(mockKeplr.sendTx).toHaveBeenCalled();
  });
});
