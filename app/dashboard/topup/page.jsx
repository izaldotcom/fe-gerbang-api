"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";
import { useUser } from "@/app/context/UserContext";

export default function TopUpPage() {
  const { user } = useUser();
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("TRANSFER_BCA");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const quickAmounts = [10000, 50000, 100000, 500000, 1000000];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const numericAmount = parseFloat(amount.replace(/[^0-9]/g, ""));
    if (!numericAmount || numericAmount < 10000) {
      setErrorMsg("Minimal top-up adalah Rp 10.000");
      return;
    }

    try {
      setLoading(true);

      const res = await apiService.requestTopUp(
        {
          amount: numericAmount,
          payment_method: paymentMethod,
        },
        user?.api_key,
      );

      // [PERBAIKAN 1]: Cukup gunakan res.data karena fetchAPI langsung mengembalikan objek JSON
      setSuccessData(res.data);

      Swal.fire({
        title: "Pengajuan Berhasil!",
        text: "Silakan selesaikan pembayaran sesuai instruksi agar saldo dapat masuk.",
        icon: "success",
        confirmButtonText: "Lihat Instruksi Pembayaran",
        confirmButtonColor: "#4f46e5",
        allowOutsideClick: false,
      });
    } catch (err) {
      Swal.fire({
        title: "Gagal!",
        text: err.message || "Terjadi kesalahan saat memproses permintaan.",
        icon: "error",
        confirmButtonColor: "#e11d48",
      });
      setErrorMsg(
        err.message || "Terjadi kesalahan saat memproses permintaan.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/[^0-9]/g, "");
    if (val) {
      setAmount(parseInt(val).toLocaleString("id-ID"));
    } else {
      setAmount("");
    }
  };

  // ==========================================
  // TAMPILAN JIKA REQUEST SUKSES (INSTRUKSI)
  // ==========================================
  if (successData) {
    const isBCA = successData.payment_method === "TRANSFER_BCA";
    const isQRIS = successData.payment_method === "QRIS";

    return (
      <div className="relative">
        <div className="max-w-lg mx-auto mt-10 animate-in zoom-in-95 duration-500 pb-20">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 sm:p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-emerald-50 to-white"></div>

            <div className="relative z-10">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner shadow-emerald-200/50">
                🏦
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                Request Dibuat!
              </h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                Selesaikan pembayaran Anda sesuai dengan instruksi di bawah ini.
              </p>

              {/* CARD INFO UTAMA */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 text-left relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-indigo-100"></div>

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Metode
                    </span>
                    <span className="font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                      {isBCA ? "Transfer BCA" : "QRIS"}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Nominal Bayar
                    </span>
                    <span className="font-extrabold text-indigo-600 text-2xl tracking-tight">
                      Rp {successData.amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  {/* INFO REKENING KHUSUS BCA */}
                  {isBCA && (
                    <div className="pt-4 mt-2 border-t border-slate-200/60 flex flex-col gap-1">
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                        Nomor Rekening
                      </span>
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-slate-800 text-xl tracking-wider">
                          123 456 7890
                        </span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText("1234567890");
                            Swal.fire({
                              toast: true,
                              position: "top-end",
                              icon: "success",
                              title: "Nomor rekening disalin!",
                              showConfirmButton: false,
                              timer: 2000,
                            });
                          }}
                          className="text-indigo-600 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                        >
                          Salin
                        </button>
                      </div>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        A.n. GerbangAPI Indonesia
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* BLOK QR CODE KHUSUS QRIS */}
              {isQRIS && (
                <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-indigo-100 mb-6">
                  <div className="w-48 h-48 mx-auto bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-200 mb-3">
                    <div className="grid grid-cols-2 gap-1 mb-2">
                      <div className="w-8 h-8 bg-slate-800 rounded-sm"></div>
                      <div className="w-8 h-8 bg-slate-800 rounded-sm"></div>
                      <div className="w-8 h-8 bg-slate-800 rounded-sm"></div>
                      <div className="w-8 h-8 bg-indigo-600 rounded-sm"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      SCAN QRIS
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">
                    Scan menggunakan aplikasi M-Banking atau E-Wallet pilihan
                    Anda.
                  </p>
                </div>
              )}

              {/* LANGKAH-LANGKAH PEMBAYARAN */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 text-left text-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <span className="text-lg">📋</span> Cara Pembayaran
                </h3>

                {isBCA ? (
                  <ol className="list-decimal list-inside space-y-3 text-slate-600 font-medium">
                    <li>
                      Buka aplikasi <b>BCA mobile</b> atau pergi ke ATM BCA.
                    </li>
                    <li>
                      Pilih menu{" "}
                      <b className="text-slate-800">
                        m-Transfer &gt; Antar Rekening
                      </b>
                      .
                    </li>
                    <li>
                      Masukkan nomor rekening{" "}
                      <b className="text-slate-800 font-mono bg-slate-100 px-1 rounded">
                        1234567890
                      </b>
                      .
                    </li>
                    <li>
                      Masukkan nominal{" "}
                      <b className="text-indigo-600 bg-indigo-50 px-1 rounded">
                        Rp {successData.amount.toLocaleString("id-ID")}
                      </b>
                      . <br />
                      <span className="text-rose-500 text-xs ml-4">
                        *Pastikan nominal transfer sesuai!
                      </span>
                    </li>
                    <li>Masukkan PIN m-BCA Anda dan simpan bukti transfer.</li>
                  </ol>
                ) : (
                  <ol className="list-decimal list-inside space-y-3 text-slate-600 font-medium">
                    <li>
                      Buka aplikasi E-Wallet (Gopay, OVO, Dana) atau Mobile
                      Banking.
                    </li>
                    <li>
                      Pilih ikon <b className="text-slate-800">Scan / Pay</b>.
                    </li>
                    <li>Arahkan kamera ke QR Code di atas.</li>
                    <li>
                      Pastikan nama penerima adalah{" "}
                      <b className="text-slate-800">GerbangAPI Indonesia</b>.
                    </li>
                    <li>
                      Masukkan PIN Anda dan simpan *screenshot* bukti
                      pembayaran.
                    </li>
                  </ol>
                )}
              </div>

              <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl border border-amber-100 text-left mb-8">
                <span className="text-xl">⚠️</span>
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Setelah transfer berhasil, harap hubungi Admin kami via
                  WhatsApp dengan mengirimkan <b>Bukti Transfer</b> agar saldo
                  Anda dapat segera diproses ke dalam akun.
                </p>
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex w-full items-center justify-center bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-indigo-500/30"
              >
                Saya Sudah Transfer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN FORM INPUT TOP-UP
  // ==========================================
  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-indigo-200 group-hover:bg-indigo-50 transition-colors">
            ←
          </span>
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/40 p-6 sm:p-10 relative overflow-hidden">
        <div className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Mau isi saldo berapa?
          </h1>
          <p className="text-slate-500 text-sm">
            Pilih nominal atau ketik jumlah yang Anda inginkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Input Nominal */}
          <div className="flex flex-col items-center">
            <div className="relative w-full mb-6">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
                <span
                  className={`text-3xl sm:text-5xl font-bold transition-colors ${amount ? "text-slate-800" : "text-slate-300"}`}
                >
                  Rp
                </span>
              </div>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                className="w-full pl-16 sm:pl-20 py-2 bg-transparent text-4xl sm:text-6xl font-extrabold text-slate-800 focus:outline-none placeholder:text-slate-200 tracking-tighter border-b-2 border-slate-100 focus:border-indigo-600 transition-colors rounded-none"
                placeholder="0"
                required
              />
            </div>

            {/* Quick Picks */}
            <div className="flex flex-wrap justify-center gap-2">
              {quickAmounts.map((q) => {
                const qStr = q.toLocaleString("id-ID");
                const isSelected = amount === qStr;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setAmount(qStr)}
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all border-2 
                      ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                          : "bg-white text-slate-500 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50"
                      }`}
                  >
                    {q >= 1000000 ? `${q / 1000000}M` : `${q / 1000}k`}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section: Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest text-center">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all group overflow-hidden
                ${paymentMethod === "TRANSFER_BCA" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-300 bg-white"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="TRANSFER_BCA"
                  checked={paymentMethod === "TRANSFER_BCA"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                    <span className="text-white font-black text-[10px] tracking-wider italic">
                      BCA
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">
                      Transfer BCA
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Manual Check
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all 
                  ${paymentMethod === "TRANSFER_BCA" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}
                >
                  {paymentMethod === "TRANSFER_BCA" && (
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  )}
                </div>
              </label>

              <label
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all group overflow-hidden
                ${paymentMethod === "QRIS" ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-300 bg-white"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="QRIS"
                  checked={paymentMethod === "QRIS"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-inner">
                    <span className="text-white font-black text-[10px] tracking-wider">
                      QRIS
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">QRIS</span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Manual Check
                    </span>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all 
                  ${paymentMethod === "QRIS" ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}
                >
                  {paymentMethod === "QRIS" && (
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                  )}
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full relative group overflow-hidden bg-slate-900 text-white font-bold py-4.5 sm:py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-xl hover:shadow-indigo-500/30"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <span className="text-lg">Bayar Sekarang</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </>
              )}
            </div>
          </button>
        </form>
      </div>
    </div>
  );
}
