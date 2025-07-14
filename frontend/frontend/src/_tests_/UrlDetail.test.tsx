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

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import UrlDetail from "../pages/UrlDetail";
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
const mockUseParams = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => mockUseParams(),
}));

const mockUrl = {
  id: 1,
  title: "Test Site",
  address: "https://example.com",
  status: "done",
  html_version: "HTML5",
  internal_links: 5,
  external_links: 3,
  broken_links: 0,
  h1_count: 2,
  h2_count: 4,
  has_login_form: false,
  broken_links_details: [
    { id: 1, url: "https://example.com/broken", status_code: 404 }
  ]
};

describe("UrlDetail Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: "1" });
    (urlService.fetchUrlById as jest.Mock).mockResolvedValue(mockUrl);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/urls/1"]}>
        <Routes>
          <Route path="/urls/:id" element={<UrlDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("should show loading state initially", async () => {
    (urlService.fetchUrlById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("should display URL not found when URL doesn't exist", async () => {
    (urlService.fetchUrlById as jest.Mock).mockResolvedValue(null);
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("URL not found")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to dashboard/i })).toBeInTheDocument();
    });
  });

  test("should display URL details after loading", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Test Site")).toBeInTheDocument();
      expect(screen.getByText("HTML5")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("Not Found")).toBeInTheDocument();
    });
  });

  test("should display link distribution chart", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Link Distribution")).toBeInTheDocument();
    });
  });

  test("should display broken links section when they exist", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText("Broken Links Details")).toBeInTheDocument();
      expect(screen.getByText("https://example.com/broken")).toBeInTheDocument();
      expect(screen.getByText("404")).toBeInTheDocument();
    });
  });

  test("should not display broken links section when none exist", async () => {
    (urlService.fetchUrlById as jest.Mock).mockResolvedValue({
      ...mockUrl,
      broken_links: 0,
      broken_links_details: []
    });
    
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText("Broken Links Details")).not.toBeInTheDocument();
    });
  });

  test("should navigate back to dashboard when back link is clicked", async () => {
    renderComponent();
    
    const backLink = await screen.findByRole("link", { name: /back to dashboard/i });
    expect(backLink).toHaveAttribute("href", "/");
  });
});
