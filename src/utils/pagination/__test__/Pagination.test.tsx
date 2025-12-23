/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../index";

describe("Pagination Component", () => {
  const setup = (props: any = {}) => {
    const onPageChange = jest.fn();
    const onLimitChange =
      props.onLimitChange !== undefined ? props.onLimitChange : jest.fn();

    const utils = render(
      <Pagination
        currentPage={props.currentPage ?? 1}
        totalPages={props.totalPages ?? 5}
        onPageChange={onPageChange}
        limit={props.limit ?? 5}
        onLimitChange={onLimitChange}
        {...props}
      />
    );

    return {
      onPageChange,
      onLimitChange:
        props.onLimitChange !== undefined ? onLimitChange : undefined,
      ...utils,
    };
  };

  test("renders page numbers correctly", () => {
    setup({ totalPages: 5 });

    const pageButtons = screen.getAllByRole("button", {
      name: /^[0-9]+$/,
    });

    expect(pageButtons).toHaveLength(5);
  });

  test("disables prev button on first page", () => {
    setup({ currentPage: 1 });
    expect(screen.getByText("<")).toBeDisabled();
  });

  test("disables next button on last page", () => {
    setup({ currentPage: 5, totalPages: 5 });
    expect(screen.getByText(">")).toBeDisabled();
  });

  test("calls onPageChange when clicking page buttons", () => {
    const { onPageChange } = setup({ currentPage: 2 });
    fireEvent.click(screen.getByText("3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test("prev button works", () => {
    const { onPageChange } = setup({ currentPage: 3 });
    fireEvent.click(screen.getByText("<"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test("next button works", () => {
    const { onPageChange } = setup({ currentPage: 3, totalPages: 5 });
    fireEvent.click(screen.getByText(">"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  test("highlights the current page number", () => {
    setup({ currentPage: 3 });
    const activeButton = screen.getByText("3");
    expect(activeButton).toHaveClass("active");
  });

  test("dropdown shows current limit", () => {
    setup({ limit: 10 });
    const dropdown = screen.getByDisplayValue("10") as HTMLSelectElement;
    expect(dropdown.value).toBe("10");
  });

  test("dropdown triggers onLimitChange when provided", () => {
    const mockOnLimitChange = jest.fn();
    setup({ limit: 5, onLimitChange: mockOnLimitChange });

    const dropdown = screen.getByDisplayValue("5");
    fireEvent.change(dropdown, { target: { value: "20" } });

    expect(mockOnLimitChange).toHaveBeenCalledWith(20);
  });

  test("renders limit options 5, 10, 20", () => {
    setup();
    const select = screen.getByRole("combobox");
    const options = Array.from(select.children).map(
      (option) => option.textContent
    );
    expect(options).toEqual(["5", "10", "20"]);
  });

  test("works with default onLimitChange when not provided", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={jest.fn()}
        limit={5}
      />
    );

    expect(container).toBeInTheDocument();

    const dropdown = screen.getByDisplayValue("5");
    fireEvent.change(dropdown, { target: { value: "10" } });
  });

  test("handles single page correctly", () => {
    setup({ currentPage: 1, totalPages: 1 });

    const pageButtons = screen.getAllByRole("button", {
      name: /^[0-9]+$/,
    });

    expect(pageButtons).toHaveLength(1);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("does not crash when onLimitChange is not provided", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={jest.fn()}
        limit={5}
      />
    );

    expect(container).toBeInTheDocument();

    const dropdown = screen.getByDisplayValue("5");
    fireEvent.change(dropdown, { target: { value: "10" } });
  });

  test("handles zero pages case", () => {
    const { container } = render(
      <Pagination
        currentPage={0}
        totalPages={0}
        onPageChange={jest.fn()}
        limit={5}
      />
    );
    expect(container).toBeInTheDocument();
  });
  test("uses default onLimitChange when not provided (no crash)", () => {
    const onPageChange = jest.fn();

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={onPageChange}
        limit={5}
      />
    );

    const dropdown = screen.getByDisplayValue("5");

    fireEvent.change(dropdown, { target: { value: "10" } });

    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test("getPages returns empty list for negative totalPages (branch coverage)", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={-1}
        onPageChange={jest.fn()}
        limit={5}
      />
    );

    const pageButtons = screen.queryAllByRole("button", {
      name: /^[0-9]+$/,
    });

    expect(pageButtons).toHaveLength(0);
  });

  test("covers false branch of page loop when totalPages is negative", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={-1}
        onPageChange={jest.fn()}
        limit={5}
      />
    );

    const pageButtons = screen.queryAllByRole("button", { name: /^[0-9]+$/ });
    expect(pageButtons).toHaveLength(0);
  });
});
