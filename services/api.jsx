import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 1. Fungsi Wrapper Utama (Pengganti Axios)
const fetchAPI = async (endpoint, options = {}) => {
  const token = Cookies.get("token");

  // Default Headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Otomatis inject Token jika ada
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Config Fetch
  const config = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);

    // Handle jika response bukan JSON (misal 500 Server Error HTML)
    let data;
    try {
      data = await res.json();
    } catch (err) {
      data = { message: "Terjadi kesalahan pada server." };
    }

    // Jika status tidak OK, lempar error agar bisa ditangkap di catch block komponen
    if (!res.ok) {
      throw new Error(data.message || "Request gagal");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 2. Kumpulan Endpoint (Repository)
// Di sinilah Anda mendaftarkan semua route API Backend Anda
export const apiService = {
  // Auth
  login: (payload) =>
    fetchAPI("/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    fetchAPI("/register", { method: "POST", body: JSON.stringify(payload) }),

  // Suppliers
  getSuppliers: () => fetchAPI("/suppliers", { method: "GET" }),
  createSupplier: (payload) =>
    fetchAPI("/suppliers", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSupplier: (id, payload) =>
    fetchAPI(`/suppliers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSupplier: (id) =>
    fetchAPI(`/suppliers/${id}`, {
      method: "DELETE",
    }),

  // === SUPPLIER PRODUCTS (BARU) ===
  // Asumsi endpointnya adalah /supplier-products, sesuaikan jika beda
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
    fetchAPI(`/supplier-products/${id}`, {
      method: "DELETE",
    }),

  // Products
  getProducts: () => fetchAPI("/products", { method: "GET" }),
  getProductDetail: (id) => fetchAPI(`/products/${id}`, { method: "GET" }),
  createProduct: (payload) =>
    fetchAPI("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    fetchAPI(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id) => fetchAPI(`/products/${id}`, { method: "DELETE" }),

  // Users
  getUsers: () => fetchAPI("/users", { method: "GET" }),

  // === TRANSAKSI / ORDER ===
  createOrder: (payload) =>
    fetchAPI("/seller/order", {
      method: "POST",
      headers: {
        "X-API-KEY": "MTR-TEST-KEY",
      },
      body: JSON.stringify(payload),
    }),
};
