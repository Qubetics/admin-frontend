/* eslint-disable @typescript-eslint/no-explicit-any */
import useNetworkRequest from "../src/Hooks/useGetApi";
import axios from "axios";
import { apiMethods } from "../src/Constant/constants";
import { toast } from "react-toastify";

// MOCKS
jest.mock("axios");
jest.mock("react-toastify", () => ({
  toast: { error: jest.fn() }
}));

// Mock react-router navigation
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate
}));

// Mock LoggedInContext
const mockSetAuthData = jest.fn();
jest.mock("../src/Context/LoggedInContext", () => ({
  useIsLoggedIn: () => ({
    setAuthData: mockSetAuthData
  })
}));

describe("useGetApi (async API function)", () => {
  let useGetApi: any;

  beforeEach(() => {
    jest.clearAllMocks();
    useGetApi = useNetworkRequest(); 
  });

  it("returns success response", async () => {
    (axios as any).mockResolvedValueOnce({
      data: { id: 1, message: "OK" },
      headers: { total: 99 }
    });

    const result = await useGetApi({
      endpoint: "/test",
      method: apiMethods.GET,
    });

    expect(result).toEqual({
      success: true,
      data: { id: 1, message: "OK" },
      headers: { totalCount: 99 },
      message: "OK",
    });
  });

  it("handles normal (non-401) error responses", async () => {
    (axios as any).mockRejectedValueOnce({
      response: { data: { message: "Bad Request" } }
    });

    const result = await useGetApi({
      endpoint: "/fail",
    });

    expect(result).toEqual({
      success: false,
      message: "Bad Request",
      data: { message: "Bad Request" },
    });
  });

  it("handles 401 unauthorized error", async () => {
    (axios as any).mockRejectedValueOnce({
      response: { status: 401 }
    });

    const result = await useGetApi({
      endpoint: "/auth-error",
    });

    
    expect(mockSetAuthData).toHaveBeenCalledWith("");
    expect(toast.error).toHaveBeenCalledWith("Unauthorized Access", { toastId: "unauthorized" });
    expect(mockNavigate).toHaveBeenCalledWith("/landing");

    expect(result).toEqual({
      success: false,
      message: "Session expired. Please log in again.",
    });
  });

  it("supports custom URL override", async () => {
    (axios as any).mockResolvedValueOnce({
      data: { ok: true },
      headers: { total: 7 },
    });

    const customUrl = "https://google.com/test";

    const result = await useGetApi({
      url: customUrl,
      method: apiMethods.POST,
      body: { a: 1 }
    });

    expect(axios).toHaveBeenCalledWith({
      method: apiMethods.POST,
      url: customUrl,
      data: { a: 1 },
      withCredentials: true,
    });

    expect(result.success).toBe(true);
  });
});
