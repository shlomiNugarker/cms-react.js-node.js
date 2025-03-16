/* eslint-disable @typescript-eslint/no-explicit-any */
export const httpService = { get, post, put, del };

const BASE_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:3030";

function getAuthHeaders(secure: boolean) {
  if (!secure) return { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(
  method: string,
  endpoint: string,
  data: any = null,
  secure = false
) {
  try {
    const options: RequestInit = {
      method,
      headers: getAuthHeaders(secure),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(
      `🟢 Sending ${method} request to ${BASE_URL + endpoint}`,
      options
    );

    const res = await fetch(BASE_URL + endpoint, options);
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `Request failed with status ${res.status}: ${
          errorData.message || "Unknown error"
        }`
      );
    }

    return res.json();
  } catch (err: unknown) {
    console.error("🔴 HTTP Request Error:", err);
    throw err;
  }
}

async function get(endpoint: string, secure = false) {
  return request("GET", endpoint, null, secure);
}

async function post(endpoint: string, data: any = null, secure = false) {
  return request("POST", endpoint, data, secure);
}

async function put(endpoint: string, data: any = null, secure = false) {
  return request("PUT", endpoint, data, secure);
}

async function del(endpoint: string, secure = false) {
  return request("DELETE", endpoint, null, secure);
}
