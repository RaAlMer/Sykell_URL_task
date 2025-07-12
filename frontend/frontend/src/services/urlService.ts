import axios from "axios";
import type { UrlItem } from "../types/url";

const API_BASE = import.meta.env.VITE_GO_API_BASE;

export const fetchUrls = async (): Promise<UrlItem[]> => {
  const response = await axios.get(`${API_BASE}/urls`);
  return response.data.data; // because backend response is { data, limit, page, total }
};

export const fetchUrlById = async (id: number): Promise<UrlItem> => {
  const response = await axios.get(`${API_BASE}/urls/${id}`);
  return response.data;
};
