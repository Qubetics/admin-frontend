// __test__/Plans.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";
import Plans from "../src/Pages/Plans/Plans";

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
jest.mock("../src/Hooks/useGetApi", () => ({
  __esModule: true,
  default: () => mockUseApi,
}));

// mock login context
jest.mock("../src/Context/LoggedInContext", () => ({
  useIsLoggedIn: () => ({
    authData: "mock-auth-address",
  }),
}));

// mock helper functions
jest.mock("../src/utils/Helper/CommonHelper", () => ({
  Timestamp: (v: any) => `TS-${v}`,
  convertNodeToWallet: () => "wallet123",
  formatDuration: () => "5 hrs",
  getValueWithUnit: () => "10",
}));

jest.mock("../src/Constant/constants", () => ({
  bytesToGb: () => 5,
  provWalletPrefix: "prefix",
  STATUS_ENUM: {
    STATUS_ACTIVE: 1,
    STATUS_INACTIVE: 0,
  },
}));

// mock message builder
jest.mock("../src/service/BuildMessage/buildMessage", () => ({
  buildUpdatePlanStatusMessage: jest.fn(() => "mock-message"),
}));

// mock tx processor
const mockProcessTx = jest.fn();
jest.mock("../src/service/processTransaction/processTransaction", () => ({
  processTransaction: (...args: any) => mockProcessTx(...args),
}));

// mock modal
jest.mock("../src/Pages/Plans/createPlanModal", () => {
  return function MockModal(props: any) {
    return props.createShow ? (
      <div data-testid="create-modal">Modal Open</div>
    ) : null;
  };
});

// mock inner loader
jest.mock("../src/Common/Loader/InnerLoader", () => () => (
  <div>Loading...</div>
));

describe("Plans Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    mockUseApi.mockReturnValueOnce(mockPromise);

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
    mockUseApi.mockResolvedValueOnce(mockPlansResponse);

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
    mockUseApi.mockResolvedValueOnce(mockPlansResponse);
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

    mockUseApi.mockResolvedValueOnce(activePlan);

    await act(async () => {
      render(<Plans />);
    });

    const btn = await screen.findByText("Activated");
    expect(btn).toBeDisabled();
  });
});
