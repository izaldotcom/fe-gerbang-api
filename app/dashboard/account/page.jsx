"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { useUser } from "@/app/context/UserContext";

export default function AccountSettingsPage() {
  // 1. Ambil state 'loading' dari context (beri nama alias 'contextLoading' agar tidak bentrok)
  const { user, loading: contextLoading } = useUser();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State Data User
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    apiKey: "",
    webhook_url: "",
  });

  // Fetch Data Profil
  useEffect(() => {
    // 2. Cegah fetch berjalan jika Context masih loading atau User belum ada
    if (contextLoading) return;

    // Jika context sudah selesai load tapi user null (misal token expired), stop.
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);

        // 3. Gunakan user.api_key dengan aman (atau string kosong jika belum ada)
        // Kita asumsikan endpoint ini juga bisa jalan hanya dengan Token (Cookies)
        const res = await apiService.getSellerProfile(user.api_key || "");

        if (res.data) {
          setFormData({
            name: res.data.name || "",
            email: res.data.email || "",
            phone: res.data.phone || "",
            role: res.data.role_name || "Seller",
            apiKey: res.data.api_key || "",
            webhook_url: res.data.webhook_url || "",
          });
        }
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // 4. Tambahkan dependency array agar effect jalan ulang saat user/context siap
  }, [user, contextLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Simulasi Save
    setTimeout(() => {
      setIsSaving(false);
      alert("Profil berhasil diperbarui!");
    }, 1000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("API Key disalin!");
  };

  // 5. Tampilkan loading jika Local Loading ATAU Context Loading masih jalan
  if (loading || contextLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Jika user tidak ditemukan setelah loading selesai (opsional handling)
  if (!user) {
    return (
      <div className="text-center mt-10">
        User tidak ditemukan. Silakan login ulang.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Akun</h1>
        <p className="text-gray-500 text-sm mt-1">
          Kelola informasi profil dan keamanan akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* KIRI: KARTU PROFIL */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="relative z-10 -mt-2 mb-3">
              <div className="w-24 h-24 mx-auto rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-600">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-800">{formData.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{formData.email}</p>

            <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              {formData.role}
            </div>
          </div>
        </div>

        {/* KANAN: FORM EDIT */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Informasi Dasar</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Input Webhook URL */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Webhook URL{" "}
                  <span className="text-xs font-normal text-gray-400">
                    (Opsional)
                  </span>
                </label>
                <input
                  type="url"
                  name="webhook_url"
                  value={formData.webhook_url}
                  onChange={handleChange}
                  placeholder="https://domain-anda.com/callback"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 font-medium font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  URL ini akan digunakan untuk menerima notifikasi status
                  transaksi secara realtime.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email (Read-only)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed font-medium"
                />
              </div>

              {/* API Key Section */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                  API Key Anda
                </label>
                <div className="flex gap-2">
                  <code className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono text-slate-800 break-all font-medium">
                    {formData.apiKey}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(formData.apiKey)}
                    className="p-2 bg-white border border-slate-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition text-slate-600"
                    title="Salin API Key"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  API Key ini bersifat rahasia. Gunakan untuk integrasi sistem.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 ${isSaving ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
