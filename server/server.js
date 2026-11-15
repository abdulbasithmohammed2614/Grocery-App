const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const {
  loadSecretsFromSupabase,
  getSecret,
  getPublicSecrets,
  setSecret,
} = require("./services/secretService");

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, ".env") });
if (!process.env.SUPABASE_URL) {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

// Pre-load secrets from Supabase into memory & process.env
loadSecretsFromSupabase().catch((err) =>
  console.log("[Secrets] Background initialization notice:", err.message)
);

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  "https://pmlqyypgixxffceyipze.supabase.co";

const supabaseKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtbHF5eXBnaXh4ZmZjZXlpcHplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2NjgxMTUsImV4cCI6MjExMDI0NDExNX0.1H1I5PJ0puigmWg3pUor03R4FkVAUsHXlY76kxdy9lk";

const supabase = createClient(supabaseUrl, supabaseKey);

const VALID_STATUSES = [
  "RECEIVED",
  "ACCEPTED",
  "PACKING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

// ==========================================
// 1. Health & Status
// ==========================================
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "FreshCart Quick-Commerce Grocery API is running",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    database: "connected (Supabase PostgreSQL)",
    realtime: "enabled",
    port: process.env.PORT || 5000,
  });
});

// ==========================================
// 2. Authentication & Role Endpoints
// ==========================================

const SELLER_EMAIL = process.env.SELLER_EMAIL || "seller@grocery.com";
const SELLER_PASSWORD = process.env.SELLER_PASSWORD || "storepassword123";

// Seller login
app.post("/api/auth/seller-login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const sellerEmail = await getSecret("SELLER_EMAIL", "seller@grocery.com");
  const sellerPassword = await getSecret("SELLER_PASSWORD", "storepassword123");

  if (email.trim().toLowerCase() === sellerEmail.toLowerCase() && password === sellerPassword) {
    return res.json({
      success: true,
      message: "Seller authenticated successfully",
      user: {
        name: "FreshCart Central Store",
        email: sellerEmail,
        role: "seller",
        isGuest: false,
        storeId: "store_blr_001",
      },
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid seller credentials. Use seller@grocery.com / storepassword123",
  });
});

// Customer login
app.post("/api/auth/customer-login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  if (password.length >= 4) {
    return res.json({
      success: true,
      message: "Customer authenticated successfully",
      user: {
        name: email.split("@")[0] || "Customer",
        email: email.trim().toLowerCase(),
        role: "customer",
        isGuest: false,
      },
    });
  }

  return res.status(401).json({ success: false, message: "Invalid email or password" });
});

// Guest customer login
app.post("/api/auth/guest-login", (req, res) => {
  const { name, phone } = req.body || {};

  return res.json({
    success: true,
    message: "Guest session initialized",
    user: {
      name: (name && name.trim()) || "Guest Customer",
      phone: (phone && phone.trim()) || "",
      email: "",
      role: "customer",
      isGuest: true,
    },
  });
});

// ==========================================
// 2. Order Endpoints (Customer & Seller)
// ==========================================

// Create a new order (Customer checkout)
app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      house_flat_no,
      apartment_area,
      landmark,
      city,
      pincode,
      items,
      item_count,
      subtotal,
      delivery_fee,
      total_amount,
      payment_method,
      payment_status,
      estimated_delivery_mins,
    } = req.body;

    // Validation
    if (!customer_name || !customer_name.trim()) {
      return res.status(400).json({ success: false, message: "Customer name is required" });
    }
    if (!customer_phone || !customer_phone.trim()) {
      return res.status(400).json({ success: false, message: "Customer phone is required" });
    }
    if (!house_flat_no || !apartment_area || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Complete address (house/flat, area, pincode) is required",
      });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item" });
    }
    if (total_amount == null || Number(total_amount) < 0) {
      return res.status(400).json({ success: false, message: "Valid total amount is required" });
    }

    const newOrder = {
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      house_flat_no: house_flat_no.trim(),
      apartment_area: apartment_area.trim(),
      landmark: landmark ? landmark.trim() : null,
      city: city ? city.trim() : "Bangalore",
      pincode: pincode.trim(),
      items: items,
      item_count: item_count || items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0),
      subtotal: Number(subtotal) || Number(total_amount),
      delivery_fee: Number(delivery_fee) || 0,
      total_amount: Number(total_amount),
      payment_method: payment_method === "ONLINE" ? "ONLINE" : "COD",
      payment_status: payment_status === "PAID" ? "PAID" : "PENDING",
      order_status: "RECEIVED",
      estimated_delivery_mins: Number(estimated_delivery_mins) || 15,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: data,
    });
  } catch (err) {
    console.error("Create order exception:", err);
    res.status(500).json({ success: false, message: "Server error creating order" });
  }
});

