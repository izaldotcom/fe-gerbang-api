import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Wrapper fetchAPI
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

  // CHECK SUPPLIER CONNECTION
  checkSupplierConnection: (payload) =>
    fetchAPI("/suppliers/check-connection", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // === SUPPLIER PRODUCTS ===
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
  getProducts: () => fetchAPI("/products", { method: "GET" }),
  createProduct: (payload) =>
    fetchAPI("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) =>
    fetchAPI(`/products?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteProduct: (id) => fetchAPI(`/products?id=${id}`, { method: "DELETE" }),

  // === PAYMENT TYPE ===
  getPaymentTypes: () => fetchAPI("/payment-types", { method: "GET" }),

  // === RECIPES ===
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

  // Hapus 1 baris bahan (Berdasarkan ID resep)
  deleteRecipe: (id) => fetchAPI(`/recipes/${id}`, { method: "DELETE" }),

  // [BARU] Hapus semua resep sekaligus tanpa garis miring penutup yang merusak struktur URL
  deleteFullRecipe: (productId) =>
    fetchAPI(`/recipes?product_id=${productId}`, { method: "DELETE" }),

  // === USERS ===
  getUsers: () => fetchAPI("/users", { method: "GET" }),
  verifyUser: (payload) =>
    fetchAPI("/verify", { method: "POST", body: JSON.stringify(payload) }),

  // === USER PROFILE (AUTH) ===
  getProfile: () => fetchAPI("/auth/me", { method: "GET" }),

  // === SELLER PROFILE ===
  getSellerProfile: (apiKey) =>
    fetchAPI("/seller/profile", {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
      },
    }),

  updateSellerProfile: (payload, apiKey) =>
    fetchAPI("/seller/profile", {
      method: "PUT",
      headers: {
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    }),

  // === ORDERS ===
  createOrder: (payload, apiKey) =>
    fetchAPI("/seller/order", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
    }),

  getOrderHistory: (apiKey) =>
    fetchAPI("/seller/order/history", {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
      },
      // Baris body: JSON.stringify(payload) dihapus karena method GET tidak butuh body
    }),

  getSellerProducts: (apiKey) =>
    fetchAPI("/seller/products", {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey,
      },
    }),
};
