const localApiBaseUrl = "http://localhost:3000";
const deployedApiBaseUrl = "https://assignmentdeploywebapp-backend-qvcj.onrender.com";

const isLocalBrowser =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

export const apiBaseUrl = isLocalBrowser
  ? localApiBaseUrl
  : import.meta.env.VITE_API_BASE_URL || deployedApiBaseUrl;
