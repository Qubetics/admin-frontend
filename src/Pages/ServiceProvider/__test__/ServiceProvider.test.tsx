/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, act } from "@testing-library/react";
import ServiceProvider from "../ServiceProvider";
import * as balanceModule from "../../../service/getUserBalance";
jest.useFakeTimers();

// Mock navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock("react-toastify", () => ({
  toast: {
    error: (...args: any) => mockToastError(...args),
    success: (...args: any) => mockToastSuccess(...args),
  },
}));

// Mock build messages
const mockRegisterMsg = "register-msg";
const mockStatusMsg = "status-msg";
jest.mock("../../../service/BuildMessage/buildMessage", () => ({
  buildRegisterProviderMessage: () => mockRegisterMsg,
  buildUpdateProviderStatusMessage: () => mockStatusMsg,
}));

// Mock processTransaction
const mockTx = jest.fn();
jest.mock("../../../service/processTransaction/processTransaction", () => ({
  processTransaction: (...a: any) => mockTx(...a),
}));

// Mock useGetApi
const mockUseApi = jest.fn();
jest.mock("../../../Hooks/useGetApi", () => ({
  __esModule: true,
  default: () => mockUseApi,
}));

// Mock NotificationToast
jest.mock("../../../Common/NotificationModal/NotificationModal", () => {
  return ({ show, heading }: any) =>
    show ? <div data-testid={`toast-${heading}`} /> : null;
});

// Mock CustomInput
jest.mock("../../../Common/CustomInput/CustomInput", () => (props: any) => (
  <input
    data-testid={props.name}
    name={props.name}
    value={props.value}
    onChange={props.onChange}
    placeholder={props.placeholder}
  />
));

// Mock CustomButton
jest.mock("../../../Common/ButtonCustom/ButtonCustom", () => {
  return function ButtonCustomMock(props: any) {
    return (
      <button
        data-testid="button-submit"
        type={props.type || "submit"}
        onClick={props.onClick}
      >
        {props.label ?? "Submit"}
      </button>
    );
  };
});

// Mock LoggedInContext
jest.mock("../../../Context/LoggedInContext", () => ({
  useIsLoggedIn: () => ({
    authData: "cosmos123",
  }),
}));

// Mock Helpers
import * as CH from "../../../utils/Helper/CommonHelper";
jest.spyOn(CH, "fetchStakeAmount").mockResolvedValue(-5);
jest.spyOn(CH, "convertNodeToWallet").mockReturnValue("prov-addr");
jest.spyOn(CH, "computePubKey").mockReturnValue("pubkey-mock");

// Mock balance
jest.mock("../../../service/getUserBalance", () => ({
  getUserBalance: () => Promise.resolve("100"),
}));

// Mock Keplr
let mockKeplr: any = null;
Object.defineProperty(window, "keplr", {
  get: () => mockKeplr,
});

// Mock signArbitrary
const signMock = jest.fn();

const setup = async () => {
  const utils = render(<ServiceProvider />);
  act(() => {
    jest.advanceTimersByTime(1500);
  });
  await act(async () => {
    await Promise.resolve();
  });

  return utils;
};

describe("ServiceProvider Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockKeplr = null;
    jest.spyOn(CH, "fetchStakeAmount").mockResolvedValue(-5);
  });

  test("updates form data", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });

    expect(screen.getByTestId("name")).toHaveValue("Alice");
  });

  test("validateForm shows missing errors", async () => {
    await setup();

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
  });

  test("validateForm shows invalid email", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), { target: { value: "abc" } });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "bad-email" },
    });

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(
      screen.getByText("Please enter a valid email address.")
    ).toBeInTheDocument();
  });

  test("validateForm passes with valid data", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });
    fireEvent.change(screen.getByTestId("website"), {
      target: { value: "abc.com" },
    });

    expect(screen.queryByText("Name is required.")).not.toBeInTheDocument();
  });

  test("shows LOW BALANCE error", async () => {
    (CH.fetchStakeAmount as jest.Mock).mockRestore();
    jest.spyOn(CH, "fetchStakeAmount").mockResolvedValue(200);
    jest.spyOn(balanceModule, "getUserBalance").mockResolvedValue("100");
    mockUseApi.mockResolvedValue({ success: true });
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("button-submit"));
    });

    expect(mockToastError).toHaveBeenCalledWith("Low wallet Balance");
  });

  test("successful registration navigates to dashboard", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce("reg-hash");
    mockTx.mockResolvedValueOnce("status-hash");

    mockKeplr = {
      signArbitrary: signMock.mockResolvedValue({
        signature: "sig",
        pub_key: "pub",
      }),
    };

    mockUseApi.mockResolvedValue({ success: true });

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastSuccess).toHaveBeenCalledWith("Registration successful!");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  test("registerTx fails early", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce(null);

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).not.toHaveBeenCalledWith("Registration failed.");
  });

  test("statusTx fails early", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce("reg-hash");
    mockTx.mockResolvedValueOnce(null);

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).not.toHaveBeenCalledWith("Registration failed.");
  });

  test("missing Keplr shows error", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce("reg-hash");
    mockTx.mockResolvedValueOnce("status-hash");

    mockKeplr = null;

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).toHaveBeenCalledWith("Keplr wallet not found");
  });

  test("signature rejected shows error", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce("reg-hash");
    mockTx.mockResolvedValueOnce("status-hash");

    mockKeplr = {
      signArbitrary: signMock.mockResolvedValue({ signature: null }),
    };

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).toHaveBeenCalledWith("Signature rejected");
  });

  test("API failure resets form", async () => {
    mockUseApi.mockResolvedValue({ success: false });

    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockResolvedValueOnce("reg-hash");
    mockTx.mockResolvedValueOnce("status-hash");

    mockKeplr = {
      signArbitrary: signMock.mockResolvedValue({
        signature: "sig",
        pub_key: "pub",
      }),
    };

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).toHaveBeenCalledWith("Registration failed.");
  });

  test("catch block shows error", async () => {
    await setup();

    fireEvent.change(screen.getByTestId("name"), {
      target: { value: "Alice" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "alice@test.com" },
    });

    mockTx.mockRejectedValueOnce(new Error("boom"));

    await act(async () => fireEvent.click(screen.getByTestId("button-submit")));

    expect(mockToastError).toHaveBeenCalledWith(
      "Something went wrong during registration"
    );
  });
});
