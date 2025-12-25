/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Node from "../Node";

jest.mock("../../../Common/Copy/CopyText", () => ({
  __esModule: true,
  default: ({ text }: any) => <div data-testid="copy">{text}</div>,
}));

jest.mock("../../../utils/pagination", () => ({
  __esModule: true,
  default: ({ onPageChange, onLimitChange }: any) => (
    <div>
      <button data-testid="next-page" onClick={() => onPageChange(2)}>
        NEXT
      </button>

      <select data-testid="limit" onChange={(e) => onLimitChange(Number(e.target.value))}>
        <option value="5">5</option>
        <option value="10">10</option>
      </select>
    </div>
  ),
}));

const mockUseApi = jest.fn();
jest.mock("../../../Hooks/useGetApi", () => ({
  __esModule: true,
  default: () => mockUseApi,
}));

const paginatedEmpty = {
  success: true,
  data: { data: { response: [], total: 10 } },
};

const paginatedOneRow = {
  success: true,
  data: {
    data: {
      response: [
        {
          orgName: "Org1",
          nodeAddress: "ADDR1",
          requestFor: "Unlink",
          status: "rejected",
        },
      ],
      total: 10,
    },
  },
};

// Mock data with 6 rows to trigger pagination (needs > 5 rows)
const paginatedSixRows = {
  success: true,
  data: {
    data: {
      response: [
        {
          orgName: "Org1",
          nodeAddress: "ADDR1",
          requestFor: "Unlink",
          status: "rejected",
        },
        {
          orgName: "Org2",
          nodeAddress: "ADDR2",
          requestFor: "Link",
          status: "approved",
        },
        {
          orgName: "Org3",
          nodeAddress: "ADDR3",
          requestFor: "Update",
          status: "pending",
        },
        {
          orgName: "Org4",
          nodeAddress: "ADDR4",
          requestFor: "Unlink",
          status: "rejected",
        },
        {
          orgName: "Org5",
          nodeAddress: "ADDR5",
          requestFor: "Link",
          status: "approved",
        },
        {
          orgName: "Org6",
          nodeAddress: "ADDR6",
          requestFor: "Update",
          status: "active",
        },
      ],
      total: 10,
    },
  },
};

const statusRowsResponse = {
  success: true,
  data: {
    data: {
      response: [
        {
          orgName: "Org",
          nodeAddress: "ADDR",
          nodeStatus: "pending",
          requestFor: "Update",
          status: "rejected",
        },
      ],
      total: 10,
    },
  },
};

describe("Node Component – 100% coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders header", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedEmpty);
    await act(async () => render(<Node />));
    expect(screen.getByText("Node List")).toBeInTheDocument();
  });

  test("renders 'No data found' when empty", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedEmpty);
    await act(async () => render(<Node />));
    expect(screen.getByText("No data found")).toBeInTheDocument();
  });

  test("renders data rows", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedOneRow);
    await act(async () => render(<Node />));

    expect(screen.getByText("Org1")).toBeInTheDocument();
    expect(screen.getAllByText("ADDR1").length).toBeGreaterThan(0);
    expect(screen.getByTestId("copy")).toBeInTheDocument();
  });

  test("covers ALL getStatusClass branches (forces Node Status column)", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedSixRows);
    mockUseApi.mockResolvedValueOnce(statusRowsResponse);

    await act(async () => render(<Node />));

    // Wait for initial data to load
    await waitFor(() => expect(screen.getByText("Org1")).toBeInTheDocument());

    // Verify pagination is present
    await waitFor(() => expect(screen.getByTestId("limit")).toBeInTheDocument());

    await act(async () =>
      fireEvent.change(screen.getByTestId("limit"), {
        target: { value: "10" },
      })
    );

    // Wait for the second API call and new data to render
    await waitFor(() => expect(screen.getByText(/rejected/i)).toBeInTheDocument());
    expect(screen.getByText("Rejected")).toBeInTheDocument();
  });

  test("pagination change calls API again", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedSixRows);
    mockUseApi.mockResolvedValueOnce(paginatedSixRows);

    await act(async () => render(<Node />));

    await waitFor(() => expect(screen.getByTestId("next-page")).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("next-page"));

    await waitFor(() => expect(mockUseApi).toHaveBeenCalledTimes(2));
  });

  test("limit change triggers setPage + setLimit", async () => {
    mockUseApi.mockResolvedValueOnce(paginatedSixRows);
    mockUseApi.mockResolvedValueOnce(paginatedSixRows);

    await act(async () => render(<Node />));

    await waitFor(() => expect(screen.getByTestId("limit")).toBeInTheDocument());

    fireEvent.change(screen.getByTestId("limit"), {
      target: { value: "10" },
    });

    await waitFor(() => expect(mockUseApi).toHaveBeenCalledTimes(2));
  });

  test("API failure does not crash", async () => {
    mockUseApi.mockResolvedValueOnce({ success: false });
    await act(async () => render(<Node />));
    expect(screen.getByText("Node List")).toBeInTheDocument();
  });
  test("covers default status badge", async () => {
    mockUseApi.mockResolvedValueOnce({
      success: true,
      data: {
        data: {
          response: [
            {
              orgName: "OrgX",
              nodeAddress: "ADDRX",
              nodeStatus: "weird-status",
              requestFor: "Update",
              status: "unknown",
            },
          ],
          total: 1,
        },
      },
    });

    await act(async () => {
      render(<Node />);
    });

    await waitFor(() => {
      expect(screen.getByText("Unknown")).toBeInTheDocument();
    });

    expect(screen.getByText("Unknown")).toHaveClass("status-badge default");
  });
});
