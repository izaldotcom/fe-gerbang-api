"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Swal from "sweetalert2";
import { apiService } from "@/services/api";

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTopups = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllTopUps();
      setTopups(res.data || []);
    } catch (err) {
      console.error("Gagal memuat top-up:", err);
      Swal.fire("Error", "Gagal mengambil data Top-Up", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopups();
  }, []);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAction = async (id, actionType) => {
    const isApprove = actionType === "approve";
    const result = await Swal.fire({
      title: isApprove ? "Setujui Top-Up?" : "Tolak Top-Up?",
      text: isApprove
        ? "Saldo User akan langsung bertambah."
        : "Pengajuan ini akan dibatalkan.",
      icon: isApprove ? "question" : "warning",
      showCancelButton: true,
      confirmButtonColor: isApprove ? "#059669" : "#e11d48", // emerald-600 atau rose-600
      cancelButtonColor: "#94a3b8",
      confirmButtonText: isApprove ? "Ya, Setujui!" : "Ya, Tolak!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        // Menembak API Approve yang sudah Anda buat sebelumnya
        await apiService.approveTopUp({
          topup_id: id,
          action: actionType, // "approve" atau "reject" (Sesuaikan dengan payload Golang Anda)
        });

        Swal.fire(
          "Berhasil!",
          `Top-Up telah di-${isApprove ? "setujui" : "tolak"}.`,
          "success",
        );
        fetchTopups(); // Refresh tabel
      } catch (err) {
        Swal.fire(
          "Gagal",
          err.message || "Terjadi kesalahan saat memproses",
          "error",
        );
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Manajemen Top-Up
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Validasi dan setujui dana masuk dari pengguna.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Kembali
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-700">
            Daftar Pengajuan Masuk
          </h2>
          <button
            onClick={fetchTopups}
            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"
            title="Refresh Data"
          >
            ↻
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
              <tr>
                <th className="p-5">Tanggal</th>
                <th className="p-5">User</th>
                <th className="p-5">Metode</th>
                <th className="p-5">Nominal</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400">
                    Memuat data...
                  </td>
                </tr>
              ) : topups.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-slate-400 font-medium"
                  >
                    Belum ada data pengajuan Top-Up.
                  </td>
                </tr>
              ) : (
                topups.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="p-5 font-mono text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="p-5 font-bold text-slate-700">
                      {t.user_name}
                    </td>
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                        {t.payment_method || "Manual"}
                      </span>
                    </td>
                    <td className="p-5 font-black text-slate-800">
                      {formatRupiah(t.amount)}
                    </td>
                    <td className="p-5">
                      {t.status === "pending" && (
                        <span className="text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Pending
                        </span>
                      )}
                      {t.status === "approved" && (
                        <span className="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Approved
                        </span>
                      )}
                      {t.status === "rejected" && (
                        <span className="text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      {t.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleAction(t.id, "approve")}
                            className="text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleAction(t.id, "reject")}
                            className="text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            Tolak
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-xs font-bold text-slate-300">
                          - Selesai -
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