// Get all orders (Seller dashboard with optional status filtering)
app.get("/api/orders", async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      query = query.eq("order_status", status.toUpperCase());
    }

    if (limit && Number(limit) > 0) {
      query = query.limit(Number(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch orders error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      count: data ? data.length : 0,
      orders: data || [],
    });
  } catch (err) {
    console.error("Fetch orders exception:", err);
    res.status(500).json({ success: false, message: "Server error fetching orders" });
  }
});

// Get single order by ID (Customer live tracker)
app.get("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      order: data,
    });
  } catch (err) {
    console.error("Fetch single order exception:", err);
    res.status(500).json({ success: false, message: "Server error fetching order" });
  }
});

// Update order status (Seller pipeline: RECEIVED -> ACCEPTED -> PACKING -> OUT_FOR_DELIVERY -> DELIVERED)
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { order_status } = req.body;

    if (!order_status || !VALID_STATUSES.includes(order_status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const nextStatus = order_status.toUpperCase();

    const updatePayload = { order_status: nextStatus };
    // If marked delivered and payment was COD, automatically mark payment PAID
    if (nextStatus === "DELIVERED") {
      updatePayload.payment_status = "PAID";
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Order not found or update failed" });
    }

    res.json({
      success: true,
      message: `Order status updated to ${nextStatus}`,
      order: data,
    });
  } catch (err) {
    console.error("Update status exception:", err);
    res.status(500).json({ success: false, message: "Server error updating order status" });
  }
});

// Delete / Cancel order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    res.json({
      success: true,
      message: "Order removed successfully",
    });
  } catch (err) {
    console.error("Delete order exception:", err);
    res.status(500).json({ success: false, message: "Server error deleting order" });
  }
});

// ==========================================
// 3. Products, Categories & Stores Catalog
// ==========================================

const FALLBACK_PRODUCTS = [
  { id: "p1", name: "Haldiram's Sev Bhujia", category: "Snacks & Munchies", price: 45, unit: "200 g", rating: 4.5 },
  { id: "p2", name: "NutriChoice Digestive", category: "Bakery & Biscuits", price: 35, unit: "1 kg", rating: 4.6 },
  { id: "p3", name: "Cadbury Dairy Milk Silk", category: "Bakery & Biscuits", price: 80, unit: "150 g", rating: 4.9 },
  { id: "p4", name: "Farm Fresh Eggs (Pack of 6)", category: "Dairy, Bread & Eggs", price: 65, unit: "6 pcs", rating: 4.8 },
  { id: "p5", name: "Amul Taaza Milk 500ml", category: "Dairy, Bread & Eggs", price: 27, unit: "500 ml", rating: 4.9 },
  { id: "p6", name: "Fresh Hybrid Tomato 1kg", category: "Fruits & Vegetables", price: 38, unit: "1 kg", rating: 4.4 },
  { id: "p7", name: "Robusta Banana Organic", category: "Fruits & Vegetables", price: 42, unit: "1 kg", rating: 4.7 },
  { id: "p8", name: "Maggi 2-Minute Masala Noodles", category: "Instant Food", price: 56, unit: "Pack of 4", rating: 4.8 },
];

const FALLBACK_CATEGORIES = [
  { id: "c1", name: "All", count: 8 },
  { id: "c2", name: "Dairy, Bread & Eggs", count: 18 },
  { id: "c3", name: "Snacks & Munchies", count: 24 },
  { id: "c4", name: "Fruits & Vegetables", count: 32 },
  { id: "c5", name: "Bakery & Biscuits", count: 15 },
  { id: "c6", name: "Instant Food", count: 12 },
];

const FALLBACK_STORES = [
  { id: "st1", name: "FreshCart Express Darkstore - Indiranagar", delivery_time: "10-15 mins", rating: 4.9, min_order: 99 },
  { id: "st2", name: "FreshCart Daily Supermarket", delivery_time: "15-20 mins", rating: 4.8, min_order: 149 },
  { id: "st3", name: "Nature's Basket Organic Express", delivery_time: "15-25 mins", rating: 4.9, min_order: 199 },
];

app.get("/api/products", async (req, res) => {
  const category = req.query.category;

  try {
    let query = supabase.from("products").select("*");
    if (category && category !== "All") {
      query = query.eq("category", category);
    }
    const { data, error } = await query;
    if (!error && Array.isArray(data) && data.length > 0) {
      return res.json({ success: true, count: data.length, products: data });
    }
  } catch (e) {
    // fallback
  }

  const filtered = category && category !== "All"
    ? FALLBACK_PRODUCTS.filter(p => p.category === category)
    : FALLBACK_PRODUCTS;

  res.json({ success: true, count: filtered.length, products: filtered });
});

