import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../utils/apiConfig";

const AuthContext = createContext(null);

const STORAGE_KEY = "grocery_app_auth";

// Default demo credentials
export const DEMO_ADMIN = {
  email: "admin@grocery.com",
  password: "adminpassword123",
  name: "Platform Administrator",
};

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

const VENDORS_STORAGE_KEY = "grocery_approved_vendors";

export const INITIAL_APPROVED_VENDORS = [
  {
    id: "vnd_001",
    name: "FreshCart Central Manager",
    storeName: "FreshCart Central Darkstore",
    email: "seller@grocery.com",
    phone: "9876543210",
    password: "storepassword123",
    status: "APPROVED",
    addedBy: "admin@grocery.com",
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    id: "vnd_002",
    name: "Organic Produce Manager",
    storeName: "Green Valley Farm Produce",
    email: "organic.farms@grocery.com",
    phone: "9812345678",
    password: "vendorpassword123",
    status: "APPROVED",
    addedBy: "admin@grocery.com",
    createdAt: "2026-11-05T12:00:00.000Z",
  },
  {
    id: "vnd_003",
    name: "Heritage Dairy Store",
    storeName: "Heritage Milk & Dairy Mart",
    email: "dairy.fresh@grocery.com",
    phone: "9823456789",
    password: "vendorpassword123",
    status: "APPROVED",
    addedBy: "admin@grocery.com",
    createdAt: "2026-11-10T14:30:00.000Z",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Approved vendors list (Whitelisted merchants authorized to operate/register as vendors)
  const [approvedVendors, setApprovedVendors] = useState(() => {
    try {
      const saved = localStorage.getItem(VENDORS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_APPROVED_VENDORS;
    } catch (e) {
      return INITIAL_APPROVED_VENDORS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(VENDORS_STORAGE_KEY, JSON.stringify(approvedVendors));
    } catch (e) {
      console.error("Vendors save error:", e);
    }
  }, [approvedVendors]);

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

  // Seller / Vendor / Admin Login
  const loginSeller = async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();

    // 1. Check Platform SuperAdmin credentials
    if (
      cleanEmail === DEMO_ADMIN.email.toLowerCase() &&
      password === DEMO_ADMIN.password
    ) {
      const adminUser = {
        name: DEMO_ADMIN.name,
        email: DEMO_ADMIN.email,
        role: "admin",
        isGuest: false,
      };
      setUser(adminUser);
      return { success: true, user: adminUser };
    }

    // 2. Check Demo Store Seller
    if (
      cleanEmail === DEMO_SELLER.email.toLowerCase() &&
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

    // 3. Check Approved Vendors Whitelist
    const matchedVendor = approvedVendors.find(
      (v) => v.email && v.email.toLowerCase() === cleanEmail
    );

    if (matchedVendor) {
      if (matchedVendor.password === password) {
        const vendorUser = {
          name: matchedVendor.name || matchedVendor.storeName,
          email: matchedVendor.email,
          role: "vendor",
          storeName: matchedVendor.storeName,
          storeId: matchedVendor.id,
          phone: matchedVendor.phone || "",
          isGuest: false,
        };
        setUser(vendorUser);
        return { success: true, user: vendorUser };
      } else {
        return {
          success: false,
          message: "Incorrect vendor password. Please check your credentials.",
        };
      }
    }

    // 4. Try backend verification if running
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/seller-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch (e) {
      // Backend offline, fallback to check
    }

    return {
      success: false,
      message: "Access Denied: Unrecognized vendor or admin credentials. Only authorized vendors can sign in.",
    };
  };

  // Only Admins can add vendors to the approved vendor whitelist!
  const addApprovedVendor = async (vendorData) => {
    // Permission check: only admin can add
    if (user?.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Only platform Administrators can add or authorize new vendors.",
      };
    }

    const name = (vendorData.name || "").trim();
    const storeName = (vendorData.storeName || "").trim();
    const email = (vendorData.email || "").trim().toLowerCase();
    const phone = (vendorData.phone || "").trim();
    const password = vendorData.password || "vendor123";

    if (!name || !storeName || !email) {
      return {
        success: false,
        message: "Vendor name, store name, and valid email are required.",
      };
    }

    if (approvedVendors.some((v) => v.email && v.email.toLowerCase() === email)) {
      return {
        success: false,
        message: `A vendor with email ${email} is already authorized.`,
      };
    }

    const newVendor = {
      id: `vnd_${Date.now()}`,
      name,
      storeName,
      email,
      phone,
      password,
      status: "APPROVED",
      addedBy: user.email,
      createdAt: new Date().toISOString(),
    };

    setApprovedVendors((prev) => [newVendor, ...prev]);

    return {
      success: true,
      message: `Vendor '${storeName}' (${email}) successfully authorized!`,
      vendor: newVendor,
    };
  };

  // Only Admins can revoke/delete a vendor
  const removeApprovedVendor = async (vendorId) => {
    if (user?.role !== "admin") {
      return {
        success: false,
        message: "Unauthorized: Only platform Administrators can revoke vendor permissions.",
      };
    }

    setApprovedVendors((prev) => prev.filter((v) => v.id !== vendorId));
    return { success: true, message: "Vendor access revoked successfully." };
  };

  // Send 6-Digit Email Verification Code
  const sendVerificationCode = async (email, type = "customer") => {
    const cleanEmail = (email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "Please provide a valid email address." };
    }

    // Whitelist check for vendors
    if (type === "vendor") {
      const isWhitelisted = approvedVendors.find(
        (v) => v.email && v.email.toLowerCase() === cleanEmail
      );
      if (!isWhitelisted) {
        return {
          success: false,
          message: `Registration Denied: '${cleanEmail}' is not on the Admin Approved Vendors list. Only platform Administrators can authorize new vendors.`,
        };
      }
    }

    // 1. Try backend API
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, type }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          return data;
        } else if (data.message) {
          return { success: false, message: data.message };
        }
      }
    } catch (e) {
      // Backend offline, fallback to client-side code generation
    }

    // 2. Client-side resilience fallback
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codesMap = JSON.parse(localStorage.getItem("grocery_verification_codes") || "{}");
    codesMap[cleanEmail] = {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
      verified: false,
    };
    localStorage.setItem("grocery_verification_codes", JSON.stringify(codesMap));

    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${cleanEmail}.`,
      previewCode: code,
    };
  };

  // Verify 6-Digit Code
  const verifyCode = async (email, code) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanCode = (code || "").toString().trim();

    if (!cleanEmail || !cleanCode) {
      return { success: false, message: "Email and 6-digit code are required." };
    }

    // 1. Try backend API
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code: cleanCode }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success) {
          return { success: true, message: data.message };
        } else if (data.message) {
          return { success: false, message: data.message };
        }
      }
    } catch (e) {}

    // 2. Client fallback
    const codesMap = JSON.parse(localStorage.getItem("grocery_verification_codes") || "{}");
    const record = codesMap[cleanEmail];

    if (!record) {
      return { success: false, message: "No verification code requested. Click 'Send Code' first." };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, message: "Verification code expired. Please request a new code." };
    }

    if (record.code !== cleanCode) {
      return { success: false, message: "Invalid 6-digit verification code. Please check and try again." };
    }

    record.verified = true;
    localStorage.setItem("grocery_verification_codes", JSON.stringify(codesMap));
    return { success: true, message: "Email verified successfully!" };
  };

  // Vendor Registration (Prospective vendor signs up: system validates whitelist and 6-digit OTP)
  const registerVendor = async ({ name, storeName, email, password, phone, code }) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();
    const cleanStore = (storeName || "").trim();
    const cleanPhone = (phone || "").trim();
    const cleanCode = (code || "").toString().trim();

    if (!cleanEmail || !password || password.length < 6) {
      return {
        success: false,
        message: "Valid email and a password of at least 6 characters are required.",
      };
    }

    if (!cleanCode) {
      return {
        success: false,
        message: "The 6-digit email verification code is mandatory.",
      };
    }

    // Verify 6-digit code first
    const codeVerification = await verifyCode(cleanEmail, cleanCode);
    if (!codeVerification.success) {
      return codeVerification;
    }

    // Check if this email is in the Admin's Approved Vendors list!
    const isWhitelisted = approvedVendors.find(
      (v) => v.email && v.email.toLowerCase() === cleanEmail
    );

    if (!isWhitelisted) {
      return {
        success: false,
        message: `Registration Denied: '${cleanEmail}' is not on the Admin Approved Vendors list. Only platform Administrators can authorize new vendors. Please contact admin@grocery.com to onboard your store.`,
      };
    }

    // Try backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/vendor-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          storeName: cleanStore,
          email: cleanEmail,
          password,
          phone: cleanPhone,
          code: cleanCode,
        }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          return { success: true, user: data.user, message: data.message };
        }
      }
    } catch (e) {}

    // Update their credentials in the whitelist
    const updatedVendor = {
      ...isWhitelisted,
      name: cleanName || isWhitelisted.name,
      storeName: cleanStore || isWhitelisted.storeName,
      phone: cleanPhone || isWhitelisted.phone,
      password: password,
      status: "ACTIVE",
    };

    setApprovedVendors((prev) =>
      prev.map((v) => (v.id === isWhitelisted.id ? updatedVendor : v))
    );

    // Immediately log them in as a vendor
    const vendorUser = {
      name: updatedVendor.name,
      email: updatedVendor.email,
      storeName: updatedVendor.storeName,
      storeId: updatedVendor.id,
      phone: updatedVendor.phone,
      role: "vendor",
      isGuest: false,
    };

    setUser(vendorUser);
    return {
      success: true,
      message: `Welcome ${updatedVendor.storeName}! Vendor account registered and verified.`,
      user: vendorUser,
    };
  };

  // Customer Login (Registered customer)
  const loginCustomer = async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();

    // 1. Check demo customer credentials
    if (
      cleanEmail === DEMO_CUSTOMER.email.toLowerCase() &&
      password === DEMO_CUSTOMER.password
    ) {
      const customerUser = {
        name: DEMO_CUSTOMER.name,
        email: DEMO_CUSTOMER.email,
        role: "customer",
        isGuest: false,
      };
      setUser(customerUser);
      return { success: true, user: customerUser };
    }

    // 2. Check local registered users list in localStorage
    try {
      const localUsers = JSON.parse(
        localStorage.getItem("grocery_registered_users") || "[]"
      );
      const found = localUsers.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );
      if (found) {
        if (found.password === password) {
          const customerUser = {
            name: found.name,
            email: found.email,
            phone: found.phone || "",
            role: "customer",
            isGuest: false,
          };
          setUser(customerUser);
          return { success: true, user: customerUser };
        } else {
          return {
            success: false,
            message: "Incorrect password. Please try again.",
          };
        }
      }
    } catch (e) {
      console.error("Local user lookup error:", e);
    }

    // 3. Try backend API verification if server is running
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/customer-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          return { success: true, user: data.user };
        }
      }
    } catch (e) {
      // Backend offline
    }

    // 4. Default credential acceptance for demo purposes
    if (cleanEmail && password && password.length >= 4) {
      const customerUser = {
        name: cleanEmail.split("@")[0] || "Customer",
        email: cleanEmail,
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

  // Customer Registration (Requires 6-Digit Email Verification Code)
  const registerCustomer = async ({ name, email, password, phone, code }) => {
    const cleanName = (name || "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPhone = (phone || "").trim();
    const cleanCode = (code || "").toString().trim();

    if (!cleanName) {
      return { success: false, message: "Please enter your full name." };
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, message: "Please enter a valid email address." };
    }
    if (!password || password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters." };
    }

    if (!cleanCode) {
      return { success: false, message: "The 6-digit email verification code is mandatory." };
    }

    // Verify 6-digit code first
    const codeVerification = await verifyCode(cleanEmail, cleanCode);
    if (!codeVerification.success) {
      return codeVerification;
    }

    // Try backend registration if API server is running
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: password,
          phone: cleanPhone,
          code: cleanCode,
        }),
      });

      const cType = res.headers.get("content-type") || "";
      if (cType.includes("application/json")) {
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUser(data.user);
          return { success: true, user: data.user, message: data.message };
        } else if (!res.ok && data.message) {
          return { success: false, message: data.message };
        }
      }
    } catch (e) {
      // Backend offline, fallback to client persistence
    }

    // Persist in localStorage registry
    try {
      const registeredUsers = JSON.parse(
        localStorage.getItem("grocery_registered_users") || "[]"
      );

      const existing = registeredUsers.find(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );
      if (existing) {
        return {
          success: false,
          message: "An account with this email already exists. Please Sign In.",
        };
      }

      const newUserRecord = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: password,
        role: "customer",
        isGuest: false,
        created_at: new Date().toISOString(),
      };

      registeredUsers.push(newUserRecord);
      localStorage.setItem(
        "grocery_registered_users",
        JSON.stringify(registeredUsers)
      );

      const sessionUser = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        role: "customer",
        isGuest: false,
      };

      setUser(sessionUser);
      return { success: true, user: sessionUser };
    } catch (err) {
      console.error("Local registration save error:", err);
      return { success: false, message: "Unable to complete registration. Try again." };
    }
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
    isAdmin: user?.role === "admin",
    isVendor: user?.role === "vendor" || user?.role === "seller",
    isSeller: user?.role === "seller" || user?.role === "vendor" || user?.role === "admin",
    canModify: user?.role === "admin" || user?.role === "vendor" || user?.role === "seller",
    isCustomer: user?.role === "customer",
    isGuest: !!user?.isGuest,
    approvedVendors,
    addApprovedVendor,
    removeApprovedVendor,
    sendVerificationCode,
    verifyCode,
    registerVendor,
    loginSeller,
    loginCustomer,
    registerCustomer,
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
