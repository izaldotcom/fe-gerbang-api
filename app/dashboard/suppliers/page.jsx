"use client";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk Notifikasi & Loading Check Connection
  const [isChecking, setIsChecking] = useState(null); // Menyimpan ID supplier yang sedang dicek
  const [notification, setNotification] = useState(null);

  // State Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Initial form disesuaikan dengan penambahan username dan password
  const initialForm = {
    name: "",
    code: "",
    type: "official",
    username: "",
    password: "",
    status: "true",
  };
  const [formData, setFormData] = useState(initialForm);

  // === FETCH DATA ===
  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getSuppliers();
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

  // === CHECK CONNECTION ===
  const handleCheckConnection = async (id) => {
    setIsChecking(id);
    setNotification(null); // Reset notifikasi
    try {
      // Panggil API untuk ngecek koneksi, hanya lempar supplier_id (sesuai update backend kita)
      const res = await apiService.checkSupplierConnection({ supplier_id: id });

      // Jika berhasil
      setNotification({
        type: "success",
        message: res.message || "Berhasil! Supplier terkoneksi.",
      });
    } catch (err) {
      // Jika gagal
      setNotification({
        type: "error",
        message: `Koneksi gagal: ${err.message}`,
      });
    } finally {
      setIsChecking(null);
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
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
    setFormData({
      name: item.name || "",
      code: item.code || "",
      type: item.type || "official",
      username: item.username || "", // Isi otomatis jika ada
      password: item.password || "", // Isi otomatis jika ada
      status: item.status ? "true" : "false",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900 relative">
      {/* --- NOTIFIKASI TOAST (Absolute Top) --- */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-3 transition-all ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          {notification.type === "success" ? (
            <span className="text-xl">✅</span>
          ) : (
            <span className="text-xl">⚠️</span>
          )}
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

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
                      {/* Tombol Check Connection */}
                      <button
                        onClick={() => handleCheckConnection(item.id)}
                        disabled={isChecking === item.id}
                        className={`font-medium text-sm border px-3 py-1.5 rounded-md transition-all ${
                          isChecking === item.id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-600 hover:text-white"
                        }`}
                      >
                        {isChecking === item.id ? "Memeriksa..." : "Check"}
                      </button>

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
          {/* Input NAME & CODE (Samping-sampingan agar hemat ruang) */}
          <div className="grid grid-cols-2 gap-4">
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
          </div>

          {/* === [BARU] Input USERNAME & PASSWORD === */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username Akun
              </label>
              <input
                type="text"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Masukkan ID/Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Akun
              </label>
              <input
                type="password"
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Masukkan Password"
              />
            </div>
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
