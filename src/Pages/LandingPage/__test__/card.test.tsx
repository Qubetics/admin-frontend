import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Card, { type CardProps } from "../card";

// Mock SCSS import
jest.mock("../../../Pages/LandingPage/LandingPage.scss", () => ({}), {
  virtual: true,
});

describe("Card Component", () => {
  const defaultProps: CardProps = {
    title: "Sample Title",
    description: "This is a sample description",
  };

  test("renders card title and description", () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  test("applies correct class names", () => {
    render(<Card {...defaultProps} />);

    expect(screen.getByText(defaultProps.title)).toHaveClass("card-title");
    expect(screen.getByText(defaultProps.description)).toHaveClass(
      "card-description"
    );
  });

  test("renders with different props", () => {
    const props: CardProps = {
      title: "Another Title",
      description: "Another description goes here",
    };

    render(<Card {...props} />);

    expect(screen.getByText("Another Title")).toBeInTheDocument();
    expect(
      screen.getByText("Another description goes here")
    ).toBeInTheDocument();
  });
});
