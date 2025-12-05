import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmationModal from "../ConfirmationModal";
import '@testing-library/jest-dom';

describe("ConfirmationModal Component", () => {
  const defaultProps = {
    show: true,
    heading: "Test Confirmation",
    description: "Are you sure you want to proceed?",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  // Helper function to render the component with custom props
  const renderComponent = (props = {}) => {
    return render(<ConfirmationModal {...defaultProps} {...props} />);
  };

  test("renders with default props", () => {
    renderComponent();
    
    // Check if modal is rendered with default props
    expect(screen.getByText("Test Confirmation")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to proceed?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  test("does not render when show is false", () => {
    renderComponent({ show: false });
    
    // The modal should not be in the document when show is false
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("calls onConfirm when confirm button is clicked", () => {
    const onConfirm = jest.fn();
    renderComponent({ onConfirm });
    
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    fireEvent.click(confirmButton);
    
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    renderComponent({ onCancel });
    
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("calls onCancel when close button is clicked", () => {
    const onCancel = jest.fn();
    renderComponent({ onCancel });
    
    const closeButton = screen.getByRole("button", { name: "Close modal" });
    fireEvent.click(closeButton);
    
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("applies custom button labels", () => {
    renderComponent({
      confirmLabel: "Yes, delete",
      cancelLabel: "No, keep it"
    });
    
    expect(screen.getByRole("button", { name: "No, keep it" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeInTheDocument();
  });

  test("applies custom heading and description", () => {
    renderComponent({
      heading: "Delete Item",
      description: "This action cannot be undone."
    });
    
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  test("has proper accessibility attributes", () => {
    renderComponent();
    
    const modal = screen.getByText("Test Confirmation").closest(".confirmation-modal");
    expect(modal).toBeInTheDocument();
    
    const closeButton = screen.getByRole("button", { name: "Close modal" });
    expect(closeButton).toHaveAttribute("aria-label", "Close modal");
    expect(closeButton).toHaveAttribute("type", "button");
  });

  // Tests for default prop values to improve branch coverage
  test("uses default heading when not provided", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
  });

  test("uses default description when not provided", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByText("Are you sure you want to continue?")).toBeInTheDocument();
  });

  test("uses default confirmLabel when not provided", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
  });

  test("uses default cancelLabel when not provided", () => {
    render(
      <ConfirmationModal
        show={true}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );
    
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  test("uses all default values when only required props provided", () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    
    render(
      <ConfirmationModal
        show={true}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );
    
    // Verify all defaults are rendered
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure you want to continue?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    
    // Verify functionality still works with defaults
    fireEvent.click(screen.getByRole("button", { name: "Yes" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    
    fireEvent.click(screen.getByRole("button", { name: "No" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test("renders with empty string heading", () => {
    renderComponent({ heading: "" });
    
    // Empty heading should still render (as empty strong tag)
    const modal = screen.getByText("Are you sure you want to proceed?").closest(".confirmation-modal");
    expect(modal).toBeInTheDocument();
  });

  test("renders with empty string description", () => {
    renderComponent({ description: "" });
    
    // Empty description should still render
    expect(screen.getByText("Test Confirmation")).toBeInTheDocument();
  });

  test("renders overlay with correct class", () => {
    renderComponent();
    
    const overlay = screen.getByText("Test Confirmation").closest(".confirmation-modal")?.parentElement;
    expect(overlay).toHaveClass("confirmation-overlay");
  });

  test("renders modal with correct class", () => {
    renderComponent();
    
    const modal = screen.getByText("Test Confirmation").closest(".confirmation-modal");
    expect(modal).toHaveClass("confirmation-modal");
  });

  test("close button has correct type attribute", () => {
    renderComponent();
    
    const closeButton = screen.getByRole("button", { name: "Close modal" });
    expect(closeButton).toHaveAttribute("type", "button");
  });

  test("confirm and cancel buttons have correct type", () => {
    renderComponent();
    
    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    
    expect(confirmButton).toHaveAttribute("type", "button");
    expect(cancelButton).toHaveAttribute("type", "button");
  });
});
