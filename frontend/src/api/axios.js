import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    const url    = err.config?.url || "";
    // Only force-logout on 401 from auth endpoints (expired token)
    // Never logout on 403 — that's just a permissions error for a resource
    const isTokenExpired =
      status === 401 &&
      (url.includes("/auth/") || err.response?.data?.message?.toLowerCase().includes("token"));

    if (isTokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default api;
