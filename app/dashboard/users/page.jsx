"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import Modal from "@/app/components/Modal"; // Menggunakan komponen Modal yang sudah ada

export default function UsersPage() {
  // === STATE DATA ===
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // === STATE MODAL EDIT/ADD ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Customer",
    status: "Active",
  });
  const [currentId, setCurrentId] = useState(null);

  // === STATE MENU DROPDOWN (FIXED POSITION) ===
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // === STATE MODAL APPROVE & SUKSES ===
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // State baru untuk modal sukses
  const [userToApprove, setUserToApprove] = useState(null);
  const [isApproving, setIsApproving] = useState(false);

  // 1. FETCH DATA USER
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error("Gagal memuat user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. LOGIC MENU FLOATING
  const handleToggleMenu = (e, userId) => {
    e.stopPropagation();
    if (menuOpenId === userId) {
      setMenuOpenId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.left - 120,
      });
      setMenuOpenId(userId);
    }
  };

  useEffect(() => {
    const closeMenu = () => setMenuOpenId(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
    };
  }, []);

  // === 3. HANDLERS APPROVE ===

  // A. Buka Modal Konfirmasi
  const handleOpenApproveModal = (user) => {
    setMenuOpenId(null);
    setUserToApprove(user);
    setIsApproveModalOpen(true);
  };

  // B. Eksekusi Approve ke API
  const handleConfirmApprove = async () => {
    if (!userToApprove) return;

    setIsApproving(true);
    try {
      await apiService.verifyUser({
        user_id: userToApprove.id,
        action: "approve",
      });

      // Refresh Data
      fetchUsers();

      // Tutup Modal Konfirmasi & Buka Modal Sukses
      setIsApproveModalOpen(false);
      setIsSuccessModalOpen(true); // <--- Ganti Alert dengan ini
    } catch (err) {
      alert(`Gagal approve: ${err.message}`); // Error tetap alert atau bisa diganti toast
    } finally {
      setIsApproving(false);
    }
  };

  // C. Tutup Modal Sukses & Reset State
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setUserToApprove(null);
  };

  // === 4. HANDLERS CRUD LAINNYA ===
  const handleOpenEdit = (item) => {
    setMenuOpenId(null);
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData({
      name: item.name,
      email: item.email,
      role: item.role_name || item.role,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setMenuOpenId(null);
    if (confirm("Hapus user ini selamanya?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Simpan data simulasi (API belum terpasang)");
    setIsModalOpen(false);
  };

  // Helper Badge
  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    let style = "bg-gray-50 text-gray-700 border-gray-200";
    let dot = "bg-gray-500";

    if (s === "active") {
      style = "bg-green-50 text-green-700 border-green-200";
      dot = "bg-green-500";
    } else if (s === "inactive" || s === "blocked") {
      style = "bg-red-50 text-red-700 border-red-200";
      dot = "bg-red-500";
    } else if (s === "register" || s === "pending") {
      style = "bg-yellow-50 text-yellow-700 border-yellow-200";
      dot = "bg-yellow-500";
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold w-fit border ${style} inline-flex items-center gap-2`}
      >
        <span className={`w-2 h-2 rounded-full ${dot}`}></span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto text-gray-900 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Users</h1>
          <p className="text-gray-500 mt-1">
            Kelola akses dan verifikasi pendaftaran pengguna.
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setFormData({
              name: "",
              email: "",
              role: "Customer",
              status: "Active",
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 transition-all font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah User
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-10 text-center text-gray-500">
            Memuat data pengguna...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="p-5 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Role
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
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-gray-400">
                      Belum ada data user.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800">
                            {item.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.email}
                          </span>
                          <span className="text-xs text-gray-400 font-mono mt-1">
                            {item.phone}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-3 py-1 rounded-full text-xs font-bold border bg-blue-50 text-blue-700 border-blue-200">
                          {item.role_name || item.role || "User"}
                        </span>
                      </td>
                      <td className="p-5">{getStatusBadge(item.status)}</td>
                      <td className="p-5 text-right relative">
                        <button
                          onClick={(e) => handleToggleMenu(e, item.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* === FLOATING MENU === */}
      {menuOpenId && (
        <div
          className="fixed z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {users.find((u) => u.id === menuOpenId)?.status?.toLowerCase() ===
            "register" && (
            <button
              onClick={() =>
                handleOpenApproveModal(users.find((u) => u.id === menuOpenId))
              }
              className="w-full text-left px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 font-medium flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Approve
            </button>
          )}

          <button
            onClick={() =>
              handleOpenEdit(users.find((u) => u.id === menuOpenId))
            }
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 text-gray-400"
            >
              <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
            </svg>
            Edit Data
          </button>

          <button
            onClick={() => handleDelete(menuOpenId)}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z"
                clipRule="evenodd"
              />
            </svg>
            Hapus User
          </button>
        </div>
      )}

      {/* === MODAL 1: EDIT / TAMBAH USER === */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit User" : "Tambah User Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-gray-900">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="Customer">Customer</option>
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="register">Register</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium border border-gray-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>

      {/* === MODAL 2: KONFIRMASI APPROVE === */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Konfirmasi Persetujuan"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-gray-900">
            Setujui Akun Pengguna?
          </h3>
          <p className="text-gray-500 text-sm mt-2">
            Anda akan mengaktifkan akun untuk <b>{userToApprove?.name}</b>.
            Pengguna akan dapat login dan melakukan transaksi setelah ini.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              disabled={isApproving}
            >
              Batal
            </button>
            <button
              onClick={handleConfirmApprove}
              disabled={isApproving}
              className="py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg transition flex justify-center items-center gap-2"
            >
              {isApproving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Ya, Setujui"
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* === MODAL 3: SUKSES APPROVE (PENGGANTI ALERT) === */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="Berhasil"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm animate-in zoom-in duration-300">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              User Berhasil Disetujui!
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Akun pengguna <b>{userToApprove?.name}</b> telah aktif dan siap
              digunakan.
            </p>
          </div>
          <button
            onClick={handleCloseSuccessModal}
            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-bold shadow-lg mt-2"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </div>
  );
}
