import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/apiConfig";

const AuthContext = createContext(null);

const STORAGE_KEY = "grocery_app_auth";

// Default demo credentials
export const DEMO_SELLER = {
  email: "seller@grocery.com",
  password: "storepassword123",
  name: "FreshCart Central Store",
};

export const DEMO_CUSTOMER = {
  email: "customer@gmail.com",
  password: "customer123",
  name: "Rahul Sharma",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error("Auth save error:", e);
    }
  }, [user]);

  // Seller Login (Store merchant)
  const loginSeller = async (email, password) => {
    if (
      email.trim().toLowerCase() === DEMO_SELLER.email &&
      password === DEMO_SELLER.password
    ) {
      const sellerUser = {
        name: DEMO_SELLER.name,
        email: DEMO_SELLER.email,
        role: "seller",
        isGuest: false,
        storeId: "store_blr_001",
      };
      setUser(sellerUser);
      return { success: true, user: sellerUser };
    }

    // Try backend verification if running
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/seller-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          setUser(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch (e) {
      // Backend offline, fallback to check
    }

    return {
      success: false,
      message: "Invalid seller credentials. Use: seller@grocery.com / storepassword123",
    };
  };

  // Customer Login (Registered customer)
  const loginCustomer = async (email, password) => {
    if (
      (email.trim().toLowerCase() === DEMO_CUSTOMER.email &&
        password === DEMO_CUSTOMER.password) ||
      (email && password.length >= 4)
    ) {
      const customerUser = {
        name: email.split("@")[0] || "Customer",
        email: email.trim().toLowerCase(),
        role: "customer",
        isGuest: false,
      };
      setUser(customerUser);
      return { success: true, user: customerUser };
    }

    return {
      success: false,
      message: "Invalid email or password",
    };
  };

  // Guest Customer Login (Express fast checkout)
  const loginAsGuest = (guestData = {}) => {
    const guestUser = {
      name: guestData.name?.trim() || "Guest Customer",
      phone: guestData.phone?.trim() || "",
      email: "",
      role: "customer",
      isGuest: true,
    };
    setUser(guestUser);
    return { success: true, user: guestUser };
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isSeller: user?.role === "seller",
    isCustomer: user?.role === "customer",
    isGuest: !!user?.isGuest,
    loginSeller,
    loginCustomer,
    loginAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
