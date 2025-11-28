import { simulateMsgs } from "../src/utils/Helper/stimulateMsg";
import { fetchAccountInfo, api } from "../src/utils/Helper/CommonHelper";
import { envConstants } from "../src/Constant/envConstants";
import type { Keplr, ChainInfo } from "@keplr-wallet/types";

// Mock external dependencies
jest.mock("../src/utils/Helper/CommonHelper", () => ({
  fetchAccountInfo: jest.fn(),
  api: jest.fn(),
}));

jest.mock("../src/Constant/envConstants", () => ({
  envConstants: {
    swagger_api: "https://api.test.com",
  },
}));

// Mock @keplr-wallet/proto-types
jest.mock("@keplr-wallet/proto-types/cosmos/tx/v1beta1/tx", () => ({
  AuthInfo: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    }),
  },
  Fee: {
    fromPartial: jest.fn().mockReturnValue({
      amount: [],
    }),
  },
  SignerInfo: {
    fromPartial: jest.fn().mockReturnValue({
      publicKey: {},
      modeInfo: {},
      sequence: 1,
    }),
  },
  TxBody: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([4, 5, 6])),
    }),
    fromPartial: jest.fn().mockReturnValue({
      messages: [],
      memo: "",
    }),
  },
  TxRaw: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([7, 8, 9])),
    }),
  },
}));

// Mock @keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing
jest.mock("@keplr-wallet/proto-types/cosmos/tx/signing/v1beta1/signing", () => ({
  SignMode: {
    SIGN_MODE_DIRECT: 1,
  },
}));

// Mock @keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys
jest.mock("@keplr-wallet/proto-types/cosmos/crypto/secp256k1/keys", () => ({
  PubKey: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([10, 11, 12])),
    }),
  },
}));

// Mock Buffer
jest.mock("buffer", () => ({
  Buffer: {
    from: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue("base64-string"),
    }),
  },
}));

describe("simulateMsgs", () => {
  const mockKeplr: Partial<Keplr> = {
    getKey: jest.fn(),
  };

  const mockChainId: Partial<ChainInfo> = { chainId: "test-chain" };
  const mockSender = "test-sender";
  const mockProto = [{ typeUrl: "/test.Msg", value: new Uint8Array([1, 2, 3]) }];
  const mockFee: [{ denom: string; amount: string }] = [{ denom: "test", amount: "1000" }];
  const mockMemo = "test memo";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Successful simulation", () => {
    it("should simulate messages successfully with all parameters", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "1" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([13, 14, 15]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "50000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee,
        mockMemo
      );

      expect(result).toBe(50000);
      expect(fetchAccountInfo).toHaveBeenCalledWith(mockSender);
      expect(mockKeplr.getKey).toHaveBeenCalledWith(mockChainId);
      expect(api).toHaveBeenCalledWith(
        `${envConstants.swagger_api}/cosmos/tx/v1beta1/simulate`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            tx_bytes: "base64-string",
          }),
        }
      );
    });

    it("should simulate messages successfully with default memo", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "2" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([16, 17, 18]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "75000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(75000);
    });

    it("should handle numeric gas_used response", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "3" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([19, 20, 21]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "100000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(100000);
    });

    it("should handle zero gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "4" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([22, 23, 24]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "0" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(0);
    });

    it("should handle single fee item", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "5" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([25, 26, 27]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "25000" },
      });

      const singleFee: [{ denom: string; amount: string }] = [{ denom: "atom", amount: "500" }];

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        singleFee
      );

      expect(result).toBe(25000);
    });

    it("should handle multiple fee items", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "6" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([28, 29, 30]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "150000" },
      });

      const multipleFees: [{ denom: string; amount: string }] = [
        { denom: "atom", amount: "1500" },
      ];

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        multipleFees
      );

      expect(result).toBe(150000);
    });

    it("should handle empty proto messages", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "7" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([31, 32, 33]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "10000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        [],
        mockFee
      );

      expect(result).toBe(10000);
    });
  });

  describe("Error handling", () => {
    it("should return undefined when account is not found", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue(undefined);

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBeUndefined();
      expect(api).not.toHaveBeenCalled();
    });

    it("should throw error when gas_used is invalid", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "8" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([34, 35, 36]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "invalid_gas" },
      });

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Invalid integer gas: invalid_gas");
    });

    it("should throw error when gas_info is missing", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "9" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([37, 38, 39]),
      });

      (api as jest.Mock).mockResolvedValue({});

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Cannot read properties of undefined (reading 'gas_used')");
    });

    it("should throw error when simulatedResult is null", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "10" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([40, 41, 42]),
      });

      (api as jest.Mock).mockResolvedValue(null);

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Invalid integer gas: undefined");
    });

    it("should handle fetchAccountInfo rejection", async () => {
      (fetchAccountInfo as jest.Mock).mockRejectedValue(
        new Error("Account fetch failed")
      );

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Account fetch failed");
    });

    it("should handle keplr.getKey rejection", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "11" },
      });

      (mockKeplr.getKey as jest.Mock).mockRejectedValue(new Error("Keplr key fetch failed"));

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Keplr key fetch failed");
    });

    it("should handle API rejection", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "12" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([43, 44, 45]),
      });

      (api as jest.Mock).mockRejectedValue(new Error("API call failed"));

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("API call failed");
    });
  });

  describe("Edge cases", () => {
    it("should handle account with no sequence", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: {},
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([46, 47, 48]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "20000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(20000);
    });

    it("should handle account with null sequence", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: null },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([49, 50, 51]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "30000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(30000);
    });

    it("should handle empty string gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "13" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([52, 53, 54]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "" },
      });

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Invalid integer gas: ");
    });

    it("should handle whitespace gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "14" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([55, 56, 57]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "   " },
      });

      await expect(
        simulateMsgs(
          mockKeplr as Keplr,
          mockChainId as ChainInfo,
          mockSender,
          mockProto,
          mockFee
        )
      ).rejects.toThrow("Invalid integer gas:    ");
    });

    it("should handle decimal gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "15" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([58, 59, 60]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "123.45" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(123);
    });

    it("should handle very large gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "16" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([61, 62, 63]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "999999999999999999" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(1000000000000000000);
    });

    it("should handle negative gas_used", async () => {
      (fetchAccountInfo as jest.Mock).mockResolvedValue({
        base_account: { sequence: "17" },
      });

      (mockKeplr.getKey as jest.Mock).mockResolvedValue({
        pubKey: new Uint8Array([64, 65, 66]),
      });

      (api as jest.Mock).mockResolvedValue({
        gas_info: { gas_used: "-1000" },
      });

      const result = await simulateMsgs(
        mockKeplr as Keplr,
        mockChainId as ChainInfo,
        mockSender,
        mockProto,
        mockFee
      );

      expect(result).toBe(-1000);
    });
  });
});
