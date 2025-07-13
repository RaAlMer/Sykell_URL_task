import axios from "axios";

const API_BASE = import.meta.env.VITE_GO_API_BASE;
const API_TOKEN = import.meta.env.VITE_GO_API_TOKEN;

const httpClient = axios.create({
  baseURL: API_BASE,
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export default httpClient;
