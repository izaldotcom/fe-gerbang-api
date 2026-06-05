"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/services/api";
import Modal from "@/app/components/Modal";
import { useUser } from "@/app/context/UserContext";

export default function TransactionPage() {
  const router = useRouter();
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplier_id: "",
    product_id: "",
    destination: "",
    payment_type_id: "",
    ref_id: "",
  });

  const [successData, setSuccessData] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

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
      const [suppliersRes, productsRes, paymentTypesRes] = await Promise.all([
        apiService.getSuppliers(),
        apiService.getProducts(),
        apiService.getPaymentTypes(),
      ]);
      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
      setPaymentTypes(paymentTypesRes.data || []);
    } catch (err) {
      console.error("Gagal memuat data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = formData.supplier_id
    ? products.filter((p) => p.supplier_id === formData.supplier_id)
    : [];

  const selectedSupplier = suppliers.find((s) => s.id === formData.supplier_id);
  const isDigiflazz = selectedSupplier?.code === "DIGIFLAZZ_OFFICIAL";

  const currentBalance = user?.balance || 0;
  const selectedProduct = products.find((p) => p.id === formData.product_id);
  const selectedProductPrice = selectedProduct
    ? Number(selectedProduct.price)
    : 0;
  const isBalanceSufficient = currentBalance >= selectedProductPrice;

  const handleSelectSupplier = (id) => {
    if (user && !user.webhook_url) {
      setIsWebhookModalOpen(true);
      return;
    }

    setFormData((prev) => {
      if (prev.supplier_id === id) {
        return {
          ...prev,
          supplier_id: "",
          product_id: "",
          payment_type_id: "",
        };
      }
      return { ...prev, supplier_id: id, product_id: "", payment_type_id: "" };
    });
  };

  const handleResetSupplier = () => {
    setFormData((prev) => ({
      ...prev,
      supplier_id: "",
      product_id: "",
      payment_type_id: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id)
      return alert("Mohon pilih supplier terlebih dahulu.");
    if (!isDigiflazz && !formData.payment_type_id)
      return alert("Mohon pilih metode pembayaran.");
    if (!user.api_key)
      return alert(
        "Data akun belum termuat sepenuhnya. Silakan refresh halaman.",
      );
    if (!isBalanceSufficient)
      return alert("Saldo Anda tidak mencukupi untuk transaksi ini.");

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        payment_type_id: isDigiflazz ? "" : formData.payment_type_id,
      };

      const response = await apiService.createOrder(payload, user.api_key);
      setSuccessData(response);
      setIsSuccessModalOpen(true);

      if (user) {
        user.balance -= selectedProductPrice;
      }

      setFormData((prev) => ({
        ...prev,
        product_id: "",
        destination: "",
        payment_type_id: "",
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

  const isFormValid =
    formData.supplier_id &&
    formData.product_id &&
    formData.destination &&
    (isDigiflazz || formData.payment_type_id) &&
    isBalanceSufficient;

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">
            Buat Transaksi Baru
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Pilih supplier dan produk untuk memproses pesanan Anda.
          </p>
        </div>

        {/* SALDO BADGE (MODERN) */}
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            💳
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Saldo Tersedia
            </span>
            <span className="text-lg font-black text-slate-800 tracking-tight leading-none mt-0.5">
              {formatRupiah(currentBalance)}
            </span>
          </div>
          <Link
            href="/dashboard/topup"
            className="ml-2 w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-lg transition-colors border border-slate-100"
          >
            +
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: PILIH SUPPLIER */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold shadow-inner">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Pilih Supplier
              </h2>
            </div>
            {formData.supplier_id && (
              <button
                type="button"
                onClick={handleResetSupplier}
                className="text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                Reset Pilihan ✕
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="py-12 text-center">
              <span className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin inline-block mb-3"></span>
              <p className="text-sm font-medium text-slate-400">
                Memuat data supplier...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {suppliers.map((s) => {
                const isActive = formData.supplier_id === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => handleSelectSupplier(s.id)}
                    className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group overflow-hidden
                      ${isActive ? "border-indigo-600 bg-indigo-50/40" : "border-slate-100 bg-white hover:border-slate-300"}`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none"></div>
                    )}

                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-inner transition-transform group-hover:scale-105 ${isActive ? "bg-indigo-600" : "bg-slate-800"}`}
                    >
                      {getInitials(s.name)}
                    </div>
                    <div className="flex-1 min-w-0 relative z-10">
                      <h3
                        className={`font-bold truncate text-sm transition-colors ${isActive ? "text-indigo-900" : "text-slate-700"}`}
                      >
                        {s.name}
                      </h3>
                      <p
                        className={`text-[10px] font-mono truncate font-semibold uppercase tracking-wider mt-0.5 ${isActive ? "text-indigo-500" : "text-slate-400"}`}
                      >
                        {s.code}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isActive ? "border-indigo-600 bg-indigo-600" : "border-slate-200"}`}
                    >
                      {isActive && (
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: DETAIL ORDER */}
        <div
          className={`transition-all duration-500 ease-in-out ${formData.supplier_id ? "opacity-100 translate-y-0" : "opacity-40 translate-y-4 grayscale pointer-events-none filter blur-[2px]"}`}
        >
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-bold shadow-inner">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                Detail Pesanan
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              {/* KOLOM KIRI (INPUT FORM) */}
              <div className="lg:col-span-3 space-y-6">
                {/* Field Produk */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Pilih Produk
                  </label>
                  <div className="relative">
                    <select
                      className="w-full pl-5 pr-12 py-4 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-slate-800 font-semibold outline-none transition-all appearance-none"
                      required
                      value={formData.product_id}
                      onChange={(e) =>
                        setFormData({ ...formData, product_id: e.target.value })
                      }
                      disabled={!formData.supplier_id}
                    >
                      <option value="" className="text-slate-400">
                        -- Ketuk untuk memilih produk --
                      </option>
                      {filteredProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {formatRupiah(p.price)}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
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
                </div>

                {/* Field Tujuan */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    ID Tujuan / Destination
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-slate-800 font-mono font-bold text-lg outline-none transition-all placeholder:font-sans placeholder:text-base placeholder:text-slate-300 placeholder:font-normal"
                    placeholder="Contoh: 3145526"
                    required
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                  />
                  <p className="text-[11px] font-medium text-slate-400 mt-2 flex items-center gap-1.5 pl-1">
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>{" "}
                    Masukkan ID Game atau Nomor HP Tujuan dengan benar.
                  </p>
                </div>

                {/* Field Metode Pembayaran */}
                {!isDigiflazz && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Metode Pembayaran
                    </label>
                    <div className="relative">
                      <select
                        className="w-full pl-5 pr-12 py-4 rounded-2xl border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-slate-800 font-semibold outline-none transition-all appearance-none"
                        required={!isDigiflazz}
                        value={formData.payment_type_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            payment_type_id: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Pilih Metode --</option>
                        {paymentTypes.map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-5 pointer-events-none text-slate-400">
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
                  </div>
                )}
              </div>

              {/* KOLOM KANAN (HARGA & AKSI) */}
              <div className="lg:col-span-2 flex flex-col space-y-4">
                {/* Ref ID Badge */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Ref ID (Auto)
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {formData.ref_id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={generateRefId}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                  >
                    ↻
                  </button>
                </div>

                {/* PREMIUM HARGA CARD */}
                <div
                  className={`relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
                  ${
                    formData.product_id
                      ? isBalanceSufficient
                        ? "bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20"
                        : "bg-rose-50 border-rose-200 shadow-inner"
                      : "bg-white border-slate-100"
                  }`}
                >
                  {/* Efek kilau jika aktif dan saldo cukup */}
                  {formData.product_id && isBalanceSufficient && (
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
                  )}

                  <div className="relative z-10">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest block mb-2
                      ${!formData.product_id ? "text-slate-400" : isBalanceSufficient ? "text-slate-400" : "text-rose-500"}
                    `}
                    >
                      Total Harga
                    </span>
                    <div
                      className={`text-3xl font-black tracking-tight
                      ${!formData.product_id ? "text-slate-300" : isBalanceSufficient ? "text-white" : "text-rose-600"}
                    `}
                    >
                      {formData.product_id
                        ? formatRupiah(selectedProductPrice)
                        : "Rp 0"}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  {/* PERINGATAN SALDO KURANG */}
                  {formData.product_id && !isBalanceSufficient && (
                    <div className="mb-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-center animate-in zoom-in-95">
                      <p className="text-sm font-bold text-rose-600 mb-2">
                        ⚠️ Saldo tidak mencukupi
                      </p>
                      <Link
                        href="/dashboard/topup"
                        className="text-xs font-bold text-rose-700 bg-white border border-rose-200 hover:border-rose-300 hover:bg-rose-50 px-4 py-2 rounded-xl block transition-all shadow-sm"
                      >
                        Isi Saldo Sekarang →
                      </Link>
                    </div>
                  )}

                  {/* TOMBOL SUBMIT */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full relative group overflow-hidden font-bold py-4 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg
                      ${
                        !isFormValid
                          ? "bg-slate-100 text-slate-400 shadow-none border border-slate-200"
                          : "bg-indigo-600 text-white hover:shadow-indigo-500/30"
                      }
                    `}
                  >
                    {isFormValid && !isSubmitting && (
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}
                    <div className="relative flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <>
                          <span className="text-base">Kirim Pesanan</span>
                          <span className="group-hover:translate-x-1 transition-transform">
                            →
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL SUKSES & WEBHOOK (TIDAK BERUBAH) */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={closeSuccessModal}
        title="🎉 Transaksi Berhasil Diterima!"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl shadow-sm">
            ✓
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            Pesanan Masuk Antrean
          </h3>
          <p className="text-sm text-slate-500">
            Pesanan Anda sedang diproses oleh sistem.
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl text-left space-y-3 border border-slate-100 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Order ID</span>
              <span className="font-mono font-bold text-slate-800">
                {successData?.order_id?.substring(0, 8)}...
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Tujuan</span>
              <span className="font-semibold text-slate-800 text-right">
                {successData?.player_name}
              </span>
            </div>
            {successData?.remaining_balance !== undefined && (
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Sisa Saldo</span>
                <span className="font-bold text-emerald-600">
                  {formatRupiah(successData.remaining_balance)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {successData?.status || "Pending"}
              </span>
            </div>
          </div>
          <button
            onClick={closeSuccessModal}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl hover:bg-slate-800 transition font-medium mt-2 shadow-lg"
          >
            Tutup & Buat Baru
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="⚠️ Webhook URL Diperlukan"
      >
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Webhook URL Belum Diatur
              </h3>
              <p className="text-sm text-slate-500">
                Anda harus mengatur <strong>Webhook URL</strong> di pengaturan
                akun terlebih dahulu sebelum dapat melakukan transaksi.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsWebhookModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition"
            >
              Nanti Saja
            </button>
            <button
              onClick={() => {
                setIsWebhookModalOpen(false);
                router.push("/dashboard/account");
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-medium shadow-md transition"
            >
              Atur Webhook Sekarang →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
