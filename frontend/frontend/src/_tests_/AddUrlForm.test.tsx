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

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddUrlForm from "../components/AddUrlForm";
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

describe("AddUrlForm Component", () => {
  test("validates URL format", async () => {
    const mockSuccess = jest.fn();
    render(<AddUrlForm onSuccess={mockSuccess} />);
    
    const input = screen.getByPlaceholderText("Enter URL (https://...)");
    const button = screen.getByRole("button", { name: /add url/i });

    // Test invalid URL
    fireEvent.change(input, { target: { value: "invalid" } });
    fireEvent.click(button);
    expect(screen.getByText(/must start with/i)).toBeInTheDocument();

    // Test valid URL
    (urlService.createUrl as jest.Mock).mockResolvedValue({});
    fireEvent.change(input, { target: { value: "https://valid.com" } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockSuccess).toHaveBeenCalled();
    });
  });

  test("handles API errors", async () => {
    const mockSuccess = jest.fn();
    (urlService.createUrl as jest.Mock).mockRejectedValue(new Error("API Error"));
    
    render(<AddUrlForm onSuccess={mockSuccess} />);
    
    fireEvent.change(
      screen.getByPlaceholderText("Enter URL (https://...)"),
      { target: { value: "https://error.com" } }
    );
    fireEvent.click(screen.getByRole("button", { name: /add url/i }));
    
    expect(await screen.findByText(/failed to add url/i)).toBeInTheDocument();
  });
});
