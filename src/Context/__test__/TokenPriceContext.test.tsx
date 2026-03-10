import React from "react";
import { render, act } from "@testing-library/react";
import { TokenPriceProvider, useTokenPrice } from "../TokenPriceContext";

function renderWithProvider(ui: React.ReactNode) {
  return render(<TokenPriceProvider>{ui}</TokenPriceProvider>);
}

describe("TokenPriceContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("provides tokenPrice = 0 by default when fetch fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error"))) as jest.Mock;
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useTokenPrice();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    expect(contextValue.tokenPrice).toBe(0);
    expect(contextValue.tokenPriceLoading).toBe(false);
    consoleSpy.mockRestore();
  });

  it("fetches and sets tokenPrice on mount", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: { current_token_price: "0.017" } }),
      }),
    ) as jest.Mock;

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useTokenPrice();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    expect(contextValue.tokenPrice).toBe(0.017);
    expect(contextValue.tokenPriceLoading).toBe(false);
  });

  it("sets tokenPriceLoading=false after fetch completes", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: { current_token_price: "0.017" } }),
      }),
    ) as jest.Mock;

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useTokenPrice();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    expect(contextValue.tokenPriceLoading).toBe(false);
  });

  it("keeps tokenPrice = 0 when API response has no price field", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: {} }),
      }),
    ) as jest.Mock;

    let contextValue: any;
    const TestComponent = () => {
      contextValue = useTokenPrice();
      return null;
    };

    await act(async () => {
      renderWithProvider(<TestComponent />);
    });

    expect(contextValue.tokenPrice).toBe(0);
    expect(contextValue.tokenPriceLoading).toBe(false);
  });

  it("throws when useTokenPrice is used outside provider", () => {
    const TestComponent = () => {
      useTokenPrice();
      return null;
    };

    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow("useTokenPrice must be used within a TokenPriceProvider");
    spy.mockRestore();
  });
});
