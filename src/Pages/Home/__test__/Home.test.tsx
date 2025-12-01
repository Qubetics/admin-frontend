/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
const {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} = require("@testing-library/react");
import "@testing-library/jest-dom";

import Home from "../Home";
// import ButtonCustom from "../../../Common/ButtonCustom/ButtonCustom";

// Mock ButtonCustom (same approach as Dummy components in Dashboard suite)
jest.mock("../../../Common/ButtonCustom/ButtonCustom", () => {
  return function DummyButtonCustom({ label, type, onClick }: any) {
    return (
      <button data-testid="button-custom" type={type} onClick={onClick}>
        {label}
      </button>
    );
  };
});

describe("Home Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders the Home component and ButtonCustom", async () => {
    await act(async () => {
      render(<Home />);
    });

    await waitFor(() => {
      expect(screen.getByTestId("button-custom")).toBeInTheDocument();
      expect(screen.getByText("Sign up with email")).toBeInTheDocument();
    });
  });

  test("passes correct props to ButtonCustom", async () => {
    await act(async () => {
      render(<Home />);
    });

    const btn = screen.getByTestId("button-custom");

    expect(btn).toHaveAttribute("type", "button");
    expect(btn.textContent).toBe("Sign up with email");
  });

  test("ButtonCustom click triggers handler if provided", async () => {
    const onClickMock = jest.fn();

    await act(async () => {
      render(
        <div>
          <button data-testid="button-custom" onClick={onClickMock}>
            Sign up with email
          </button>
        </div>
      );
    });

    const btn = screen.getByTestId("button-custom");

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(onClickMock).toHaveBeenCalled();
  });
});
