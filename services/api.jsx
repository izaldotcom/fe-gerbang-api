import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Wrapper fetchAPI (Sama seperti sebelumnya)
const fetchAPI = async (endpoint, options = {}) => {
  const token = Cookies.get("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    let data;
    try {
      data = await res.json();
    } catch (err) {
      data = { message: "Terjadi kesalahan pada server." };
    }

    // Auto Logout jika token expired (401)
    if (res.status === 401) {
      Cookies.remove("token");
      Cookies.remove("refresh_token");
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
      throw new Error("Sesi berakhir. Silakan login kembali.");
    }

    if (!res.ok) {
      // Menampilkan pesan error dari backend (misal: "Not Found")
      throw new Error(data.message || res.statusText || "Request gagal");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const apiService = {
  // === AUTH ===
  login: (payload) =>
    fetchAPI("/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    fetchAPI("/register", { method: "POST", body: JSON.stringify(payload) }),

  // === SUPPLIERS ===
  getSuppliers: () => fetchAPI("/suppliers", { method: "GET" }),
  createSupplier: (payload) =>
    fetchAPI("/suppliers", { method: "POST", body: JSON.stringify(payload) }),
  updateSupplier: (id, payload) =>
    fetchAPI(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSupplier: (id) => fetchAPI(`/suppliers/${id}`, { method: "DELETE" }),

  // === SUPPLIER PRODUCTS ===
  // Pastikan endpoint ini benar ada di backend. Jika belum ada, akan menyebabkan 404 juga.
  getSupplierProducts: () => fetchAPI("/supplier-products", { method: "GET" }),
  createSupplierProduct: (payload) =>
    fetchAPI("/supplier-products", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSupplierProduct: (id, payload) =>
    fetchAPI(`/supplier-products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSupplierProduct: (id) =>
    fetchAPI(`/supplier-products/${id}`, { method: "DELETE" }),

  // === PRODUCTS ===
  // PERBAIKAN DI SINI: Kembalikan ke "/products" (jamak) untuk GET list
  getProducts: () => fetchAPI("/products", { method: "GET" }),

  // Create/Update/Delete tetap "/product" (tunggal) sesuai instruksi terakhir
  createProduct: (payload) =>
    fetchAPI("/product", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    fetchAPI(`/product?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id) => fetchAPI(`/product?id=${id}`, { method: "DELETE" }),

  // === RECIPES ===
  // Pastikan endpoint ini juga sudah ada di backend
  getRecipes: () => fetchAPI("/recipes", { method: "GET" }),
  createRecipe: (payload) =>
    fetchAPI("/recipes", { method: "POST", body: JSON.stringify(payload) }),
  updateRecipeItem: (payload) =>
    fetchAPI("/recipes", { method: "PUT", body: JSON.stringify(payload) }),
  replaceRecipe: (payload) =>
    fetchAPI("/recipes/replace", {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteRecipe: (id) => fetchAPI(`/recipes/${id}`, { method: "DELETE" }),

  // === USERS ===
  getUsers: () => fetchAPI("/users", { method: "GET" }),

  // === USER PROFILE (Ambil data dari Redis via Backend) ===
  getProfile: () => fetchAPI("/auth/me", { method: "GET" }),

  // === ORDERS ===
  createOrder: (payload) =>
    fetchAPI("/seller/order", {
      method: "POST",
      headers: { "X-API-KEY": "MTR-TEST-KEY" },
      body: JSON.stringify(payload),
    }),
};
