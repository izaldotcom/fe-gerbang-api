"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState } from "react";
import Modal from "@/app/components/Modal"; // Import Modal

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk dropdown menu
  const [openMenus, setOpenMenus] = useState({
    Suppliers: pathname.startsWith("/dashboard/suppliers") || false,
  });

  // State untuk Modal Logout
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Definisi Menu
  const menus = [
    { name: "Products", href: "/dashboard/products", icon: "📦" },
    {
      name: "Suppliers",
      icon: "🚚",
      children: [
        { name: "Data Supplier", href: "/dashboard/suppliers" },
        { name: "Supplier Product", href: "/dashboard/suppliers/products" },
      ],
    },
    { name: "Transaksi Baru", href: "/dashboard/transactions", icon: "🛒" },
    // { name: "Users", href: "/dashboard/users", icon: "👥" },
  ];

  // 1. Fungsi Konfirmasi Logout (Dieksekusi jika user klik "Ya, Keluar")
  const confirmLogout = () => {
    Cookies.remove("token");
    Cookies.remove("refresh_token");
    router.push("/");
  };

  return (
    <>
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col shadow-2xl z-20 shrink-0 font-sans border-r border-slate-800">
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
            A
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Admin<span className="text-blue-500">Panel</span>
          </h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menus.map((menu) => {
            if (menu.children) {
              const isOpen = openMenus[menu.name];
              const isChildActive = menu.children.some(
                (child) => pathname === child.href
              );

              return (
                <div key={menu.name} className="group">
                  <button
                    onClick={() => toggleMenu(menu.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                      isChildActive || isOpen
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{menu.icon}</span>
                      <span>{menu.name}</span>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-90 text-blue-500" : "text-slate-500"
                      }`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-48 opacity-100 mt-1" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-8 pl-3 border-l-2 border-slate-700 space-y-1">
                      {menu.children.map((child) => {
                        const isActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 relative ${
                              isActive
                                ? "text-blue-400 bg-blue-500/10 font-semibold translate-x-1"
                                : "text-slate-400 hover:text-white hover:translate-x-1"
                            }`}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            const isActive = pathname === menu.href;
            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <span className="text-lg">{menu.icon}</span>
                {menu.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setIsLogoutModalOpen(true)} // Buka Modal Logout
            className="flex items-center justify-center w-full gap-2 p-3 text-sm font-semibold text-red-400 transition bg-red-500/10 rounded-xl hover:bg-red-500 hover:text-white group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Modal Konfirmasi Logout */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Konfirmasi Logout"
      >
        <div className="text-gray-900">
          <p className="mb-6 text-gray-600">
            Apakah Anda yakin ingin keluar dari aplikasi? Anda harus login
            kembali untuk mengakses dashboard.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              Batal
            </button>
            <button
              onClick={confirmLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-md hover:shadow-lg"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
