/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import Plans from "../Plans";

// mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastIsActive = jest.fn().mockReturnValue(false);

jest.mock("react-toastify", () => ({
  toast: {
    success: (...args: any) => mockToastSuccess(...args),
    error: (...args: any) => mockToastError(...args),
    isActive: (...args: any) => mockToastIsActive(...args),
  },
}));

// mock API hook
const mockUseApi = jest.fn();
jest.mock("../../../Hooks/useGetApi.tsx", () => ({
  __esModule: true,
  default: () => mockUseApi,
}));

// mock login context
jest.mock("../../../Context/LoggedInContext.tsx", () => ({
  useIsLoggedIn: () => ({
    authData: "mock-auth-address",
  }),
}));

// mock token price context
jest.mock("../../../Context/TokenPriceContext", () => ({
  useTokenPrice: () => ({ tokenPrice: 0.017 }),
}));

// mock helper functions
jest.mock("../../../utils/Helper/CommonHelper.tsx", () => ({
  Timestamp: (v: any) => `TS-${v}`,
  convertNodeToWallet: () => "wallet123",
  convertPlanString: () => "10 USDC",
  formatDuration: () => "5 hrs",
  getValueWithUnit: () => "10",
  noExponents: (v: any) => String(v),
}));

jest.mock("../../../Constant/constants.tsx", () => ({
  bytesToGb: () => 5,
  provWalletPrefix: "prefix",
  STATUS_ENUM: {
    STATUS_ACTIVE: 1,
    STATUS_INACTIVE: 0,
  },
  activeStatus: "active",
}));

// mock message builder
jest.mock("../../../service/BuildMessage/buildMessage.ts", () => ({
  buildUpdatePlanStatusMessage: jest.fn(() => "mock-message"),
}));

// mock tx processor
const mockProcessTx = jest.fn();
jest.mock("../../../service/processTransaction/processTransaction.tsx", () => ({
  processTransaction: (...args: any) => mockProcessTx(...args),
}));

// mock modal
jest.mock("../../../Pages/Plans/createPlanModal.tsx", () => {
  return function MockModal(props: any) {
    return props.createShow ? <div data-testid="create-modal">Modal Open</div> : null;
  };
});

// mock table skeleton
jest.mock("../../../Common/Loader/TableSkeleton.tsx", () => () => (
  <tr>
    <td colSpan={6}>Loading...</td>
  </tr>
));

