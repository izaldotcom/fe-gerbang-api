"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { apiService } from "../../services/api";

export default function RegisterPage() {
  const router = useRouter();

  // Konfigurasi Fixed untuk Customer
  const CUSTOMER_ROLE_ID = "f21f0237-6008-458e-82e2-e4e735567a00";

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // Susun Payload sesuai spesifikasi
      const payload = {
        role_id: CUSTOMER_ROLE_ID, // Fixed Customer
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: "active", // Fixed Active
        password: formData.password,
      };

      await apiService.register(payload);

      // Jika sukses
      alert("Registrasi Berhasil! Silakan login.");
      router.push("/login");
    } catch (err) {
      setErrorMsg(err.message || "Gagal melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  // Komponen Logo (Reusable)
  const LogoGerbangAPI = ({ className = "", textClass = "text-gray-900" }) => (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
          />
        </svg>
      </div>
      <span className={`text-2xl font-extrabold tracking-tight ${textClass}`}>
        Gerbang API
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-hidden">
      {/* === SIDEBAR KIRI (BRANDING) === */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <LogoGerbangAPI textClass="text-white" />
          <div className="mt-16 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Bergabunglah Bersama Kami.
            </h2>
            <p className="mt-4 text-blue-200 text-lg leading-relaxed">
              Daftarkan diri Anda untuk mulai bertransaksi dan menikmati layanan
              terbaik dari Gerbang API.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-blue-300">
          © 2025 PT Gerbang Teknologi Indonesia.
        </div>
      </div>

      {/* === AREA FORM REGISTER (KANAN) === */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
          {/* Header Mobile */}
          <div className="lg:hidden flex justify-center mb-6">
            <LogoGerbangAPI />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Buat Akun Baru
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Isi data diri Anda untuk mendaftar sebagai Customer.
            </p>
          </div>

          {/* Alert Error */}
          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="font-bold">Gagal:</span> {errorMsg}
              </div>
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <input
                name="name"
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                placeholder="Contoh: Izal Dotcom"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Alamat Email
              </label>
              <input
                name="email"
                type="email"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                placeholder="email@anda.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* No HP */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nomor WhatsApp / HP
              </label>
              <input
                name="phone"
                type="text"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 mt-6 border border-transparent text-base font-bold rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 
                ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                }`}
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          {/* Link ke Login */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-500 hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </div>

          <div className="lg:hidden mt-8 text-center text-xs text-gray-400">
            &copy; 2025 Gerbang API.
          </div>
        </div>
      </div>
    </div>
  );
}
