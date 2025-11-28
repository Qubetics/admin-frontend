import {
  buildCreatePlanMessage,
  buildLinkNodeMessage,
  buildUnlinkNodeMessage,
  buildStartLeaseStatusMessage,
  buildUpdatePlanStatusMessage,
  buildRegisterProviderMessage,
  buildUpdateProviderStatusMessage,
} from "../src/service/BuildMessage/buildMessage";
import { TYPE_URLS } from "../src/Constant/constants";

// Mock the proto-gen modules
jest.mock("../src/proto-gen/src/codec/qubetics/plan/v3/msg", () => ({
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
  MsgUnlinkNodeRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([7, 8, 9])),
    }),
  },
  MsgUpdatePlanStatusRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([10, 11, 12])),
    }),
  },
}));

jest.mock("../src/proto-gen/src/codec/qubetics/lease/v1/msg", () => ({
  MsgStartLeaseRequest: {
    encode: jest.fn().mockReturnValue({
      finish: jest.fn().mockReturnValue(new Uint8Array([13, 14, 15])),
    }),
  },
}));

jest.mock("../src/proto-gen/src/codec/qubetics/provider/v3/msg", () => ({
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

jest.mock("../src/Constant/constants", () => ({
  TYPE_URLS: {
    CREATE_PLAN: "/qubetics.plan.v3.MsgCreatePlan",
    LINK_NODE: "/qubetics.plan.v3.MsgLinkNode",
    UNLINK_NODE: "/qubetics.plan.v3.MsgUnlinkNode",
    START_LEASE: "/qubetics.lease.v1.MsgStartLease",
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
        gigabytes: 100,
        hours: 24,
        prices: [
          { denom: "tics", baseValue: "200", quoteValue: "200" },
          { denom: "eth", baseValue: "100", quoteValue: "100" },
        ],
      };

      const result = buildCreatePlanMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("creates message with default prices when prices not provided", () => {
      const params = {
        from: "test-address",
        gigabytes: 100,
        hours: 24,
      };

      const result = buildCreatePlanMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("creates message with empty parameters", () => {
      const result = buildCreatePlanMessage();

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
        gigabytes: 100,
      };

      const result = buildCreatePlanMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });
  });

  describe("buildLinkNodeMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        id: "node-id",
        nodeAddress: "node-address",
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });

    it("creates message with empty parameters", () => {
      const params = {};

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
        id: "node-id",
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });
  });

  describe("buildUnlinkNodeMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        id: "node-id",
        nodeAddress: "node-address",
      };

      const result = buildUnlinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UNLINK_NODE,
        value: new Uint8Array([7, 8, 9]),
      });
    });

    it("creates message with empty parameters", () => {
      const params = {};

      const result = buildUnlinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UNLINK_NODE,
        value: new Uint8Array([7, 8, 9]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
      };

      const result = buildUnlinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UNLINK_NODE,
        value: new Uint8Array([7, 8, 9]),
      });
    });
  });

  describe("buildStartLeaseStatusMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        nodeAddress: "node-address",
        hours: 24,
        denom: "tics",
        renewalPricePolicy: 1,
      };

      const result = buildStartLeaseStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.START_LEASE,
        value: new Uint8Array([13, 14, 15]),
      });
    });

    it("creates message with empty parameters", () => {
      const params = {};

      const result = buildStartLeaseStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.START_LEASE,
        value: new Uint8Array([13, 14, 15]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
        nodeAddress: "node-address",
      };

      const result = buildStartLeaseStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.START_LEASE,
        value: new Uint8Array([13, 14, 15]),
      });
    });
  });

  describe("buildUpdatePlanStatusMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        id: "plan-id",
        status: 1,
      };

      const result = buildUpdatePlanStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_PLAN_STATUS,
        value: new Uint8Array([10, 11, 12]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
        id: undefined,
        status: 1,
      };

      const result = buildUpdatePlanStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_PLAN_STATUS,
        value: new Uint8Array([10, 11, 12]),
      });
    });

    it("creates message with zero status", () => {
      const params = {
        from: "test-address",
        id: "plan-id",
        status: 0,
      };

      const result = buildUpdatePlanStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_PLAN_STATUS,
        value: new Uint8Array([10, 11, 12]),
      });
    });

    it("creates message with negative status", () => {
      const params = {
        from: "test-address",
        id: "plan-id",
        status: -1,
      };

      const result = buildUpdatePlanStatusMessage(params);

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

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });

    it("creates message with empty parameters", () => {
      const result = buildRegisterProviderMessage();

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });

    it("creates message with partial parameters", () => {
      const params = {
        from: "test-address",
        name: "Test Provider",
      };

      const result = buildRegisterProviderMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });

    it("creates message with empty string values", () => {
      const params = {
        from: "test-address",
        name: "",
        identity: "",
        website: "",
        description: "",
      };

      const result = buildRegisterProviderMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.REGISTER_PROVIDER,
        value: new Uint8Array([16, 17, 18]),
      });
    });
  });

  describe("buildUpdateProviderStatusMessage", () => {
    it("creates message with all parameters", () => {
      const params = {
        from: "test-address",
        status: 1,
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });

    it("creates message with empty parameters", () => {
      const result = buildUpdateProviderStatusMessage();

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });

    it("creates message with only from parameter", () => {
      const params = {
        from: "test-address",
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });

    it("creates message with only status parameter", () => {
      const params = {
        status: 1,
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });

    it("creates message with zero status", () => {
      const params = {
        from: "test-address",
        status: 0,
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });

    it("creates message with negative status", () => {
      const params = {
        from: "test-address",
        status: -1,
      };

      const result = buildUpdateProviderStatusMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.UPDATE_STATUS_PROVIDER,
        value: new Uint8Array([19, 20, 21]),
      });
    });
  });

  describe("Edge Cases and Type Handling", () => {
    it("handles null parameters in buildCreatePlanMessage", () => {
      const params = {
        from: null,
        gigabytes: null,
        hours: null,
        prices: undefined,
      };

      const result = buildCreatePlanMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.CREATE_PLAN,
        value: new Uint8Array([1, 2, 3]),
      });
    });

    it("handles undefined parameters in buildLinkNodeMessage", () => {
      const params = {
        from: undefined,
        id: undefined,
        nodeAddress: undefined,
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });

    it("handles mixed null and undefined parameters", () => {
      const params = {
        from: "test-address",
        id: null,
        nodeAddress: undefined,
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });

    it("handles numeric string parameters", () => {
      const params = {
        from: "123",
        id: "456",
        nodeAddress: "789",
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });

    it("handles boolean parameters", () => {
      const params = {
        from: true,
        id: false,
        nodeAddress: true,
      };

      const result = buildLinkNodeMessage(params);

      expect(result).toEqual({
        typeUrl: TYPE_URLS.LINK_NODE,
        value: new Uint8Array([4, 5, 6]),
      });
    });
  });
});