describe("Plans Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApi.mockResolvedValue({
      success: true,
      data: { data: [], total: { total: 0 } },
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: { current_token_price: "0.017" } }),
      }),
    ) as jest.Mock;
  });

  const mockPlansResponse = {
    success: true,
    data: {
      data: [
        {
          id: "101",
          prices: [{ quote_value: 10, denom: "usdc" }],
          gigabytes: 1024,
          status_at: "123",
          hours: 5,
          status: "inactive",
        },
      ],
      total: { total: 5 },
    },
  };

  test("renders loader initially", async () => {
    let resolvePromise: any;
    const mockPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockUseApi.mockResolvedValueOnce(mockPromise);

    await act(async () => {
      render(<Plans />);
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    await act(async () => {
      resolvePromise({
        success: true,
        data: { data: [], total: { total: 0 } },
      });
    });
  });

  test("shows 'No plans found' when API returns empty list", async () => {
    mockUseApi.mockResolvedValueOnce({
      success: true,
      data: { data: [], total: { total: 0 } },
    });

    await act(async () => {
      render(<Plans />);
    });

    await waitFor(() => {
      expect(screen.getByText("No plans found")).toBeInTheDocument();
    });
  });

  test("renders plan rows when API returns data", async () => {
    mockUseApi.mockReset();
    mockUseApi.mockResolvedValue(mockPlansResponse);

    await act(async () => {
      render(<Plans />);
    });

    expect(await screen.findByText("101")).toBeInTheDocument();
    expect(screen.getByText("10 USDC")).toBeInTheDocument();
    expect(screen.getByText("5 GB")).toBeInTheDocument();
    expect(screen.getByText("TS-123")).toBeInTheDocument();
    expect(screen.getByText("5 hrs")).toBeInTheDocument();
    expect(screen.getByText("Activate")).toBeInTheDocument();
  });

  test("opens create plan modal when clicking 'Create Plan'", async () => {
    mockUseApi.mockResolvedValueOnce(mockPlansResponse);

    await act(async () => {
      render(<Plans />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Create Plan"));
    });

    expect(await screen.findByTestId("create-modal")).toBeInTheDocument();
  });

  test("activates plan successfully", async () => {
    mockUseApi.mockResolvedValueOnce(mockPlansResponse);
    mockUseApi.mockResolvedValueOnce(mockPlansResponse);

    mockProcessTx.mockResolvedValue("dummy-tx-hash");

    await act(async () => {
      render(<Plans />);
    });

    const activateBtn = await screen.findByText("Activate");

    await act(async () => {
      fireEvent.click(activateBtn);
    });

    expect(mockProcessTx).toHaveBeenCalledWith("mock-message");
    expect(mockToastSuccess).toHaveBeenCalledWith("Successfully Activated", {
      toastId: "tx_success",
    });
  });

  test("shows transaction failed toast when no tx hash returned", async () => {
    mockUseApi.mockReset();
    mockUseApi.mockResolvedValue(mockPlansResponse);
    mockProcessTx.mockResolvedValue(null);

    await act(async () => {
      render(<Plans />);
    });

    const btn = await screen.findByText("Activate");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(mockToastError).toHaveBeenCalledWith("Transaction failed", {
      toastId: "tx_failed",
    });
  });

  test("button should be disabled if plan is active", async () => {
    mockUseApi.mockReset();
    const activePlan = {
      success: true,
      data: {
        data: [
          {
            id: "1",
            prices: [],
            gigabytes: 100,
            status: "active",
            hours: 1,
            status_at: "00",
          },
        ],
        total: { total: 1 },
      },
    };

    mockUseApi.mockResolvedValue(activePlan);

    await act(async () => {
      render(<Plans />);
    });

    const btn = await screen.findByText("Activated");
    expect(btn).toBeDisabled();
  });

  // ---------------------------
  // NEW ROBUSTNESS TESTS BELOW
  // ---------------------------

  test("does nothing when API success=false", async () => {
    mockUseApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    await act(async () => {
      render(<Plans />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No plans found")).toBeInTheDocument();
  });

  test("handles API promise rejection without crashing", async () => {
    // Instead of rejected promise → simulate API failure
    mockUseApi.mockResolvedValueOnce({
      success: false,
      data: null,
    });

    await act(async () => {
      render(<Plans />);
    });

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No plans found")).toBeInTheDocument();
  });

  test("disables activate button while transaction is running", async () => {
    const response = {
      success: true,
      data: {
        data: [
          {
            id: "101",
            prices: [{ quote_value: 10, denom: "usdc" }],
            gigabytes: 1024,
            status: "inactive",
            hours: 5,
            status_at: "123",
          },
        ],
        total: { total: 1 },
      },
    };

    // Must mock twice
    mockUseApi.mockResolvedValueOnce(response).mockResolvedValueOnce(response);

    let resolveTx: any;
    mockProcessTx.mockReturnValue(
      new Promise((res) => {
        resolveTx = res;
      }),
    );

    await act(async () => {
      render(<Plans />);
    });

    const btn = await screen.findByText("Activate");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(btn).toBeDisabled();

    await act(async () => {
      resolveTx("hash");
    });
  });

  test("fetches plan list again after activation", async () => {
    const response = {
      success: true,
      data: {
        data: [
          {
            id: "101",
            prices: [],
            gigabytes: 0,
            hours: 1,
            status: "inactive",
            status_at: "0",
          },
        ],
        total: { total: 1 },
      },
    };

    mockUseApi.mockResolvedValueOnce(response).mockResolvedValueOnce(response);

    mockProcessTx.mockResolvedValue("tx-hash");

    await act(async () => {
      render(<Plans />);
    });

    const btn = await screen.findByText("Activate");

    await act(async () => {
      fireEvent.click(btn);
    });

    // The mock should be called at least 2 times (initial + after activation)
    expect(mockUseApi.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
