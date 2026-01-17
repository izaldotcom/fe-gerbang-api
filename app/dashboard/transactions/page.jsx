"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import { apiService } from "@/services/api";
import Modal from "@/app/components/Modal";
import { useUser } from "@/app/context/UserContext";

export default function TransactionPage() {
  const router = useRouter(); // 2. Init Router
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    destination: "",
    ref_id: "",
  });

  // State Modal Sukses
  const [successData, setSuccessData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // === 3. STATE MODAL ERROR WEBHOOK ===
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  // === HELPERS UI ===
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-600",
      "bg-violet-600",
      "bg-fuchsia-600",
      "bg-indigo-600",
      "bg-cyan-600",
      "bg-emerald-600",
    ];
    const index = id ? id.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // === INITIAL FETCH ===
  useEffect(() => {
    generateRefId();
    fetchData();
  }, []);

  const generateRefId = () => {
    const uniqueId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setFormData((prev) => ({ ...prev, ref_id: uniqueId }));
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [suppliersRes, productsRes] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getProducts(),
      ]);
      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = formData.supplier_id
    ? products.filter((p) => p.supplier_id === formData.supplier_id)
    : [];

  // === 4. MODIFIED HANDLER SELECT SUPPLIER ===
  const handleSelectSupplier = (id) => {
    // Validasi: Cek apakah user sudah login dan punya webhook_url
    // Jika user belum load, kita anggap aman dulu atau tunggu (tergantung UX),
    // tapi biasanya user context sudah ready di sini.

    if (user && !user.webhook_url) {
      setIsWebhookModalOpen(true); // Tampilkan Modal Error
      return; // Stop eksekusi, jangan pilih supplier
    }

    // Jika Webhook URL ada, lanjutkan logika normal
    setFormData((prev) => {
      if (prev.supplier_id === id) {
        return { ...prev, supplier_id: "", product_id: "" };
      }
      return { ...prev, supplier_id: id, product_id: "" };
    });
  };

  const handleResetSupplier = () => {
    setFormData((prev) => ({ ...prev, supplier_id: "", product_id: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id)
      return alert("Mohon pilih supplier terlebih dahulu.");

    if (!user.api_key) {
      return alert(
        "Data akun belum termuat sepenuhnya. Silakan refresh halaman.",
      );
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.createOrder(formData, user.api_key);

      setSuccessData(response);
      setIsSuccessModalOpen(true);

      setFormData((prev) => ({
        ...prev,
        product_id: "",
        destination: "",
      }));
    } catch (err) {
      alert(`Transaksi Gagal: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessData(null);
    generateRefId();
  };

  // Fungsi Redirect ke Account Settings
  const goToAccountSettings = () => {
    setIsWebhookModalOpen(false);
    router.push("/dashboard/account");
  };

  return (
    <div className="max-w-6xl mx-auto text-gray-900 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Buat Transaksi Baru
        </h1>
        <p className="text-gray-500 mt-1">
          Pilih supplier dan produk untuk memproses pesanan.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* === SECTION 1: PILIH SUPPLIER === */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4 h-8">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                Pilih Supplier
              </h2>
            </div>

            {formData.supplier_id && (
              <button
                type="button"
                onClick={handleResetSupplier}
                className="group flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 text-xs font-bold transition-all hover:bg-red-100 hover:pr-2 hover:shadow-sm animate-in fade-in slide-in-from-left-2 duration-300"
              >
                <span>Reset</span>
                <span className="bg-red-200 text-red-700 rounded-full w-4 h-4 flex items-center justify-center text-[10px] group-hover:bg-red-300 transition-colors">
                  ✕
                </span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              Sedang memuat supplier...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {suppliers.map((s) => {
                const isActive = formData.supplier_id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSupplier(s.id)}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group select-none
                      ${
                        isActive
                          ? "border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600 scale-[1.02]"
                          : "border-gray-100 bg-white hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-sm transition-transform ${
                        isActive ? "scale-110" : ""
                      } ${getAvatarColor(s.id)}`}
                    >
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold truncate transition-colors ${
                          isActive ? "text-blue-900" : "text-gray-700"
                        }`}
                      >
                        {s.name}
                      </h3>
                      <p
                        className={`text-xs font-mono truncate transition-colors ${
                          isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      >
                        {s.code}
                      </p>
                    </div>
                    {isActive && (
                      <div className="absolute top-[-10px] right-[-10px] text-white bg-blue-600 rounded-full p-1 shadow-md border-2 border-white animate-in zoom-in duration-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* === SECTION 2: DETAIL ORDER === */}
        <div
          className={`transition-all duration-500 ease-in-out ${
            formData.supplier_id
              ? "opacity-100 translate-y-0"
              : "opacity-40 translate-y-4 grayscale pointer-events-none filter blur-[1px]"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
              2
            </span>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Detail Pesanan
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* KOLOM KIRI */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pilih Produk
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      required
                      value={formData.product_id}
                      onChange={(e) =>
                        setFormData({ ...formData, product_id: e.target.value })
                      }
                      disabled={!formData.supplier_id}
                    >
                      <option value="">
                        -- Pilih Produk dari{" "}
                        {suppliers.find((s) => s.id === formData.supplier_id)
                          ?.name || "Supplier"}{" "}
                        --
                      </option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatRupiah(p.price)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  {formData.supplier_id && filteredProducts.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">
                      ⚠️ Supplier ini belum memiliki produk terdaftar.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ID Tujuan / Destination
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-300 font-mono"
                    placeholder="Contoh: 3145526"
                    required
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                  />
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3 h-3"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Masukkan ID Game atau Nomor HP Tujuan.
                  </p>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="flex flex-col justify-between space-y-6">
                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                  <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
                    Ref ID (Auto)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="w-full bg-white border-0 text-gray-600 text-sm font-mono p-2 rounded shadow-sm focus:ring-0 cursor-not-allowed select-all"
                      readOnly
                      value={formData.ref_id}
                    />
                    <button
                      type="button"
                      onClick={generateRefId}
                      className="p-2 bg-white text-blue-600 rounded shadow-sm hover:bg-blue-100 transition"
                      title="Generate ID Baru"
                    >
                      ↻
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.supplier_id ||
                    !formData.product_id
                  }
                  className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl transition-all transform flex items-center justify-center gap-2 ${
                    isSubmitting ||
                    !formData.supplier_id ||
                    !formData.product_id
                      ? "bg-gray-300 cursor-not-allowed shadow-none"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-1 shadow-blue-500/30"
                  }`}
                >
                  {isSubmitting ? "Memproses..." : "Kirim Pesanan Sekarang 🚀"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL SUKSES */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="🎉 Transaksi Berhasil!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
            ✓
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Pesanan Telah Diproses
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg text-left space-y-3 border border-gray-100 text-sm">
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">TRX ID</span>
              <span className="font-mono font-bold text-gray-800">
                {successData?.trx_id}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Produk</span>
              <span className="font-semibold text-gray-800 text-right">
                {successData?.product}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-gray-500">Status</span>
              <span className="font-bold text-green-600 uppercase bg-green-50 px-2 py-0.5 rounded border border-green-100">
                {successData?.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Qty Loop</span>
              <span className="font-semibold text-gray-800">
                {successData?.quantity_loop}
              </span>
            </div>
          </div>
          <button
            onClick={closeSuccessModal}
            className="w-full bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition font-medium mt-2 shadow-lg"
          >
            Tutup & Buat Baru
          </button>
        </div>
      </Modal>

      {/* === 5. MODAL ERROR WEBHOOK === */}
      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="⚠️ Webhook URL Diperlukan"
      >
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Webhook URL Belum Diatur
              </h3>
              <p className="text-sm text-gray-500">
                Anda harus mengatur <strong>Webhook URL</strong> di pengaturan
                akun terlebih dahulu sebelum dapat melakukan transaksi.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsWebhookModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Nanti Saja
            </button>
            <button
              onClick={goToAccountSettings}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-md transition"
            >
              Atur Webhook Sekarang →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
