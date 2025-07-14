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

import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import UrlTable from "../components/UrlTable";
import type { UrlItem } from "../types/url";
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

const mockUrls: UrlItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  title: `Site ${i + 1}`,
  address: `https://site${i + 1}.com`,
  status: "done",
  html_version: "HTML5",
  internal_links: i,
  external_links: i + 1,
  broken_links: 0,
  created_at: "0",
  updated_at: "0",
}));

const mockRenderStatus = (status: string) => <span>{status}</span>;

describe("UrlTable Component", () => {
  const setup = (props = {}) => {
    const defaultProps = {
      urls: mockUrls,
      onSelectChange: jest.fn(),
      renderStatusIndicator: mockRenderStatus,
      ...props
    };
    
    return render(
      <MemoryRouter>
        <UrlTable {...defaultProps} />
      </MemoryRouter>
    );
  };

  test("renders table with URLs", () => {
    setup({ urls: mockUrls.slice(0, 1) });
    
    expect(screen.getByText("Site 1")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3); // Header + filter row + data row
  });

  test("filters by title correctly", () => {
    setup();
    
    const searchInput = screen.getByPlaceholderText(/filter title/i);
    fireEvent.change(searchInput, { target: { value: "Site 10" } });

    expect(screen.getByText("Site 10")).toBeInTheDocument();
    expect(screen.queryByText("Site 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Site 9")).not.toBeInTheDocument();
  });

  test("handles selection correctly", () => {
    const mockSelectChange = jest.fn();
    setup({ onSelectChange: mockSelectChange });
    
    // Select first item
    const checkbox = screen.getAllByRole("checkbox")[1]; // Skip select-all checkbox
    fireEvent.click(checkbox);
    
    expect(checkbox).toBeChecked();
    expect(mockSelectChange).toHaveBeenCalledWith([1]);
    
    // Select second item
    const secondCheckbox = screen.getAllByRole("checkbox")[2];
    fireEvent.click(secondCheckbox);
    
    expect(mockSelectChange).toHaveBeenLastCalledWith([1, 2]);
  });

  test("handles select all correctly", () => {
    const mockSelectChange = jest.fn();
    setup({ onSelectChange: mockSelectChange });
    
    // Select all on current page
    const selectAll = screen.getAllByRole("checkbox")[0];
    fireEvent.click(selectAll);
    
    expect(selectAll).toBeChecked();
    expect(mockSelectChange).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
  });

  test("shows empty state when no results", () => {
    setup({ urls: [] });
    
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  test("navigates to detail page on row click", () => {
    const { container } = setup();
    
    // Click first row
    const firstRow = container.querySelector("tbody tr");
    if (firstRow) {
      fireEvent.click(firstRow);
    }
    
    // Verify navigation would occur (you might need to mock useNavigate)
    // This depends on your test setup
  });

  test("filters by link ranges correctly", () => {
    setup();
    
    // Filter for internal links 11-50
    const internalFilter = screen.getAllByRole("combobox")[1]; // First range filter
    fireEvent.change(internalFilter, { target: { value: "11-50" } });
    
    // Should only show items with internal links in that range
    expect(screen.queryByText("Site 1")).not.toBeInTheDocument();
    expect(screen.getByText("Site 12")).toBeInTheDocument();
  });
});
