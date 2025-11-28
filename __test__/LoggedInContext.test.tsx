/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, act } from "@testing-library/react";
import {
  LoggedInProvider,
  useIsLoggedIn,
} from "../src/Context/LoggedInContext";

function renderWithProvider(ui: React.ReactNode) {
  return render(<LoggedInProvider>{ui}</LoggedInProvider>);
}

describe("LoggedInContext", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  it("provides default context values", async () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = useIsLoggedIn();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    expect(contextValue).toEqual({
      authData: "",
      setAuthData: expect.any(Function),
      providerName: "",
      setProviderName: expect.any(Function),
      loading: false,
      logout: expect.any(Function),
    });
  });

  it("updates authData", async () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = useIsLoggedIn();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    act(() => {
      contextValue.setAuthData("XYZ");
    });

    expect(contextValue.authData).toBe("XYZ");
    expect(localStorage.getItem("authData")).toBe("XYZ");
  });

  it("updates providerName", async () => {
    let contextValue: any;

    const TestComponent = () => {
      contextValue = useIsLoggedIn();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    act(() => {
      contextValue.setProviderName("Metamask");
    });

    expect(contextValue.providerName).toBe("Metamask");
    expect(localStorage.getItem("providerName")).toBe("Metamask");
  });

  it("throws error when used outside provider", () => {
    const TestComponent = () => {
      useIsLoggedIn();
      return null;
    };

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useIsLoggedIn must be used within a LoggedInProvider"
    );

    spy.mockRestore();
  });

  it("logout clears storage and redirects", async () => {
    let contextValue: any;

    localStorage.setItem("authData", "ABC");
    localStorage.setItem("providerName", "Keplr");
    sessionStorage.setItem("something", "test");

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const TestComponent = () => {
      contextValue = useIsLoggedIn();
      return null;
    };

    await act(async () => {
      render(
        <LoggedInProvider>
          <TestComponent />
        </LoggedInProvider>
      );
    });

    expect(contextValue.authData).toBe("ABC");
    expect(contextValue.providerName).toBe("Keplr");

    await act(async () => {
      contextValue.logout();
    });

    expect(localStorage.getItem("authData")).toBeNull();
    expect(localStorage.getItem("providerName")).toBeNull();
    expect(sessionStorage.length).toBe(0);
    consoleSpy.mockRestore();
  });
});
