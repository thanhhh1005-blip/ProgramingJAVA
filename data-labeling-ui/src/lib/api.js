const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || "")
  .trim()
  .replace(/\/+$/, "");

export const API_BASE_URL = rawBaseUrl
  ? `${rawBaseUrl}/api`
  : "http://localhost:8080/api";

export function getToken() {
  return localStorage.getItem("token");
}

export async function parseApiResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function unwrapResult(payload) {
  if (
    payload &&
    typeof payload === "object" &&
    Object.prototype.hasOwnProperty.call(payload, "result")
  ) {
    return payload.result;
  }

  return payload;
}

export function getErrorMessage(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    return payload.message || payload.error || fallbackMessage;
  }

  return fallbackMessage;
}
