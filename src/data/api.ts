import type {
  ProductPayload,
  ReturnedProducts,
  ApiResponse,
} from "../lib/types";

const BASE_URL = "https://primetradeaibackend-production.up.railway.app";

async function fetchJSON(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  return response.json();
}

export async function fetchProducts(): Promise<
  ReturnedProducts | { success: false; message: string }
> {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching API data:", error);
    throw error;
  }
}

export async function createProduct(
  payload: ProductPayload
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function updateProduct(
  id: number,
  payload: ProductPayload
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/product/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}/product/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    return await response.json();
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{
  message: string;
  success: boolean;
}> {
  return fetchJSON(`${BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: "ADMIN" | "USER"
): Promise<{
  success: boolean;
  message: string;
}> {
  return fetchJSON(`${BASE_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ email, password, name, role }),
  });
}
