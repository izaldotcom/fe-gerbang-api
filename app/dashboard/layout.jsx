"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Modal from "@/app/components/Modal";
import { apiService } from "@/services/api"; // Pastikan import API Service

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // State User Data (Role & Name)
  const [userRole, setUserRole] = useState(null); // "Admin" atau "Customer"
  const [userName, setUserName] = useState("Loading...");

  // State Sidebar & Modal
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // State Profile Dropdown
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // === 1. FETCH USER PROFILE (FROM REDIS) ===
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Panggil endpoint /auth/me atau yang sesuai untuk load session Redis
        const response = await apiService.getProfile();

        if (response.data) {
          // Mapping data dari Redis
          setUserRole(response.data.role_name);
          setUserName(response.data.name);
        }
      } catch (err) {
        console.error("Gagal memuat profil user:", err);
        // Opsional: Redirect ke login jika session invalid/expired
        // router.push("/login");
      }
    };

    fetchUserProfile();
  }, []);

  // Tutup sidebar saat pindah halaman
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Tutup dropdown profile jika klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handler Logout
  const handleLogoutClick = () => {
    setIsProfileOpen(false);
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refresh_token");
    router.push("/login");
  };

  // === DEFINISI MENU BASE ===
  const baseMenuGroups = [
    {
      title: "Menu Utama",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "📊" },
        { name: "Transaksi Baru", href: "/dashboard/transactions", icon: "🛒" },
      ],
    },
    {
      title: "Manajemen Data",
      items: [
        { name: "Products", href: "/dashboard/products", icon: "📦" },
        { name: "Suppliers", href: "/dashboard/suppliers", icon: "🚚" },
        {
          name: "Supplier Products",
          href: "/dashboard/suppliers/products",
          icon: "🏷️",
        },
        { name: "Product Recipes", href: "/dashboard/recipes", icon: "📜" },
      ],
    },
  ];

  // === LOGIKA FILTER MENU BERDASARKAN ROLE ===
  const getFilteredMenus = () => {
    if (!userRole) return []; // Tunggu data role terload

    return baseMenuGroups
      .map((group) => {
        const filteredItems = group.items.filter((item) => {
          // SKENARIO 1: ADMIN
          if (userRole === "Admin") {
            // Admin tidak butuh menu "Transaksi Baru" (biasanya customer yg order)
            return item.name !== "Transaksi Baru";
          }

          // SKENARIO 2: CUSTOMER
          if (userRole === "Customer") {
            // Customer HANYA boleh akses Dashboard, Transaksi, dan Lihat Produk
            const allowedCustomerMenus = [
              "Dashboard",
              "Transaksi Baru",
              "Products",
            ];
            return allowedCustomerMenus.includes(item.name);
          }

          return false; // Default: hide all
        });

        return { ...group, items: filteredItems };
      })
      .filter((group) => group.items.length > 0); // Hapus grup menu yang kosong
  };

  const menuGroups = getFilteredMenus();

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* === SIDEBAR === */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl flex flex-col justify-between
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
            <div className="bg-blue-600 p-1.5 rounded mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-4 h-4 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-wide">GerbangAPI</span>
          </div>

          <nav className="p-4 space-y-8 overflow-y-auto max-h-[calc(100vh-8rem)]">
            {menuGroups.length === 0 ? (
              <div className="text-slate-500 text-sm text-center mt-10">
                Memuat Menu...
              </div>
            ) : (
              menuGroups.map((group, idx) => (
                <div key={idx}>
                  <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Sidebar Footer (Mobile Only) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 lg:hidden">
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* === MAIN CONTENT === */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm relative z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
            <h2 className="text-gray-700 font-bold text-lg capitalize hidden sm:block">
              {pathname.split("/").pop().replace(/-/g, " ")}
            </h2>
          </div>

          {/* === PROFILE DROPDOWN === */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none group p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition">
                  {userName}
                </p>
                <p className="text-xs text-gray-500">
                  {userRole || "Loading..."}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                {/* Ambil Inisial Huruf Pertama */}
                {userName !== "Loading..."
                  ? userName.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                  <p className="text-sm font-bold text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500 truncate">{userRole}</p>
                </div>

                <div className="py-1">
                  <button className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                    <span className="text-lg">⚙️</span> Pengaturan Akun
                  </button>
                </div>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>

      {/* === MODAL CONFIRMATION === */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Logout"
      >
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
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
                Yakin ingin keluar?
              </h3>
              <p className="text-sm text-gray-500">
                Sesi Anda akan diakhiri dan Anda harus login kembali untuk
                mengakses halaman ini.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Batal
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium shadow-md transition"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
