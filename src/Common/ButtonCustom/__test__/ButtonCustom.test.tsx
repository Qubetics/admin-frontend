import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ButtonCustom from "../ButtonCustom";

describe("ButtonCustom Component", () => {
  const defaultProps = {
    label: "Click me",
    onClick: jest.fn(),
  };

  test("renders with default props", () => {
    render(<ButtonCustom {...defaultProps} />);
    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("customButton");
    expect(button).not.toHaveClass("customButton-bordered");
    expect(button).not.toBeDisabled();
  });

  test("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<ButtonCustom {...defaultProps} onClick={handleClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("applies custom className", () => {
    render(<ButtonCustom {...defaultProps} className="custom-class" />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("customButton", "custom-class");
  });

  test("applies bordered style when bordered prop is true", () => {
    render(<ButtonCustom {...defaultProps} bordered={true} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("customButton-bordered");
  });

  test("renders as disabled when disabled prop is true", () => {
    const handleClick = jest.fn();
    render(
      <ButtonCustom {...defaultProps} disabled={true} onClick={handleClick} />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled");

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("uses custom button type when provided", () => {
    render(<ButtonCustom {...defaultProps} type="submit" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  test("applies tabIndex when provided", () => {
    render(<ButtonCustom {...defaultProps} tabIndex={0} />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("tabIndex", "0");
  });

  test("applies id attribute when provided", () => {
    render(<ButtonCustom {...defaultProps} id="test-button" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("id", "test-button");
  });

  test("combines multiple props correctly", () => {
    render(
      <ButtonCustom
        label="Test Button"
        className="test-class"
        bordered={true}
        disabled={true}
        type="submit"
        tabIndex={1}
        id="test-id"
      />
    );

    const button = screen.getByRole("button", { name: /test button/i });
    expect(button).toHaveClass(
      "customButton",
      "test-class",
      "customButton-bordered",
      "disabled"
    );
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveAttribute("tabIndex", "1");
    expect(button).toHaveAttribute("id", "test-id");
    expect(button).toBeDisabled();
  });
});