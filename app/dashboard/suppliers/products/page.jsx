"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function SupplierProductsPage() {
  const [dataList, setDataList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Filter (Menyimpan ID Supplier terpilih)
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialForm = {
    supplier_id: "",
    supplierProductID: "",
    name: "",
    denom: "",
    cost_price: "",
    price: "",
    status: "true",
  };
  const [formData, setFormData] = useState(initialForm);

  // Helper: Format Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Helper: Ambil Inisial untuk Avatar (Misal: Mitra Higgs -> MH)
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Helper: Warna acak untuk background avatar agar tidak monoton
  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
    ];
    // Trik sederhana mengubah string ID/UUID menjadi index angka
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // === 1. FETCH DATA ===
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, suppliersRes] = await Promise.all([
        apiService.getSupplierProducts(),
        apiService.getSuppliers(),
      ]);

      setDataList(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);

      // Opsional: Jika ingin otomatis pilih supplier pertama
      // if (suppliersRes.data && suppliersRes.data.length > 0) {
      //   setSelectedSupplierId(suppliersRes.data[0].id);
      // }
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter Data
  const filteredData = selectedSupplierId
    ? dataList.filter((item) => item.supplier_id === selectedSupplierId)
    : [];

  // === HANDLERS ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        denom: Number(formData.denom),
        cost_price: Number(formData.cost_price),
        price: Number(formData.price),
        status: formData.status === "true" || formData.status === true,
      };

      if (isEditing) {
        await apiService.updateSupplierProduct(currentId, payload);
      } else {
        await apiService.createSupplierProduct(payload);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus produk ini?")) {
      try {
        await apiService.deleteSupplierProduct(id);
        fetchData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ ...initialForm, supplier_id: selectedSupplierId || "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      supplier_id: item.supplier_id,
      supplierProductID: item.supplierProductID,
      name: item.name,
      denom: item.denom,
      cost_price: item.cost_price,
      price: item.price,
      status: item.status ? "true" : "false",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-900 pb-20">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Supplier Products</h1>
        <p className="text-gray-500 mt-1">
          Pilih supplier di bawah untuk mengelola produknya.
        </p>
      </div>

      {/* === GRID SUPPLIER SELECTION === */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4 h-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Daftar Supplier
          </h2>

          {/* Tombol Reset Modern (Muncul persis di sebelah kanan judul) */}
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
                      ? "border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600"
                      : "border-gray-100 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1"
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm transition-transform ${
                    isActive ? "scale-110" : ""
                  } ${getAvatarColor(s.id)}`}
                >
                  {getInitials(s.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold truncate transition-colors ${
                      isActive ? "text-indigo-900" : "text-gray-700"
                    }`}
                  >
                    {s.name}
                  </h3>
                  <p
                    className={`text-xs font-mono truncate transition-colors ${
                      isActive ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {s.code}
                  </p>
                </div>

                {/* Checkmark Icon (Hanya muncul jika aktif) */}
                {isActive && (
                  <div className="absolute top-[-10px] right-[-10px] text-white bg-indigo-600 rounded-full p-1 shadow-md border-2 border-white scale-100 animate-in zoom-in duration-200">
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

      {/* === AREA TABEL PRODUK === */}
      {/* Header Tabel & Tombol Add */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {selectedSupplierId ? (
            <>
              <span>📦 Produk dari</span>
              <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">
                {suppliers.find((s) => s.id === selectedSupplierId)?.name}
              </span>
            </>
          ) : (
            "Daftar Produk"
          )}
        </h2>

        {/* Tombol Add (Hanya aktif jika Supplier sudah dipilih) */}
        <button
          onClick={handleOpenAdd}
          disabled={!selectedSupplierId}
          className={`px-6 py-2.5 rounded-lg shadow-lg font-medium flex items-center gap-2 transition-all ${
            selectedSupplierId
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>+</span> Tambah Product
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Product Name
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Ext. ID
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Denom
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Beli
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Jual
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : !selectedSupplierId ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        👆
                      </div>
                      <p className="font-medium">
                        Pilih salah satu supplier di atas untuk melihat
                        produknya.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center text-gray-400">
                    Belum ada produk untuk supplier ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-5 font-semibold text-gray-800">
                      {item.name}
                    </td>
                    <td className="p-5 font-mono text-xs text-gray-600 bg-gray-50 p-1 rounded w-fit">
                      {item.supplierProductID}
                    </td>
                    <td className="p-5 text-gray-600">
                      {new Intl.NumberFormat("id-ID").format(item.denom)}
                    </td>
                    <td className="p-5 text-red-600 font-medium">
                      {formatRupiah(item.cost_price)}
                    </td>
                    <td className="p-5 text-green-600 font-medium">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold border ${
                          item.status
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit Produk Supplier" : "Tambah Produk Supplier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <select
              className="w-full border p-2.5 rounded-lg bg-gray-100 text-gray-700 focus:outline-none cursor-not-allowed"
              required
              disabled // Selalu disabled karena sudah dipilih via grid
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Produk
              </label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                placeholder="Base Koin 1M"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Produk (Supplier)
              </label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                placeholder="Contoh: 6"
                value={formData.supplierProductID}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    supplierProductID: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Denom (Jumlah Koin/Item)
            </label>
            <input
              type="number"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              placeholder="1000000"
              value={formData.denom}
              onChange={(e) =>
                setFormData({ ...formData, denom: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Beli (Cost)
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                placeholder="1000"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harga Jual (Price)
              </label>
              <input
                type="number"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                placeholder="1200"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
            >
              {isEditing ? "Update Produk" : "Simpan Produk"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
