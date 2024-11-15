import axios from "axios";
import { CONFIG } from "../config";

export const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: CONFIG.REQUEST.TIMEOUT,
  maxRedirects: CONFIG.REQUEST.MAX_REDIRECTS,
  maxContentLength: CONFIG.REQUEST.MAX_CONTENT_LENGTH,
  decompress: true,
});

export default api;
