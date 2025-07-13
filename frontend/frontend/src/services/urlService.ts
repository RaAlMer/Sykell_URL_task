import type { UrlItem } from "../types/url";
import httpClient from "./httpClient";

export const fetchUrls = async (): Promise<UrlItem[]> => {
  const response = await httpClient.get("/urls");
  return response.data.data;
};

export const fetchUrlById = async (id: number): Promise<UrlItem> => {
  const response = await httpClient.get(`/urls/${id}`);
  return response.data;
};

export const createUrl = async (address: string): Promise<void> => {
  await httpClient.post("/urls", { address });
};
