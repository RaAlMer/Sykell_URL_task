/**
 * @jest-environment jsdom
 */

global.TextEncoder = class {
  encode(input = '') {
    const buffer = new ArrayBuffer(input.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < input.length; i++) {
      view[i] = input.charCodeAt(i);
    }
    return view;
  }
} as any;

global.TextDecoder = class {
  decode(input?: ArrayBuffer) {
    if (!input) return '';
    const view = new Uint8Array(input);
    return String.fromCharCode(...view);
  }
} as any;

import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import * as urlService from "../services/urlService";
import "@testing-library/jest-dom";

jest.mock("../services/httpClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

jest.mock("../services/urlService");

describe("Dashboard Component", () => {
  const mockUrl = {
    id: 1,
    title: "Example Site",
    address: "https://example.com",
    status: "queued",
    html_version: "HTML5",
    internal_links: 5,
    external_links: 3,
    broken_links: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (urlService.fetchUrls as jest.Mock).mockResolvedValue([]);
    window.confirm = jest.fn().mockReturnValue(true);
  });

  test("should show empty state when no URLs exist", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });
  });

  test("should successfully add and display new URL", async () => {
    (urlService.fetchUrls as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockUrl]);
    (urlService.createUrl as jest.Mock).mockResolvedValue(mockUrl);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const input = await screen.findByPlaceholderText(/enter url/i);
    const button = screen.getByRole("button", { name: /add url/i });

    fireEvent.change(input, { target: { value: "https://example.com" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(urlService.createUrl).toHaveBeenCalledWith("https://example.com");
    });

    expect(await screen.findByText("Example Site")).toBeInTheDocument();
  });

  test("should display selection controls when URLs are selected", async () => {
    (urlService.fetchUrls as jest.Mock).mockResolvedValue([mockUrl]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const row = await screen.findByRole("row", { name: /example site/i });
    const checkbox = within(row).getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(screen.getByText("1 URL selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rerun/i })).toBeInTheDocument();
  });

  test("should handle URL rerun", async () => {
    const errorUrl = {...mockUrl, status: "error"};
    (urlService.fetchUrls as jest.Mock).mockResolvedValue([errorUrl]);
    (urlService.rerunUrl as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const row = await screen.findByRole("row", { name: /example site/i });
    const checkbox = within(row).getByRole("checkbox");
    fireEvent.click(checkbox);

    const rerunButton = screen.getByRole("button", { name: /rerun/i });
    fireEvent.click(rerunButton);

    await waitFor(() => {
      expect(urlService.rerunUrl).toHaveBeenCalledWith(1);
    });
  });

  test("should display different status indicators correctly", async () => {
    const mockUrls = [
      { ...mockUrl, id: 1, status: "queued" },
      { ...mockUrl, id: 2, status: "running" },
      { ...mockUrl, id: 3, status: "done" },
      { ...mockUrl, id: 4, status: "error" }
    ];

    (urlService.fetchUrls as jest.Mock).mockResolvedValue(mockUrls);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText(/queued/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/running/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/done/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/error/i).length).toBeGreaterThan(0);
    });
  });

  test("should not delete URLs when confirmation is canceled", async () => {
    (urlService.fetchUrls as jest.Mock).mockResolvedValue([mockUrl]);
    window.confirm = jest.fn().mockReturnValue(false);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const row = await screen.findByRole("row", { name: /example site/i });
    const checkbox = within(row).getByRole("checkbox");
    fireEvent.click(checkbox);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(urlService.deleteUrl).not.toHaveBeenCalled();
    });
  });
});
