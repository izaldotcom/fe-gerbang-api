"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";

export default function DashboardPage() {
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  // State untuk Statistik Admin (Real Data)
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    recipes: 0,
  });

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        // 1. Cek Profile
        const profileRes = await apiService.getProfile();
        const userRole = profileRes.data?.role_name || "Customer";
        setRole(userRole);
        setUserName(profileRes.data?.name || "User");

        // 2. Jika Admin, ambil data statistik real
        if (userRole === "Admin") {
          const [prodRes, suppRes, recipeRes] = await Promise.all([
            apiService.getProducts(),
            apiService.getSuppliers(),
            apiService.getRecipes(),
          ]);
          setStats({
            products: prodRes.data?.length || 0,
            suppliers: suppRes.data?.length || 0,
            recipes: recipeRes.data?.length || 0,
          });
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        <svg
          className="animate-spin h-8 w-8 mr-3 text-blue-500"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Memuat Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {role === "Admin" ? (
        <AdminDashboard userName={userName} stats={stats} />
      ) : (
        <CustomerDashboard userName={userName} />
      )}
    </div>
  );
}

// === KOMPONEN DASHBOARD ADMIN ===
function AdminDashboard({ userName, stats }) {
  return (
    <>
      {/* Hero Section Admin */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Halo, {userName}! 👋</h1>
          <p className="text-blue-100 max-w-xl text-sm md:text-base">
            Anda login sebagai <b>Administrator</b>. Kelola data master produk,
            supplier, dan resep di sini.
          </p>
        </div>
        {/* Dekorasi Abstrak */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      {/* Grid Statistik Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Produk"
          value={stats.products}
          icon="📦"
          color="bg-blue-100 text-blue-600"
          link="/dashboard/products"
        />
        <StatCard
          title="Total Supplier"
          value={stats.suppliers}
          icon="🚚"
          color="bg-indigo-100 text-indigo-600"
          link="/dashboard/suppliers"
        />
        <StatCard
          title="Resep Aktif"
          value={stats.recipes}
          icon="📜"
          color="bg-purple-100 text-purple-600"
          link="/dashboard/recipes"
        />
      </div>

      {/* Admin Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4 text-lg">Kelola Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-blue-300 transition group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              📦
            </span>
            <span className="text-sm font-semibold text-gray-700">Produk</span>
          </Link>
          <Link
            href="/dashboard/suppliers"
            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-indigo-300 transition group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              🚚
            </span>
            <span className="text-sm font-semibold text-gray-700">
              Supplier
            </span>
          </Link>
          <Link
            href="/dashboard/recipes"
            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-purple-300 transition group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              📜
            </span>
            <span className="text-sm font-semibold text-gray-700">Resep</span>
          </Link>
          <Link
            href="/dashboard/suppliers/products"
            className="flex flex-col items-center justify-center p-4 border rounded-xl hover:bg-gray-50 hover:border-teal-300 transition group"
          >
            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
              🏷️
            </span>
            <span className="text-sm font-semibold text-gray-700">
              Bahan Baku
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}

// === KOMPONEN DASHBOARD CUSTOMER ===
function CustomerDashboard({ userName }) {
  return (
    <>
      {/* Hero Section Customer */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Selamat Datang, {userName}!
            </h1>
            <p className="text-emerald-100 max-w-lg text-sm md:text-base">
              Siap melakukan transaksi hari ini? Cek stok produk terbaru kami
              dan buat pesanan dengan mudah.
            </p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="shrink-0 bg-white text-teal-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-teal-50 hover:scale-105 transition-all flex items-center gap-2"
          >
            <span>🛒</span> Buat Transaksi Baru
          </Link>
        </div>
        {/* Dekorasi */}
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute right-10 top-10 w-32 h-32 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      {/* Customer Quick Stats (Dummy Data for UX) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl">
            ⏳
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Status Terakhir</p>
            <p className="text-xl font-bold text-gray-800">Menunggu Proses</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">
              Transaksi Sukses
            </p>
            <p className="text-xl font-bold text-gray-800">12 Order</p>
          </div>
        </div>
      </div>

      {/* Riwayat Pesanan Sederhana (Mockup) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">
            Riwayat Pesanan Saya
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-teal-600 font-medium hover:underline"
          >
            Buat Baru &rarr;
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs">
              <tr>
                <th className="p-4">Tanggal</th>
                <th className="p-4">Produk</th>
                <th className="p-4">ID Tujuan</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Dummy Data */}
              <tr className="hover:bg-gray-50">
                <td className="p-4">20 Des 2025</td>
                <td className="p-4 font-medium text-gray-900">
                  Koin Emas 100M
                </td>
                <td className="p-4 font-mono text-xs">12345678</td>
                <td className="p-4 text-right">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                    Sukses
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4">19 Des 2025</td>
                <td className="p-4 font-medium text-gray-900">
                  Koin Emas 500M
                </td>
                <td className="p-4 font-mono text-xs">88822111</td>
                <td className="p-4 text-right">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                    Sukses
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// === KOMPONEN KARTU KECIL ===
function StatCard({ title, value, icon, color, link }) {
  return (
    <Link href={link} className="block group">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
        <div className="flex items-center justify-between mb-2">
          <div
            className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-xl`}
          >
            {icon}
          </div>
          <span className="text-gray-300 group-hover:text-blue-500 transition-colors">
            ↗
          </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {title}
        </h3>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
      </div>
    </Link>
  );
}
