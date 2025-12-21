"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function ProductsPage() {
  // State Data Utama
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [supplierProducts, setSupplierProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Role User
  const [userRole, setUserRole] = useState(null);

  // State Filter (ID Supplier Terpilih)
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Initial Form
  const initialForm = {
    name: "",
    denom: "",
    price: "",
    qty: "",
    status: "true",
  };
  const [formData, setFormData] = useState(initialForm);

  // === HELPERS UI ===
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    const index = id ? id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // === 1. FETCH DATA (Termasuk Profile User) ===
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [
        productsRes,
        suppliersRes,
        recipesRes,
        supplierProdRes,
        profileRes,
      ] = await Promise.all([
        apiService.getProducts(),
        apiService.getSuppliers(),
        apiService.getRecipes(),
        apiService.getSupplierProducts(),
        apiService.getProfile(), // Ambil data user login
      ]);

      setProducts(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setRecipes(recipesRes.data || []);
      setSupplierProducts(supplierProdRes.data || []);

      // Set Role User
      if (profileRes.data) {
        setUserRole(profileRes.data.role_name);
      }
    } catch (err) {
      console.error("Gagal ambil data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === CHECK ROLE (Apakah Admin?) ===
  const isAdmin = userRole === "Admin";

  // === 2. FILTER LOGIC ===
  const filteredProducts = selectedSupplierId
    ? products.filter((product) => {
        const recipeGroup = recipes.find((r) => r.product_id === product.id);
        if (!recipeGroup || !recipeGroup.items) return false;
        return recipeGroup.items.some((item) => {
          const sp = supplierProducts.find(
            (s) => s.id === item.supplier_product_id
          );
          return sp && sp.supplier_id === selectedSupplierId;
        });
      })
    : []; // Default kosong sebelum pilih supplier

  // === 3. SUBMIT HANDLER ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        denom: Number(formData.denom),
        price: Number(formData.price),
        qty: Number(formData.qty),
        status: formData.status === "true" || formData.status === true,
      };

      if (isEditing) {
        await apiService.updateProduct(currentId, payload);
      } else {
        const createPayload = {
          ...payload,
          supplier_id: selectedSupplierId,
        };
        await apiService.createProduct(createPayload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  // === 4. DELETE HANDLER ===
  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await apiService.deleteProduct(id);
        fetchData();
      } catch (err) {
        alert(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  // === UI HANDLERS ===
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name,
      denom: item.denom,
      price: item.price,
      qty: item.qty,
      status: item.status ? "true" : "false",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-900 pb-20">
      {/* HEADER PAGE */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <p className="text-gray-500 mt-1">
          {isAdmin
            ? "Kelola data produk utama (Koin Emas)."
            : "Lihat daftar produk yang tersedia."}
        </p>
      </div>

      {/* === GRID FILTER BY SUPPLIER === */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4 h-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Filter by Supplier
          </h2>
          {selectedSupplierId && (
            <button
              onClick={() => setSelectedSupplierId("")}
              className="group flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold transition-all hover:bg-red-100 hover:pr-2 hover:shadow-sm animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span>Reset</span>
              <span className="bg-red-200 text-red-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] group-hover:bg-red-300 transition-colors">
                ✕
              </span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suppliers.map((s) => {
            const isActive = selectedSupplierId === s.id;
            return (
              <div
                key={s.id}
                onClick={() =>
                  setSelectedSupplierId((prev) => (prev === s.id ? "" : s.id))
                }
                className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group select-none
                  ${
                    isActive
                      ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600"
                      : "border-gray-100 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
                  }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm transition-transform ${
                    isActive ? "scale-110" : ""
                  } ${getAvatarColor(s.id)}`}
                >
                  {getInitials(s.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold truncate transition-colors ${
                      isActive ? "text-blue-900" : "text-gray-700"
                    }`}
                  >
                    {s.name}
                  </h3>
                  <p
                    className={`text-xs font-mono truncate transition-colors ${
                      isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {s.code}
                  </p>
                </div>
                {isActive && (
                  <div className="absolute top-[-10px] right-[-10px] text-white bg-blue-600 rounded-full p-1 shadow-md border-2 border-white scale-100 animate-in zoom-in duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* HEADER TABEL & BUTTON ADD */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {selectedSupplierId ? (
            <>
              <span>📦 Produk dari</span>
              <span className="text-blue-600 underline decoration-blue-300 underline-offset-4">
                {suppliers.find((s) => s.id === selectedSupplierId)?.name}
              </span>
            </>
          ) : (
            "Daftar Produk"
          )}
        </h2>

        {/* Tombol Add: HANYA MUNCUL JIKA ADMIN & SUPPLIER DIPILIH */}
        {isAdmin && selectedSupplierId && (
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
          >
            <span>+</span> Tambah Produk
          </button>
        )}
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Denom
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Harga
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>

                {/* Kolom Aksi HANYA MUNCUL JIKA ADMIN */}
                {isAdmin && (
                  <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="p-8 text-center text-gray-500"
                  >
                    Memuat data produk...
                  </td>
                </tr>
              ) : !selectedSupplierId ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="p-16 text-center text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        👆
                      </div>
                      <p className="font-medium">
                        Pilih salah satu supplier di atas untuk melihat produk.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 6 : 5}
                    className="p-16 text-center text-gray-400"
                  >
                    Belum ada produk untuk supplier ini.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors duration-150"
                  >
                    <td className="p-5 font-semibold text-gray-800">
                      {item.name}
                    </td>
                    <td className="p-5 text-gray-600 font-mono text-sm">
                      {formatNumber(item.denom)}
                    </td>
                    <td className="p-5 text-blue-600 font-medium">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="p-5 text-gray-700">
                      {formatNumber(item.qty)}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          item.status
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Tombol Aksi HANYA MUNCUL JIKA ADMIN */}
                    {isAdmin && (
                      <td className="p-5 text-right space-x-3 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                        >
                          Hapus
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form (Hanya Admin yang bisa trigger ini) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Koin Emas 100M"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Denom
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.denom}
                onChange={(e) =>
                  setFormData({ ...formData, denom: e.target.value })
                }
                placeholder="100000000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.qty}
                onChange={(e) =>
                  setFormData({ ...formData, qty: e.target.value })
                }
                placeholder="100"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Harga (Rp)
            </label>
            <input
              type="number"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="140000"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* Note untuk Admin */}
          {!isEditing && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              Produk akan ditambahkan ke supplier:{" "}
              <b>{suppliers.find((s) => s.id === selectedSupplierId)?.name}</b>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg font-medium transition"
            >
              {isEditing ? "Update Produk" : "Simpan Produk"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
