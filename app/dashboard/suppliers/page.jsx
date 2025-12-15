"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Sesuaikan initial form dengan field API (name, code, type, status)
  const initialForm = { name: "", code: "", type: "official", status: "true" };
  const [formData, setFormData] = useState(initialForm);

  // === FETCH DATA ===
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSuppliers();
      // Data ada di dalam object 'data': { data: [...] }
      setSuppliers(response.data || []);
    } catch (err) {
      console.error("Gagal ambil data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // === SUBMIT (CREATE / UPDATE) ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Konversi status dari string "true"/"false" ke Boolean sebelum kirim ke API
      const payload = {
        ...formData,
        status: formData.status === "true" || formData.status === true,
      };

      if (isEditing) {
        await apiService.updateSupplier(currentId, payload);
      } else {
        await apiService.createSupplier(payload);
      }

      setIsModalOpen(false);
      fetchSuppliers(); // Refresh table
    } catch (err) {
      alert(`Gagal menyimpan: ${err.message}`);
    }
  };

  // === DELETE ===
  const handleDelete = async (id) => {
    if (confirm("Yakin ingin menghapus supplier ini?")) {
      try {
        await apiService.deleteSupplier(id);
        fetchSuppliers();
      } catch (err) {
        alert(`Gagal menghapus: ${err.message}`);
      }
    }
  };

  // === HANDLER UI ===
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    // Masukkan data ke form, pastikan status dikonversi ke string untuk Select option
    setFormData({
      name: item.name,
      code: item.code,
      type: item.type,
      status: item.status ? "true" : "false", // Konversi bool ke string agar dropdown terbaca
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
          <p className="text-gray-500 mt-1">Daftar mitra dan kode supplier.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah Supplier
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Supplier
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Kode
                </th>
                <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Tipe
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
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Belum ada data.
                  </td>
                </tr>
              ) : (
                suppliers.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/80 transition-colors"
                  >
                    <td className="p-5 font-semibold text-gray-800">
                      {item.name}
                    </td>
                    <td className="p-5">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                        {item.code}
                      </span>
                    </td>
                    <td className="p-5 text-gray-600 capitalize">
                      {item.type}
                    </td>
                    <td className="p-5">
                      {/* Render Badge berdasarkan Boolean true/false */}
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
                    <td className="p-5 text-right space-x-3">
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
        title={isEditing ? "Edit Supplier" : "Tambah Supplier"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
          {/* Input NAME */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Supplier
            </label>
            <input
              type="text"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Contoh: Mitra Higgs Official"
            />
          </div>

          {/* Input CODE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kode Supplier
            </label>
            <input
              type="text"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              placeholder="Contoh: MH_OFFICIAL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input TYPE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe
              </label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                placeholder="official"
              />
            </div>

            {/* Select STATUS */}
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
              {isEditing ? "Update Data" : "Simpan Data"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
