"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { apiService } from "../../services/api";
import Modal from "@/app/components/Modal";

export default function RegisterPage() {
  const router = useRouter();

  const CUSTOMER_ROLE_ID = "f21f0237-6008-458e-82e2-e4e735567a00";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // === FUNGSI VALIDASI PASSWORD ===
  const validatePassword = (password) => {
    if (password.length < 8)
      return "Password terlalu pendek (Min. 8 karakter).";
    if (!/[A-Z]/.test(password))
      return "Password harus mengandung minimal 1 Huruf Besar (A-Z).";
    if (!/\d/.test(password))
      return "Password harus mengandung minimal 1 Angka (0-9).";
    if (!/[^A-Za-z0-9]/.test(password))
      return "Password harus mengandung minimal 1 Simbol (!@#$%).";
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 13) {
        setFormData({ ...formData, [name]: numericValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const passwordError = validatePassword(formData.password);
      if (passwordError) throw new Error(passwordError);

      const payload = {
        role_id: CUSTOMER_ROLE_ID,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      await apiService.register(payload);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setErrorMsg(err.message || "Gagal melakukan registrasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    // Opsional: Redirect ke home atau login setelah modal ditutup via 'X'
    router.push("/login");
  };

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
      {/* SIDEBAR */}
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

      {/* FORM AREA */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 relative z-10">
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

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-in fade-in flex items-start gap-2">
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
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
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nomor WhatsApp / HP
              </label>
              <div className="relative">
                <input
                  name="phone"
                  type="tel"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-xs text-gray-400">
                  {formData.phone.length}/13
                </div>
              </div>
            </div>
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
              <div className="mt-2 text-xs text-gray-500 grid grid-cols-2 gap-1">
                <span
                  className={
                    formData.password.length >= 8
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  • Min. 8 Karakter
                </span>
                <span
                  className={
                    /[A-Z]/.test(formData.password)
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  • 1 Huruf Besar
                </span>
                <span
                  className={
                    /\d/.test(formData.password)
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  • 1 Angka
                </span>
                <span
                  className={
                    /[^A-Za-z0-9]/.test(formData.password)
                      ? "text-green-600 font-bold"
                      : ""
                  }
                >
                  • 1 Simbol
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 mt-6 border border-transparent text-base font-bold rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

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
        </div>
      </div>

      {/* === MODAL SUKSES (DIUPDATE) === */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        title="🎉 Pendaftaran Berhasil!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm animate-in zoom-in duration-300">
            ✓
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Akun Anda Telah Dibuat
            </h3>
            {/* TEXT DIUPDATE */}
            <p className="text-gray-500 text-sm mt-2">
              Terima kasih telah bergabung. Akun anda sedang diverifikasi oleh
              sistem kami, mohon tunggu maksimal 2 jam.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-left">
            <div className="flex justify-between py-1 border-b border-blue-100">
              <span className="text-gray-500">Nama</span>
              <span className="font-semibold text-gray-800">
                {formData.name}
              </span>
            </div>
            <div className="flex justify-between py-1 pt-2">
              <span className="text-gray-500">Email</span>
              <span className="font-semibold text-gray-800">
                {formData.email}
              </span>
            </div>
          </div>

          {/* BUTTON DIHAPUS, AREA INI KOSONG */}
        </div>
      </Modal>
    </div>
  );
}
