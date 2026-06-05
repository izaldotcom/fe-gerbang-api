"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiService } from "@/services/api";
import { useUser } from "@/app/context/UserContext";

export default function DashboardPage() {
  const { user } = useUser();
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    recipes: 0,
    users: 0,
  });
  const [orderHistory, setOrderHistory] = useState([]);

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);

        const userRole = user?.role_name || "Customer";
        const userApiKey = user?.api_key;

        setRole(userRole);
        setUserName(user?.name || "User");

        if (userRole === "Admin") {
          const [prodRes, suppRes, recipeRes, usersRes] = await Promise.all([
            apiService.getProducts(),
            apiService.getSuppliers(),
            apiService.getRecipes(),
            apiService.getUsers(),
          ]);

          setStats({
            products: prodRes.data?.length || 0,
            suppliers: suppRes.data?.length || 0,
            recipes: recipeRes.data?.length || 0,
            users: usersRes.data?.length || 0,
          });
        } else {
          if (userApiKey) {
            try {
              const historyRes = await apiService.getOrderHistory(userApiKey);
              setOrderHistory(historyRes.data || []);
            } catch (err) {
              console.error("Gagal mengambil riwayat pesanan:", err);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    initDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-3 text-slate-500">
        <div className="w-10 h-10 border-[3px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <span className="text-xs font-medium animate-pulse">
          Memuat data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {role === "Admin" ? (
        <AdminDashboard userName={userName} stats={stats} />
      ) : (
        <CustomerDashboard
          userName={userName}
          orderHistory={orderHistory}
          user={user}
        />
      )}
    </div>
  );
}

// ==================================================================================
// 1. ADMIN DASHBOARD
// ==================================================================================
function AdminDashboard({ userName, stats }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden border border-slate-700">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.5)]"></span>
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Admin Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight text-white">
            Hi, {userName}.
          </h1>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
            Pantau metrik kinerja, kelola pengguna, dan atur inventaris sistem
            dengan mudah.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon="👥"
          theme="dark"
          link="/dashboard/users"
        />
        <StatCard
          title="Total Produk"
          value={stats.products}
          icon="📦"
          theme="blue"
          link="/dashboard/products"
        />
        <StatCard
          title="Total Supplier"
          value={stats.suppliers}
          icon="🚚"
          theme="indigo"
          link="/dashboard/suppliers"
        />
        <StatCard
          title="Resep Aktif"
          value={stats.recipes}
          icon="📜"
          theme="dark-green"
          link="/dashboard/recipes"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <span className="text-lg">🚀</span> Akses Cepat
          </h3>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <ShortcutCard
            href="/dashboard/users"
            icon="👤"
            label="User"
            theme="dark"
            badge="Utama"
          />
          {/* --- [BARU] Shortcut untuk persetujuan Top-Up Admin --- */}
          <ShortcutCard
            href="/dashboard/topups"
            icon="💳"
            label="Top-Up"
            theme="blue"
            badge="Keuangan"
          />

          <ShortcutCard
            href="/dashboard/products"
            icon="📦"
            label="Produk"
            theme="blue"
          />
          <ShortcutCard
            href="/dashboard/suppliers"
            icon="🚚"
            label="Supplier"
            theme="indigo"
          />
          <ShortcutCard
            href="/dashboard/recipes"
            icon="📜"
            label="Resep"
            theme="teal"
          />
          <ShortcutCard
            href="/dashboard/suppliers/products"
            icon="🏷️"
            label="Bahan Baku"
            theme="slate"
          />
        </div>
      </div>
    </>
  );
}

