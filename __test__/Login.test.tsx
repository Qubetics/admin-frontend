/* eslint-disable @typescript-eslint/no-explicit-any */
import "./polyfill";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  //   act,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import Login from "../src/Pages/Login/Login";
import ButtonCustom from "../src/Common/ButtonCustom/ButtonCustom";
// import { envConstants } from "../src/Constant/envConstants";
import { useIsLoggedIn } from "../src/Context/LoggedInContext";
import useNetworkRequest from "../src/Hooks/useGetApi";
import { computePubKey } from "../src/utils/Helper/CommonHelper";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

jest.mock("../src/Common/ButtonCustom/ButtonCustom");
jest.mock("../src/Context/LoggedInContext");
jest.mock("../src/Hooks/useGetApi");
jest.mock("../src/Constant/envConstants", () => ({
  envConstants: { chainId: "test-chain" },
}));
jest.mock("../src/utils/Helper/CommonHelper");
jest.mock("react-toastify", () => ({
  toast: {
    error: jest.fn(),
  },
}));
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

describe("Login Component", () => {
  const mockUseGetApi = jest.fn();
  const mockNavigate = jest.fn();
  const mockSetAuthData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useIsLoggedIn as jest.Mock).mockReturnValue({
      authData: "",
      setAuthData: mockSetAuthData,
    });

    (useNetworkRequest as jest.Mock).mockReturnValue(mockUseGetApi);
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (ButtonCustom as jest.Mock).mockImplementation(
      ({ label, onClick }: any) => (
        <button data-testid="login-btn" onClick={onClick}>
          {label}
        </button>
      )
    );

    (computePubKey as jest.Mock).mockReturnValue("computed-pubkey");
  });

  const mockKeplr = (overrides = {}) => {
    (window as any).keplr = {
      disable: jest.fn().mockResolvedValue(undefined),
      enable: jest.fn().mockResolvedValue(undefined),
      getOfflineSigner: jest.fn().mockReturnValue({
        getAccounts: jest.fn().mockResolvedValue([{ address: "test-address" }]),
      }),
      signArbitrary: jest.fn().mockResolvedValue({
        signature: "signed-value",
        pub_key: "pubkey",
      }),
      ...overrides,
    };
  };

  test("renders login button", () => {
    render(<Login />);
    expect(screen.getByTestId("login-btn")).toBeInTheDocument();
  });

  test("shows error if Keplr is not installed", async () => {
    (window as any).keplr = undefined;

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Install Keplr Wallet extension"
      );
    });
  });

  test("handles missing accounts in Keplr", async () => {
    (window as any).keplr = {
      disable: jest.fn().mockResolvedValue(undefined),
      enable: jest.fn().mockResolvedValue(undefined),
      getOfflineSigner: () => ({
        getAccounts: jest.fn().mockResolvedValue([]),
      }),
    };

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("No accounts found in Keplr");
    });

    consoleSpy.mockRestore();
  });

  test("handles signArbitrary failure", async () => {
    mockKeplr({
      signArbitrary: jest.fn().mockRejectedValue(new Error("fail")),
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Signing failed: fail");
    });

    consoleSpy.mockRestore();
  });

  test("handles computePubKey returning null", async () => {
    mockKeplr();
    (computePubKey as jest.Mock).mockReturnValue(null);

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Could not compute public key from signature."
      );
    });

    consoleSpy.mockRestore();
  });

  test("handles login API returning failure", async () => {
    mockKeplr();
    mockUseGetApi.mockResolvedValue({ success: false });

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to Login");
    });
  });

  test("successful login: sets authData and navigates", async () => {
    mockKeplr();
    mockUseGetApi.mockResolvedValue({ success: true });

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(mockSetAuthData).toHaveBeenCalledWith("test-address");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  test("handles signing catch block and clears session", async () => {
    (window as any).keplr = {
      disable: jest.fn().mockResolvedValue(undefined),
      enable: jest.fn().mockResolvedValue(undefined),
      getOfflineSigner: () => ({
        getAccounts: jest.fn().mockResolvedValue([{ address: "test-address" }]),
      }),
      signArbitrary: jest.fn().mockRejectedValue(new Error("bad sign")),
    };

    const clearSpy = jest
      .spyOn(Storage.prototype, "clear")
      .mockImplementation(() => {});

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<Login />);
    fireEvent.click(screen.getByTestId("login-btn"));

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalled();
      expect(mockSetAuthData).toHaveBeenCalledWith("");
      expect(consoleSpy).toHaveBeenCalledWith("Signing failed: bad sign");
    });

    clearSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
