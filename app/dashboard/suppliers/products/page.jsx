"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function SupplierProductsPage() {
  // State Data Utama
  const [dataList, setDataList] = useState([]); // List Supplier Product
  const [suppliers, setSuppliers] = useState([]); // List Supplier (untuk Dropdown)
  const [isLoading, setIsLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Initial Form State sesuai JSON Backend
  const initialForm = {
    supplier_id: "",
    supplierProductID: "",
    name: "",
    denom: "",
    cost_price: "",
    price: "",
    status: "true", // Default string untuk select option
  };
  const [formData, setFormData] = useState(initialForm);

  // Helper Format Rupiah
  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // === 1. FETCH DATA (Load Products & Suppliers sekaligus) ===
  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Kita butuh 2 data: List Product & List Supplier (untuk dropdown)
      const [productsRes, suppliersRes] = await Promise.all([
        apiService.getSupplierProducts(),
        apiService.getSuppliers(),
      ]);

      setDataList(productsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === 2. SUBMIT HANDLER (Create / Update) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Siapkan payload, pastikan tipe data angka dikonversi dengan benar
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
      fetchData(); // Refresh data
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  // === 3. DELETE HANDLER ===
  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus produk supplier ini?")) {
      try {
        await apiService.deleteSupplierProduct(id);
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
    <div className="max-w-7xl mx-auto text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Supplier Products
          </h1>
          <p className="text-gray-500 mt-1">
            Kelola produk yang disediakan oleh supplier.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah Product
        </button>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Ext. ID
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Denom
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Harga Jual
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
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : dataList.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-400">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                dataList.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Nama Produk */}
                    <td className="p-5 font-semibold text-gray-800">
                      {item.name}
                    </td>

                    {/* Info Supplier (Nested Object) */}
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          {item.Supplier?.name || "-"}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {item.Supplier?.code || "-"}
                        </span>
                      </div>
                    </td>

                    {/* ID dari Supplier */}
                    <td className="p-5 font-mono text-xs text-gray-600 bg-gray-50 p-1 rounded w-fit">
                      {item.supplierProductID}
                    </td>

                    {/* Denom */}
                    <td className="p-5 text-gray-600">
                      {new Intl.NumberFormat("id-ID").format(item.denom)}
                    </td>

                    {/* Harga Beli */}
                    <td className="p-5 text-red-600 font-medium">
                      {formatRupiah(item.cost_price)}
                    </td>

                    {/* Harga Jual */}
                    <td className="p-5 text-green-600 font-medium">
                      {formatRupiah(item.price)}
                    </td>

                    {/* Status */}
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

                    {/* Aksi */}
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
          {/* Pilih Supplier (Dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pilih Supplier
            </label>
            <select
              className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
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

          {/* Nama Produk & External ID */}
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

          {/* Denom */}
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

          {/* Harga Beli & Harga Jual */}
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

          {/* Status */}
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

          {/* Buttons */}
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
