"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Cookies from "js-cookie";
import { apiService } from "../../services/api";

export default function LoginPage() {
  const router = useRouter();

  // State UI
  const [selectedRole, setSelectedRole] = useState(null); // 'admin' | 'user' | null

  // State Form
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let payload = { password };

      if (loginInput.includes("@")) {
        payload.email = loginInput;
      } else {
        payload.identifier = loginInput;
      }

      const data = await apiService.login(payload);

      Cookies.set("token", data.access_token, { expires: 1 });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 });

      // === PERUBAHAN DI SINI ===
      // Baik Admin maupun Customer diarahkan ke Dashboard utama
      // Layout Dashboard akan otomatis memfilter menu sesuai role
      router.push("/dashboard");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Komponen Logo
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
      {/* SIDEBAR KIRI (DESKTOP) */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <LogoGerbangAPI textClass="text-white" />
          <div className="mt-16 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Satu Gerbang Untuk Semua Koneksi.
            </h2>
            <p className="mt-4 text-blue-200 text-lg leading-relaxed">
              Platform manajemen terintegrasi untuk Admin dan Pelanggan. Aman,
              Cepat, dan Andal.
            </p>
          </div>
        </div>
        <div className="relative z-10 text-sm text-blue-300">
          © 2025 PT Gerbang Teknologi Indonesia.
        </div>
      </div>

      {/* AREA KANAN (FORM/GRID) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
        {/* TOMBOL KEMBALI KE HOMEPAGE */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
          <Link
            href="/"
            className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </div>
            <span className="hidden sm:inline">Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10 transition-all duration-300">
          <div className="lg:hidden flex justify-center mb-6 mt-4">
            <LogoGerbangAPI />
          </div>

          {!selectedRole ? (
            // GRID PILIHAN ROLE
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pilih Akses Masuk
                </h2>
                <p className="text-gray-500 text-sm mt-2">
                  Silakan pilih peran Anda untuk melanjutkan.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedRole("admin")}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-700">
                    Administrator
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Kelola sistem & data
                  </p>
                </button>

                <button
                  onClick={() => setSelectedRole("user")}
                  className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all group"
                >
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-8 h-8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-green-700">
                    Customer
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Transaksi & pembelian
                  </p>
                </button>
              </div>
            </div>
          ) : (
            // FORM LOGIN
            <div className="animate-in slide-in-from-right-4 duration-300">
              <button
                onClick={() => {
                  setSelectedRole(null);
                  setErrorMsg("");
                  setPassword("");
                }}
                className="flex items-center text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                  />
                </svg>
                Ganti Peran
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">
                  Login{" "}
                  {selectedRole === "admin" ? "Administrator" : "Customer"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Masukkan kredensial akun {selectedRole} Anda.
                </p>
              </div>

              {errorMsg && (
                <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm mb-6">
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 flex-shrink-0"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-medium">Gagal:</span> {errorMsg}
                  </div>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email atau Nomor HP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.25 1.25 0 00.41 1.412A9.973 9.973 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all sm:text-sm bg-gray-50 focus:bg-white"
                      placeholder={
                        selectedRole === "admin"
                          ? "admin@gerbangapi.com"
                          : "08123456789"
                      }
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      required
                      className="block w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all sm:text-sm bg-gray-50 focus:bg-white"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-3.5 px-4 border border-transparent text-base font-bold rounded-xl text-white transition-all duration-200 focus:outline-none shadow-lg hover:-translate-y-0.5 
                    ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : selectedRole === "admin"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
                        : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-green-500/30"
                    }`}
                >
                  {loading ? "Memproses..." : "Masuk Sekarang"}
                </button>
              </form>
            </div>
          )}

          <div className="lg:hidden mt-8 text-center text-xs text-gray-400">
            &copy; 2025 Gerbang API.
          </div>
        </div>
      </div>
    </div>
  );
}
