"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Cookies from "js-cookie"; // Import js-cookie
import { apiService } from "../services/api";

export default function LoginPage() {
  const router = useRouter();

  // State untuk form & loading
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Reset error sebelumnya

    try {
      // PANGGILAN API JADI SANGAT SEDERHANA:
      const data = await apiService.login({
        email: email,
        password: password,
      });

      // Simpan token
      Cookies.set("token", data.access_token, { expires: 1 });
      Cookies.set("refresh_token", data.refresh_token, { expires: 7 });

      router.push("/dashboard/products");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header Login */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Silakan masuk untuk mengelola data
          </p>
        </div>

        {/* Alert Error (Muncul jika login gagal) */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="admin@gerbangapi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Tombol Login */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-200 
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg"
              }`}
          >
            {loading ? "Memproses..." : "Masuk ke Dashboard"}
          </button>
        </form>

        {/* Footer Kecil */}
        <div className="mt-8 text-center text-xs text-gray-400">
          &copy; 2025 Admin Dashboard Template
        </div>
      </div>
    </div>
  );
}
