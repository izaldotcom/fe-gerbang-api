"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiService } from "@/services/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fungsi untuk mengembalikan data user saat halaman di-refresh
    const restoreSession = async () => {
      const token = Cookies.get("token");

      if (token) {
        try {
          // PERUBAHAN: Menggunakan getProfile() sesuai permintaan
          const response = await apiService.getProfile();

          if (response.data) {
            // Simpan data user (termasuk api_key jika ada) ke state global
            setUser(response.data);

            // === LOGIKA CEK API KEY (Sesuai Request) ===
            // Mengecek apakah api_key tersedia di dalam response profil
            if (response.data.api_key) {
              console.log("User API Key loaded:", response.data.api_key);
            } else {
              console.warn("API Key tidak ditemukan di profil user.");
            }
          }
        } catch (err) {
          console.error("Gagal mengembalikan sesi:", err);
          // Opsional: Cookies.remove("token") jika token tidak valid
        }
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