// ==================================================================================
// 2. CUSTOMER DASHBOARD
// ==================================================================================
function CustomerDashboard({ userName, orderHistory = [], user }) {
  const successCount = orderHistory.filter(
    (o) => o.status?.toLowerCase() === "success",
  ).length;
  const lastOrder = orderHistory.length > 0 ? orderHistory[0] : null;
  const lastStatus = lastOrder ? lastOrder.status : "Belum ada transaksi";

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    if (s === "success")
      return (
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-emerald-200">
          Sukses
        </span>
      );
    if (s === "pending")
      return (
        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-amber-200">
          Pending
        </span>
      );
    if (s === "failed")
      return (
        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200">
          Gagal
        </span>
      );
    return (
      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-200">
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Halo, {userName}! 👋</h1>
            <p className="text-emerald-50/80 text-sm max-w-md">
              Selamat datang kembali. Cek riwayat pesanan dan saldo Anda di
              bawah ini.
            </p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="shrink-0 bg-white/95 hover:bg-white text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <span>🛒</span> Buat Transaksi
          </Link>
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
      </div>

      {/* --- [PERBAIKAN GRID]: Diubah menjadi lg:grid-cols-4 agar kartu Saldo muat --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* --- [BARU] Kartu Saldo Customer --- */}
        <BalanceCard user={user} />

        <CompactStatusCard
          icon="⏳"
          title="Status Terakhir"
          value={lastStatus}
          color="orange"
        />
        <CompactStatusCard
          icon="✅"
          title="Pesanan Sukses"
          value={`${successCount} Transaksi`}
          color="emerald"
        />
        <TelegramConnectCard user={user} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">
            🕒 Riwayat Pesanan Terbaru
          </h3>
          <Link
            href="/dashboard/transactions/history"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {orderHistory.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-sm">
              Belum ada riwayat transaksi. Yuk mulai belanja!
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Ref ID</th>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Tujuan</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orderHistory.slice(0, 5).map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-slate-500">
                      {formatDate(item.created_at || item.date)}
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-400">
                      {item.ref_id || item.trx_id || "-"}
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      {item.product_name ||
                        item.product ||
                        "Produk Tidak Diketahui"}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {item.price
                          ? `Rp ${parseInt(item.price).toLocaleString("id-ID")}`
                          : ""}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-slate-600">
                      {item.destination || item.target || "-"}
                    </td>
                    <td className="p-4 text-right">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

// ==================================================================================
// 3. HELPER COMPONENTS
// ==================================================================================

// --- [BARU] Komponen Kartu Saldo ---
function BalanceCard({ user }) {
  const balance = user?.balance || 0;

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden h-full group">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-slate-400">
            Saldo Tersedia
          </p>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Rp {balance.toLocaleString("id-ID")}
          </h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
          💳
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <Link
          href="/dashboard/topup"
          className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-xs font-bold py-2.5 rounded-lg transition-all"
        >
          <span>➕</span> Isi Saldo
        </Link>
      </div>
    </div>
  );
}

function TelegramConnectCard({ user }) {
  const botUsername = "GerbangApiBot";
  const isConnected = !!(
    user?.telegram_chat_id ||
    user?.telegram_id ||
    user?.telegram_username
  );
  const userId = user?.id;

  if (!userId) return null;

  return (
    <div
      className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between gap-3 relative overflow-hidden h-full transition-all ${isConnected ? "bg-green-50 border-green-100" : "bg-white border-blue-100"}`}
    >
      <div
        className={`absolute -right-6 -top-6 w-20 h-20 rounded-full blur-xl opacity-60 pointer-events-none ${isConnected ? "bg-green-200" : "bg-blue-50"}`}
      ></div>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isConnected ? "text-green-600" : "text-slate-400"}`}
          >
            Notifikasi Telegram
          </p>
          <h3
            className={`text-sm font-bold leading-tight ${isConnected ? "text-green-800" : "text-slate-700"}`}
          >
            {isConnected ? "Akun Terhubung" : "Hubungkan Telegram"}
          </h3>
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${isConnected ? "bg-green-100 text-green-600" : "bg-blue-50 text-blue-500"}`}
        >
          ✈️
        </div>
      </div>
      <div className="relative z-10 mt-auto">
        {isConnected ? (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full bg-green-200 text-green-700 text-xs font-bold py-2.5 rounded-lg cursor-default opacity-80"
          >
            <span>✓</span> Sudah Terhubung
          </button>
        ) : (
          <a
            href={`https://t.me/${botUsername}?start=${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <span>🔗</span> Hubungkan
          </a>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, theme, link }) {
  const themes = {
    dark: {
      text: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-200",
      hover: "hover:border-slate-300",
    },
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      hover: "hover:border-blue-200",
    },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      hover: "hover:border-indigo-200",
    },
    "dark-green": {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      hover: "hover:border-emerald-200",
    },
  };
  const t = themes[theme] || themes.blue;
  return (
    <Link href={link} className="block group">
      <div
        className={`bg-white p-5 rounded-xl border ${t.border} shadow-sm transition-all duration-200 ${t.hover} hover:shadow-md relative overflow-hidden h-full`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${t.text}`}>{icon}</span>
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-slate-800">{value}</p>
        </div>
      </div>
    </Link>
  );
}

function ShortcutCard({ href, icon, label, theme, badge }) {
  const themes = {
    dark: "hover:bg-slate-50 hover:border-slate-300 text-slate-700",
    blue: "hover:bg-blue-50 hover:border-blue-200 text-blue-600",
    indigo: "hover:bg-indigo-50 hover:border-indigo-200 text-indigo-600",
    teal: "hover:bg-teal-50 hover:border-teal-200 text-teal-600",
    slate: "hover:bg-gray-50 hover:border-gray-300 text-gray-600",
  };
  const hoverClass = themes[theme] || themes.blue;
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center p-3 py-4 border border-slate-100 bg-white rounded-xl shadow-sm transition-all duration-200 group ${hoverClass} hover:shadow-md h-full`}
    >
      {badge && (
        <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-rose-50 text-rose-500 px-1.5 py-0.5 rounded-full border border-rose-100">
          {badge}
        </span>
      )}
      <span className="text-2xl mb-2 group-hover:-translate-y-0.5 transition-transform filter drop-shadow-sm opacity-80 group-hover:opacity-100">
        {icon}
      </span>
      <span className="text-xs font-bold text-slate-600 group-hover:text-current text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

function CompactStatusCard({ icon, title, value, color }) {
  const colors = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "hover:border-orange-200",
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "hover:border-emerald-200",
    },
  };
  const c = colors[color] || colors.emerald;
  return (
    <div
      className={`bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4 ${c.border} transition-colors h-full`}
    >
      <div
        className={`w-12 h-12 rounded-lg ${c.bg} ${c.text} flex items-center justify-center text-2xl shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
          {title}
        </p>
        <p className="text-base font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
