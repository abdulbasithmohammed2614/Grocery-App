// Dynamic API Base URL configuration for Localhost and Vercel Deployments
export const getApiBaseUrl = () => {
  // If explicitly provided via environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }

  // If running in browser locally on port 3000
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  // Deployed on Vercel / Production (relative path routed by vercel.json)
  return "";
};

export const API_BASE_URL = getApiBaseUrl();
