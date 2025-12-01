// __test__/createPlanModal.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CreatePlanModal from "../createPlanModal";

const mockToastError = jest.fn();
jest.mock("react-toastify", () => ({
  toast: {
    error: (...a: any) => mockToastError(...a),
  },
}));

const mockBuildMessage = jest.fn(() => "mock-message");
jest.mock("../../../service/BuildMessage/buildMessage", () => ({
  buildCreatePlanMessage: (...a: any) => mockBuildMessage(...a),
}));

const mockTx = jest.fn();
jest.mock("../../../service/processTransaction/processTransaction", () => ({
  processTransaction: (...a: any) => mockTx(...a),
}));

jest.mock("../../../utils/Helper/CommonHelper", () => ({
  ModifyNum: (v: any) => v,
}));

jest.mock("../../../Common/ButtonCustom/ButtonCustom", () => (props: any) => {
  return (
    <button data-testid="button-custom" onClick={props.onClick}>
      {props.label}
    </button>
  );
});

jest.mock("../../../Constant/constants", () => ({
  ERROR_MESSAGES: {
    PRICE_LESS_THAN_1: "Price must be ≥ 1",
    PRICE_DECIMAL: "Price cannot contain decimals",
    BANDWIDTH_LESS_THAN_1: "Bandwidth must be ≥ 1",
    BANDWIDTH_DECIMAL: "Bandwidth cannot contain decimals",
  },
  gbToBytes: (v: any) => String(Number(v) * 1024),
  hoursDropdown: [
    { id: 1, label: "1 hour", value: "1" },
    { id: 2, label: "2 hours", value: "2" },
  ],
}));

jest.mock("long", () => ({
  fromString: (v: any) => v,
}));

jest.mock("../../../Common/CustomInput/CustomInput", () => (props: any) => {
  return (
    <input
      data-testid={props.name}
      name={props.name}
      value={props.value}
      onChange={props.onChange}
    />
  );
});

jest.mock("../../../Common/NotificationModal/NotificationModal", () => {
  return ({ show }: any) =>
    show ? <div data-testid="notif">Plan Created Successfully!</div> : null;
});
jest.mock("../../../Common/ButtonCustom/ButtonCustom", () => (props: any) => {
  return (
    <button data-testid="button-custom" onClick={props.onClick}>
      {props.label}
    </button>
  );
});

// ---------------- TESTS ----------------