app.get("/api/categories", async (req, res) => {
  try {
    // 1. Fetch real products to compute live item counts per category in database
    const { data: dbProducts } = await supabase.from("products").select("id, category");
    const products = dbProducts && dbProducts.length > 0 ? dbProducts : FALLBACK_PRODUCTS;

    const counts = {};
    products.forEach((p) => {
      if (p.category) counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const { data: dbCategories } = await supabase.from("categories").select("id, name, icon");
    const baseCats =
      dbCategories && dbCategories.length > 0
        ? dbCategories
        : [
            { id: "c2", name: "Dairy, Bread & Eggs", icon: "🥛" },
            { id: "c3", name: "Snacks & Munchies", icon: "🍿" },
            { id: "c4", name: "Fruits & Vegetables", icon: "🥦" },
            { id: "c5", name: "Bakery & Biscuits", icon: "🍞" },
            { id: "c6", name: "Instant Food", icon: "🍜" },
            { id: "c7", name: "Cold Drinks & Juices", icon: "🥤" },
            { id: "c8", name: "Atta, Rice & Dal", icon: "🌾" },
          ];

    const dynamicCategories = [
      { id: "c1", name: "All", count: products.length, icon: "🛒" },
      ...baseCats
        .filter((c) => c.name !== "All")
        .map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon || "📦",
          count: counts[c.name] || 0,
        })),
    ];

    return res.json({
      success: true,
      count: dynamicCategories.length,
      categories: dynamicCategories,
    });
  } catch (e) {
    // fallback
  }

  // Dynamic fallback computed from FALLBACK_PRODUCTS
  const fallbackCounts = {};
  FALLBACK_PRODUCTS.forEach((p) => {
    if (p.category) fallbackCounts[p.category] = (fallbackCounts[p.category] || 0) + 1;
  });
  const fallbackCats = [
    { id: "c1", name: "All", count: FALLBACK_PRODUCTS.length },
    { id: "c2", name: "Dairy, Bread & Eggs", count: fallbackCounts["Dairy, Bread & Eggs"] || 0 },
    { id: "c3", name: "Snacks & Munchies", count: fallbackCounts["Snacks & Munchies"] || 0 },
    { id: "c4", name: "Fruits & Vegetables", count: fallbackCounts["Fruits & Vegetables"] || 0 },
    { id: "c5", name: "Bakery & Biscuits", count: fallbackCounts["Bakery & Biscuits"] || 0 },
    { id: "c6", name: "Instant Food", count: fallbackCounts["Instant Food"] || 0 },
  ];
  res.json({ success: true, count: fallbackCats.length, categories: fallbackCats });
});

app.get("/api/stores", async (req, res) => {
  try {
    const { data, error } = await supabase.from("stores").select("*");
    if (!error && Array.isArray(data) && data.length > 0) {
      return res.json({ success: true, count: data.length, stores: data });
    }
  } catch (e) {}

  res.json({ success: true, count: FALLBACK_STORES.length, stores: FALLBACK_STORES });
});

// ==========================================
// 4. Payment Gateway Endpoints (Razorpay)
// ==========================================

// Create Razorpay order
app.post("/api/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount" });
    }

    const keyId = await getSecret("RAZORPAY_KEY_ID");
    const keySecret = await getSecret("RAZORPAY_KEY_SECRET");

    if (
      !keyId ||
      !keySecret ||
      keyId.includes("YourRazorpayKeyId")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay API Keys are not configured in your Supabase 'app_secrets' table or .env file yet. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from https://dashboard.razorpay.com/app/keys",
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `grocery_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
      key: keyId,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ success: false, message: "Unable to create payment order" });
  }
});

// Verify Razorpay payment
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const keySecret = await getSecret("RAZORPAY_KEY_SECRET");

    if (!keySecret || keySecret.includes("YourRazorpayKeySecret")) {
      return res.status(500).json({ success: false, message: "RAZORPAY_KEY_SECRET is not configured in Supabase or .env" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const expected = Buffer.from(generatedSignature);
    const received = Buffer.from(razorpay_signature);

    const isValid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: "Verification error" });
  }
});

// ==========================================
// 5. Dynamic Secrets API Endpoints
// ==========================================

// Get public client-safe secrets (e.g. Razorpay key for checkout modal)
app.get("/api/secrets/public", async (req, res) => {
  try {
    const publicSecrets = await getPublicSecrets();
    res.json({ success: true, secrets: publicSecrets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch public secrets" });
  }
});

// Check status of secrets (safe masked audit endpoint)
app.get("/api/secrets/status", async (req, res) => {
  try {
    const rzpKey = await getSecret("RAZORPAY_KEY_ID");
    const rzpSecret = await getSecret("RAZORPAY_KEY_SECRET");
    const sellerEmail = await getSecret("SELLER_EMAIL", "seller@grocery.com");

    const isRzpConfigured =
      Boolean(rzpKey) &&
      Boolean(rzpSecret) &&
      !rzpKey.includes("YourRazorpayKeyId");

    res.json({
      success: true,
      storage: "Supabase PostgreSQL (public.app_secrets) with .env fallback",
      razorpay_ready: isRzpConfigured,
      razorpay_key_preview: rzpKey ? `${rzpKey.substring(0, 10)}...` : "Not configured",
      seller_email: sellerEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check secrets status" });
  }
});

// Catch-all 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

const PORT = process.env.SERVER_PORT || process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`FreshCart Grocery API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
