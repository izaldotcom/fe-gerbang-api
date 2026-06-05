"use client";
import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { apiService } from "@/services/api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = Cookies.get("token");
      const storedApiKey = Cookies.get("user_api_key");

      if (token) {
        try {
          console.log("Restoring session...");

          const response = await apiService.getSellerProfile(
            storedApiKey || "",
          );

          if (response.data) {
            setUser(response.data);
            console.log("Session restored for:", response.data.name);
          }
        } catch (err) {
          console.error("Gagal mengembalikan sesi:", err);
          // Cookies.remove("token");
          // Cookies.remove("user_api_key");
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
