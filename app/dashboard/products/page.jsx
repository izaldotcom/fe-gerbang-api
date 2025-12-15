"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal"; // Menggunakan Alias
import { apiService } from "@/services/api"; // Menggunakan Alias

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Initial Form menyesuaikan field baru (denom, qty, status)
  const initialForm = {
    name: "",
    denom: "",
    price: "",
    qty: "",
    status: "true",
  };
  const [formData, setFormData] = useState(initialForm);

  // Helper Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  // Helper Format Angka (untuk Denom)
  const formatNumber = (number) => {
    return new Intl.NumberFormat("id-ID").format(number);
  };

  // === FETCH DATA ===
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getProducts();
      // Data berada di dalam properti 'data'
      setProducts(response.data || []);
    } catch (err) {
      console.error("Gagal ambil produk:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // === SUBMIT HANDLER (CREATE / UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Pastikan tipe data sesuai (Number & Boolean)
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
        await apiService.createProduct(payload);
      }

      setIsModalOpen(false);
      fetchProducts(); // Refresh Tabel
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  // === DELETE HANDLER ===
  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      try {
        await apiService.deleteProduct(id);
        fetchProducts();
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
      qty: item.qty, // Mapping dari qty
      status: item.status ? "true" : "false", // Convert boolean ke string untuk select
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-900">
      {/* Header Halaman */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 mt-1">
            Kelola data produk utama (koin emas).
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah Produk
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Memuat data produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Belum ada data produk.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors duration-150"
                  >
                    <td className="p-5 font-semibold text-gray-800">
                      {item.name}
                    </td>

                    {/* Kolom Denom */}
                    <td className="p-5 text-gray-600 font-mono text-sm">
                      {formatNumber(item.denom)}
                    </td>

                    {/* Kolom Harga */}
                    <td className="p-5 text-blue-600 font-medium">
                      {formatRupiah(item.price)}
                    </td>

                    {/* Kolom Qty */}
                    <td className="p-5 text-gray-700">
                      {formatNumber(item.qty)}
                    </td>

                    {/* Kolom Status */}
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

                    {/* Kolom Aksi */}
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
        title={isEditing ? "Edit Produk" : "Tambah Produk Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
          {/* Input Name */}
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
            {/* Input Denom */}
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

            {/* Input Qty */}
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

          {/* Input Price */}
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

          {/* Select Status */}
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

          {/* Tombol Aksi */}
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
