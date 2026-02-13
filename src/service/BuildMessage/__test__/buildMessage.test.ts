import {
  buildCreatePlanMessage,
  buildLinkNodeMessage,
  buildStartLeaseStatusMessage,
  buildUpdatePlanStatusMessage,
  buildRegisterProviderMessage,
  buildUpdateProviderStatusMessage,
  buildEndLeaseStatusMessage,
} from "../buildMessage";
import { TYPE_URLS } from "../../../Constant/constants";
import Long from "long";
import {
  MsgCreatePlanRequest,
  MsgLinkNodeRequest,
  MsgUpdatePlanStatusRequest,
} from "../../../proto-gen/src/codec/qubetics/plan/v3/msg";
import {
  MsgStartLeaseRequest,
  MsgEndLeaseRequest,
} from "../../../proto-gen/src/codec/qubetics/lease/v1/msg";
import {
  MsgRegisterProviderRequest,
  MsgUpdateProviderStatusRequest,
} from "../../../proto-gen/src/codec/qubetics/provider/v3/msg";

// Mock the proto-gen modules
jest.mock("../../../proto-gen/src/codec/qubetics/plan/v3/msg", () => ({
  MsgCreatePlanRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
    }),
  },
  MsgLinkNodeRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([4, 5, 6])),
    }),
  },
  MsgUpdatePlanStatusRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([10, 11, 12])),
    }),
  },
}));

jest.mock("../../../proto-gen/src/codec/qubetics/lease/v1/msg", () => ({
  MsgStartLeaseRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([13, 14, 15])),
    }),
  },
  MsgEndLeaseRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([22, 23, 24])),
    }),
  },
}));

jest.mock("../../../proto-gen/src/codec/qubetics/provider/v3/msg", () => ({
  MsgRegisterProviderRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([16, 17, 18])),
    }),
  },
  MsgUpdateProviderStatusRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([19, 20, 21])),
    }),
  },
}));

jest.mock("../../../Constant/constants", () => ({
  TYPE_URLS: {
    CREATE_PLAN: "/qubetics.plan.v3.MsgCreatePlan",
    LINK_NODE: "/qubetics.plan.v3.MsgLinkNode",
    START_LEASE: "/qubetics.lease.v1.MsgStartLease",
    END_LEASE: "/qubetics.lease.v1.MsgEndLease",
    UPDATE_PLAN_STATUS: "/qubetics.plan.v3.MsgUpdatePlanStatus",
    REGISTER_PROVIDER: "/qubetics.provider.v3.MsgRegisterProvider",
    UPDATE_STATUS_PROVIDER: "/qubetics.provider.v3.MsgUpdateProviderStatus",
  },
}));

describe("buildMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("buildCreatePlanMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        gigabytes: Long.fromNumber(100),
        hours: Long.fromNumber(24),
        prices: [
          { denom: "tics", baseValue: "200", quoteValue: "200" },
          { denom: "eth", baseValue: "100", quoteValue: "100" },
        ],
      };

      const result = buildCreatePlanMessage(params);

      expect(MsgCreatePlanRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        gigabytes: params.gigabytes,
        hours: params.hours,
        prices: params.prices,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("creates message with default prices when prices not provided", () => {
      const params = {
        from: "test-address",
        gigabytes: Long.fromNumber(100),
        hours: Long.fromNumber(24),
        prices: [],
      };

      const result = buildCreatePlanMessage(params);

      expect(MsgCreatePlanRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        gigabytes: params.gigabytes,
        hours: params.hours,
        prices: params.prices,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("creates message with default prices when prices is undefined", () => {
      const params = {
        from: "test-address",
        gigabytes: Long.fromNumber(100),
        hours: Long.fromNumber(24),
      } as any; // Cast to any to omit required 'prices'

      const result = buildCreatePlanMessage(params);

      // Verify default prices are used (from source: [{"denom": "tics", "baseValue": "200", "quoteValue": "200"}])
      expect(MsgCreatePlanRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        gigabytes: params.gigabytes,
        hours: params.hours,
        prices: [
          {
            denom: "tics",
            baseValue: "200",
            quoteValue: "200",
          },
        ],
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });
  });

  describe("buildLinkNodeMessage", () => {
    it("creates message with all required parameters", () => {
      const params = {
        from: "test-address",
        id: Long.fromString("123"),
        nodeAddress: "node-address",
      };

      const result = buildLinkNodeMessage(params);

      expect(MsgLinkNodeRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        id: params.id,
        nodeAddress: params.nodeAddress,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });
  });

  describe("buildStartLeaseStatusMessage", () => {
    it("creates message with all required parameters and checks renewalPricePolicy", () => {
      const params = {
        from: "test-address",
        nodeAddress: "node-address",
        hours: Long.fromString("24"),
        denom: "tics",
        renewalPricePolicy: 1,
      };

      const result = buildStartLeaseStatusMessage(params);

      expect(MsgStartLeaseRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        nodeAddress: params.nodeAddress,
        hours: params.hours,
        denom: params.denom,
        renewalPricePolicy: 3,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.START_LEASE,
        value: new Uint8Array([13, 14, 15]),
      });
    });
  });

  describe("buildEndLeaseStatusMessage", () => {
    it("creates message with all required parameters", () => {
      const params = {
        from: "test-address",
        id: 123,
      };

      const result = buildEndLeaseStatusMessage(params);

      expect(MsgEndLeaseRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        id: Long.fromNumber(params.id),
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.END_LEASE,
        value: new Uint8Array([22, 23, 24]),
      });
    });
  });

  describe("buildUpdatePlanStatusMessage", () => {
    it("creates message with all required parameters", () => {
      const params = {
        from: "test-address",
        id: Long.fromString("123"),
        status: 1,
      };

      const result = buildUpdatePlanStatusMessage(params);

      expect(MsgUpdatePlanStatusRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        id: params.id,
        status: params.status,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_PLAN_STATUS,
        value: new Uint8Array([10, 11, 12]),
      });
    });
  });

  describe("buildRegisterProviderMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        name: "Test Provider",
        identity: "test-identity",
        website: "https://test.com",
        description: "Test provider description",
      };

      const result = buildRegisterProviderMessage(params);

      expect(MsgRegisterProviderRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        name: params.name,
        identity: params.identity,
        website: params.website,
        description: params.description,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });

    it("creates message with only required parameters", () => {
      const params = {
        from: "test-address",
      };

      const result = buildRegisterProviderMessage(params);

      expect(MsgRegisterProviderRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        name: "",
        identity: "",
        website: "",
        description: "",
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });
  });

  describe("buildUpdateProviderStatusMessage", () => {
    it("creates message with all required parameters", () => {
      const params = {
        from: "test-address",
        status: 1,
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(MsgUpdateProviderStatusRequest.encode).toHaveBeenCalledWith({
        from: params.from,
        status: params.status,
      });

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });
  });
});
