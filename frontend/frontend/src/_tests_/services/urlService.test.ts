import * as urlService from "../../services/urlService";
import httpClient from "../../services/httpClient";
import "@testing-library/jest-dom";

jest.mock("../../services/httpClient", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("urlService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchUrls", () => {
    test("makes GET request to correct endpoint", async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({ data: [] });
      await urlService.fetchUrls();
      expect(httpClient.get).toHaveBeenCalledWith("/urls");
    });
  });

  describe("createUrl", () => {
    test("makes POST request with correct payload", async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({ data: {} });
      const testUrl = "https://example.com";
      await urlService.createUrl(testUrl);
      expect(httpClient.post).toHaveBeenCalledWith("/urls", { address: testUrl });
    });
  });

  describe("fetchUrlById", () => {
    test("makes GET request with URL id", async () => {
      const urlId = 42;
      (httpClient.get as jest.Mock).mockResolvedValue({ data: {} });
      await urlService.fetchUrlById(urlId);
      expect(httpClient.get).toHaveBeenCalledWith(`/urls/${urlId}`);
    });
  });

  describe("deleteUrl", () => {
    test("makes DELETE request with URL id", async () => {
      const urlId = 123;
      (httpClient.delete as jest.Mock).mockResolvedValue({ data: {} });
      await urlService.deleteUrl(urlId);
      expect(httpClient.delete).toHaveBeenCalledWith(`/urls/${urlId}`);
    });
  });

  describe("rerunUrl", () => {
    test("makes POST request with URL id", async () => {
      const urlId = 7;
      (httpClient.post as jest.Mock).mockResolvedValue({ data: {} });
      await urlService.rerunUrl(urlId);
      expect(httpClient.post).toHaveBeenCalledWith(`/urls/${urlId}/rerun`);
    });
  });
});
