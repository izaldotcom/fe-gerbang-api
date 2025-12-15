"use client";
import { useState } from "react";
import Modal from "../../components/Modal";

export default function UsersPage() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Admin Utama",
      email: "admin@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "John Doe",
      email: "john@gmail.com",
      role: "Customer",
      status: "Active",
    },
    {
      id: 3,
      name: "Siti Gudang",
      email: "staff@example.com",
      role: "Staff",
      status: "Inactive",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const initialForm = {
    name: "",
    email: "",
    role: "Customer",
    status: "Active",
  };
  const [formData, setFormData] = useState(initialForm);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Hapus user ini?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      setUsers(
        users.map((u) =>
          u.id === currentId ? { ...formData, id: currentId } : u
        )
      );
    } else {
      const newId = users.length ? users[users.length - 1].id + 1 : 1;
      setUsers([...users, { ...formData, id: newId }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500 mt-1">Kelola akses pengguna aplikasi.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
        >
          <span>+</span> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
              {users.map((item) => (
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
                    </div>
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        item.role === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : item.role === "Staff"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="p-5">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold w-fit ${
                        item.status === "Active"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.status === "Active"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      {item.status}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? "Edit User" : "Tambah User Baru"}
      >
        {/* PERBAIKAN DI SINI: class text-gray-900 ditambahkan */}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow"
            >
              Simpan
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
