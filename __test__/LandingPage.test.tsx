/* eslint-disable @typescript-eslint/no-explicit-any */
import "./polyfill";
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import LandingPage from "../src/Pages/LandingPage/LandingPage";
import Card from "../src/Pages/LandingPage/card";

// Mock SCSS imports
jest.mock("../src/Pages/LandingPage/LandingPage.scss", () => ({}), {
  virtual: true,
});

// Mock Ant Design components
jest.mock("antd", () => ({
  Row: ({ children, ...rest }: any) => (
    <div data-testid="row" {...rest}>
      {children}
    </div>
  ),
  Col: ({ children, ...rest }: any) => (
    <div data-testid="col" {...rest}>
      {children}
    </div>
  ),
}));

// Mock Card component
jest.mock("../src/Pages/LandingPage/card", () => {
  return jest.fn(({ title, description }: any) => (
    <div data-testid="mock-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ));
});

describe("LandingPage Component", () => {
  const MockedCard = Card as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders main hero content", () => {
    render(<LandingPage />);

    expect(screen.getByText("Secure Your Digital Freedom")).toBeInTheDocument();

    expect(
      screen.getByText(/Experience the next generation of decentralized VPN/i)
    ).toBeInTheDocument();
  });

  test("renders ecosystem section", () => {
    render(<LandingPage />);

    expect(screen.getByText("Qubetics Ecosystem")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Join the Qubetics ecosystem by running your own dVPN node/i
      )
    ).toBeInTheDocument();
  });

  test("renders all cards", () => {
    render(<LandingPage />);

    const cards = screen.getAllByTestId("mock-card");
    expect(cards.length).toBe(3);
  });

  test("passes correct props to Card component", () => {
    render(<LandingPage />);

    expect(MockedCard).toHaveBeenCalledTimes(3);

    const calls = MockedCard.mock.calls.slice(0, 3);

    expect(calls[0][0]).toMatchObject({
      title: "Become a Provider",
      description:
        "Run a node with Qubetics offer no-logs privacy, unlimited bandwidth, and global access as a dVPN provider",
    });

    expect(calls[1][0]).toMatchObject({
      title: "Lease Your Node",
      description:
        "Lease node(s) as a provider and empower users to join the Qubetics dVPN ecosystem",
    });

    expect(calls[2][0]).toMatchObject({
      title: "Earn Effortlessly",
      description: "Earn Effortlessly in TICS While Powering the Qubetics dVPN",
    });
  });

  test("renders Row and Col wrappers", () => {
    render(<LandingPage />);

    expect(screen.getByTestId("row")).toBeInTheDocument();

    const cols = screen.getAllByTestId("col");
    expect(cols.length).toBe(3);
  });
});