describe("CreatePlanModal Component", () => {
  const setup = (customProps = {}) => {
    const defaultProps = {
      createShow: true,
      setCreateShow: jest.fn(),
      getAllPlan: jest.fn(),
      provAddress: "prov-addr",
      disableChecks: true,
    };

    return render(<CreatePlanModal {...defaultProps} {...customProps} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal when createShow=true", () => {
    setup();
    expect(screen.getByText("Create Plan")).toBeInTheDocument();
  });

  test("does NOT render when createShow=false", () => {
    setup({ createShow: false });
    expect(screen.queryByText("Create Plan")).not.toBeInTheDocument();
  });

  test("validates empty fields and shows toast", async () => {
    setup();

    const btn = screen.getByText("Create");

    await act(async () => fireEvent.click(btn));

    expect(mockToastError).toHaveBeenCalledWith("All field are required");
  });

  test("validation: price < 1 shows error", () => {
    setup();
    fireEvent.change(screen.getByTestId("price"), { target: { value: "0" } });
    expect(screen.getByText("Price must be ≥ 1")).toBeInTheDocument();
  });

  test("validation: bandwidth < 1 shows error", () => {
    setup();
    fireEvent.change(screen.getByTestId("bytes"), { target: { value: "0" } });
    expect(screen.getByText("Bandwidth must be ≥ 1")).toBeInTheDocument();
  });

  test("typing valid values removes errors", () => {
    setup();

    const price = screen.getByTestId("price");
    const bytes = screen.getByTestId("bytes");

    fireEvent.change(price, { target: { value: "0" } });
    expect(screen.getByText("Price must be ≥ 1")).toBeInTheDocument();

    fireEvent.change(price, { target: { value: "10" } });
    expect(screen.queryByText("Price must be ≥ 1")).not.toBeInTheDocument();

    fireEvent.change(bytes, { target: { value: "0" } });
    expect(screen.getByText("Bandwidth must be ≥ 1")).toBeInTheDocument();

    fireEvent.change(bytes, { target: { value: "5" } });
    expect(screen.queryByText("Bandwidth must be ≥ 1")).not.toBeInTheDocument();
  });

  test("creates plan successfully when inputs are valid", async () => {
    const mockSetCreateShow = jest.fn();
    const mockGetAllPlan = jest.fn();

    setup({ setCreateShow: mockSetCreateShow, getAllPlan: mockGetAllPlan });

    fireEvent.change(screen.getByTestId("price"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("bytes"), { target: { value: "5" } });
    fireEvent.change(screen.getByTestId("hours"), { target: { value: "1" } });

    mockTx.mockResolvedValueOnce("mock-hash");

    await act(async () => fireEvent.click(screen.getByText("Create")));

    expect(mockBuildMessage).toHaveBeenCalled();
    expect(mockTx).toHaveBeenCalledWith("mock-message");
    expect(mockSetCreateShow).toHaveBeenCalledWith(false);
    expect(mockGetAllPlan).toHaveBeenCalled();
    expect(screen.getByTestId("notif")).toBeInTheDocument();
  });

  test("does NOT close modal when TxHash is null", async () => {
    const mockSetCreateShow = jest.fn();

    setup({ setCreateShow: mockSetCreateShow });

    fireEvent.change(screen.getByTestId("price"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("bytes"), { target: { value: "5" } });
    fireEvent.change(screen.getByTestId("hours"), { target: { value: "1" } });

    mockTx.mockResolvedValueOnce(null);

    await act(async () => fireEvent.click(screen.getByText("Create")));

    expect(mockSetCreateShow).not.toHaveBeenCalled();
  });

  test("closing modal resets form and hides modal", async () => {
    const mockSetCreateShow = jest.fn();

    setup({ setCreateShow: mockSetCreateShow });

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);

    expect(mockSetCreateShow).toHaveBeenCalledWith(false);
  });
  test("clears errors when price input becomes empty", () => {
    setup();
    const price = screen.getByTestId("price");
    fireEvent.change(price, { target: { value: "10" } });
    expect(screen.queryByText("Price must be ≥ 1")).not.toBeInTheDocument();
    fireEvent.change(price, { target: { value: "" } });
    expect(screen.queryByText("Price must be ≥ 1")).not.toBeInTheDocument();
  });

  test("clears errors when bytes input becomes empty", () => {
    setup();
    const bytes = screen.getByTestId("bytes");
    fireEvent.change(bytes, { target: { value: "5" } });
    expect(screen.queryByText("Bandwidth must be ≥ 1")).not.toBeInTheDocument();
    fireEvent.change(bytes, { target: { value: "" } });
    expect(screen.queryByText("Bandwidth must be ≥ 1")).not.toBeInTheDocument();
  });

  test("sets valid price without an error", () => {
    setup();
    const price = screen.getByTestId("price");
    fireEvent.change(price, { target: { value: "12" } });
    expect(screen.queryByText("Price must be ≥ 1")).not.toBeInTheDocument();
  });
  test("early return when TxHash is undefined", async () => {
    const mockSet = jest.fn();
    setup({ setCreateShow: mockSet });

    fireEvent.change(screen.getByTestId("price"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("bytes"), { target: { value: "5" } });
    fireEvent.change(screen.getByTestId("hours"), { target: { value: "1" } });

    mockTx.mockResolvedValueOnce(undefined);

    await act(async () => fireEvent.click(screen.getByText("Create")));

    expect(mockSet).not.toHaveBeenCalled();
  });
  test("notification close handler works", async () => {
    setup();

    fireEvent.change(screen.getByTestId("price"), { target: { value: "10" } });
    fireEvent.change(screen.getByTestId("bytes"), { target: { value: "5" } });
    fireEvent.change(screen.getByTestId("hours"), { target: { value: "1" } });

    mockTx.mockResolvedValueOnce("mock-hash");

    await act(async () => fireEvent.click(screen.getByText("Create")));

    const notif = screen.getByTestId("notif");
    expect(notif).toBeInTheDocument();

    fireEvent.click(notif);
  });
});
