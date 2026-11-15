import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { supabase } from "../../supabaseClient";
import { playOrderChime } from "../../utils/audioAlert";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/apiConfig";
import {
  fetchProductsFromDb,
  addProductToDb,
  updateProductInDb,
  deleteProductFromDb,
} from "../../services/dataService";

const STATUS_CONFIG = {
  RECEIVED: { label: "New Order", color: "warning", next: "ACCEPTED", nextLabel: "Accept Order", nextIcon: "✓" },
  ACCEPTED: { label: "Accepted", color: "info", next: "PACKING", nextLabel: "Start Packing", nextIcon: "📦" },
  PACKING: { label: "Packing Items", color: "primary", next: "OUT_FOR_DELIVERY", nextLabel: "Out for Delivery", nextIcon: "🛵" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "purple", next: "DELIVERED", nextLabel: "Mark Delivered", nextIcon: "✅" },
  DELIVERED: { label: "Delivered", color: "success", next: null },
  CANCELLED: { label: "Cancelled", color: "danger", next: null },
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    logout,
    isAdmin,
    canModify,
    approvedVendors,
    addApprovedVendor,
    removeApprovedVendor,
  } = useAuth();

  // Active top-level tab: "orders" | "products" | "vendors"
  const [activeTab, setActiveTab] = useState("orders");

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("ACTIVE"); // ACTIVE, ALL, NEW, DELIVERED
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderNotice, setNewOrderNotice] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    category: "Dairy, Bread & Eggs",
    price: "",
    old_price: "",
    unit: "1 pc",
    badge: "Sale",
  });
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // New Vendor Form State (Strictly Admin Only)
  const [vendorForm, setVendorForm] = useState({
    name: "",
    storeName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [vendorFormError, setVendorFormError] = useState("");
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);

  // Fetch all orders on load
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading seller orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch products for modification
  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const list = await fetchProductsFromDb("All");
      setProducts(list);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    loadProducts();

    // Supabase Realtime Subscription for orders
    const channel = supabase
      .channel("seller-orders-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const newOrder = payload.new;
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

          if (soundEnabled) {
            playOrderChime();
          }

          setNewOrderNotice(newOrder);
          setTimeout(() => setNewOrderNotice(null), 8000);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const updated = payload.new;
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, loadProducts, soundEnabled]);

  // Update order status handler
  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!canModify) {
      alert("Unauthorized: Only vendors and administrators can modify orders.");
      return;
    }

    try {
      let updatedViaApi = false;
      try {
        const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_status: newStatus }),
        });
        const cType = res.headers.get("content-type") || "";
        if (res.ok && cType.includes("application/json")) {
          const data = await res.json();
          if (data.success && data.order) {
            updatedViaApi = true;
            setOrders((prev) =>
              prev.map((o) => (o.id === orderId ? data.order : o))
            );
          }
        }
      } catch (e) { }

      if (!updatedViaApi) {
        const updatePayload = { order_status: newStatus };
        if (newStatus === "DELIVERED") {
          updatePayload.payment_status = "PAID";
        }
        const { error } = await supabase
          .from("orders")
          .update(updatePayload)
          .eq("id", orderId);

        if (error) throw error;

        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, ...updatePayload } : o))
        );
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Product Modification Handlers
  const handleQuickPriceUpdate = async (productId, currentPrice) => {
    if (!canModify) {
      alert("Unauthorized: Only vendors and admins can modify products.");
      return;
    }

    const newPriceStr = prompt("Enter new price (₹):", currentPrice);
    if (newPriceStr === null) return;

    const newPrice = Number(newPriceStr);
    if (isNaN(newPrice) || newPrice <= 0) {
      alert("Please enter a valid positive price.");
      return;
    }

    await updateProductInDb(productId, { price: newPrice });
    await loadProducts();
    Swal.fire({
      icon: "success",
      title: "Price Updated",
      text: `Price set to ₹${newPrice.toFixed(2)}`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleToggleBadge = async (productId, currentBadge) => {
    if (!canModify) return;
    const badges = ["Sale", "Hot", "Fresh", "Bestseller", "Organic", "New"];
    const nextIdx = (badges.indexOf(currentBadge) + 1) % badges.length;
    const nextBadge = badges[nextIdx];

    await updateProductInDb(productId, { badge: nextBadge });
    await loadProducts();
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!canModify) return;
    if (!window.confirm(`Are you sure you want to delete '${productName}' from the store catalog?`)) {
      return;
    }

    await deleteProductFromDb(productId);
    await loadProducts();
    Swal.fire({
      icon: "success",
      title: "Product Deleted",
      text: `${productName} was removed from the catalog.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    if (!canModify) return;

    if (!newProductForm.name.trim() || !newProductForm.price) {
      alert("Please enter a valid product name and price.");
      return;
    }

    await addProductToDb({
      name: newProductForm.name.trim(),
      category: newProductForm.category,
      price: Number(newProductForm.price),
      old_price: Number(newProductForm.old_price || newProductForm.price),
      unit: newProductForm.unit,
      badge: newProductForm.badge,
    });

    setShowAddProductModal(false);
    setNewProductForm({
      name: "",
      category: "Dairy, Bread & Eggs",
      price: "",
      old_price: "",
      unit: "1 pc",
      badge: "Sale",
    });

    await loadProducts();
    Swal.fire({
      icon: "success",
      title: "Product Added",
      text: "New grocery item added to the store catalog.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Vendor Whitelist Handlers (Strictly Admin Only)
  const handleAddVendorSubmit = async (e) => {
    e.preventDefault();
    setVendorFormError("");

    if (!isAdmin) {
      setVendorFormError("Unauthorized: Only platform Administrators can authorize and add vendors.");
      return;
    }

    const res = await addApprovedVendor(vendorForm);

    if (res.success) {
      setShowAddVendorModal(false);
      setVendorForm({
        name: "",
        storeName: "",
        email: "",
        phone: "",
        password: "",
      });

      Swal.fire({
        icon: "success",
        title: "Vendor Authorized!",
        text: res.message,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setVendorFormError(res.message);
    }
  };

  const handleRemoveVendor = async (vendorId, storeName) => {
    if (!isAdmin) {
      alert("Unauthorized: Only platform Administrators can revoke vendor permissions.");
      return;
    }

    if (!window.confirm(`Revoke vendor authorization for '${storeName}'? They will no longer be able to log in or manage orders.`)) {
      return;
    }

    const res = await removeApprovedVendor(vendorId);
    if (res.success) {
      Swal.fire({
        icon: "success",
        title: "Vendor Revoked",
        text: res.message,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "NEW") return order.order_status === "RECEIVED";
    if (orderFilter === "ACTIVE")
      return ["RECEIVED", "ACCEPTED", "PACKING", "OUT_FOR_DELIVERY"].includes(order.order_status);
    if (orderFilter === "DELIVERED") return order.order_status === "DELIVERED";
    return true;
  });

  // Filtered products list
  const filteredProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.badge || "").toLowerCase().includes(q)
    );
  });

  // Analytics calculation
  const totalOrders = orders.length;
  const newOrdersCount = orders.filter((o) => o.order_status === "RECEIVED").length;
  const inProgressCount = orders.filter((o) =>
    ["ACCEPTED", "PACKING", "OUT_FOR_DELIVERY"].includes(o.order_status)
  ).length;
  const deliveredCount = orders.filter((o) => o.order_status === "DELIVERED").length;
  const totalRevenue = orders
    .filter((o) => o.order_status === "DELIVERED")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  return (
    <div className="bg-light py-4" style={{ minHeight: "100vh" }}>
      <div className="container-fluid px-lg-5">
        {/* Floating New Order Banner */}
        {newOrderNotice && (
          <div
            className="alert alert-warning border-2 border-warning shadow-lg d-flex align-items-center justify-content-between position-fixed top-0 start-50 translate-middle-x mt-4"
            style={{ zIndex: 1050, minWidth: "350px", borderRadius: "12px" }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="fs-3">🔔</span>
              <div>
                <h6 className="mb-0 fw-bold">New Order Received!</h6>
                <small>
                  {newOrderNotice.customer_name} • ₹{Number(newOrderNotice.total_amount).toFixed(2)}
                </small>
              </div>
            </div>
            <button
              className="btn-close"
              onClick={() => setNewOrderNotice(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Top Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 bg-white p-3 p-md-4 rounded-4 shadow-sm">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h3 className="fw-bold mb-0 text-dark">
                {isAdmin ? "🛡️ Platform Administration" : `🏪 ${user?.storeName || user?.name || "Vendor Store Portal"}`}
              </h3>
              {isAdmin ? (
                <span className="badge bg-danger fs-6 px-3 py-1 rounded-pill">
                  SuperAdmin
                </span>
              ) : (
                <span className="badge bg-success fs-6 px-3 py-1 rounded-pill">
                  Verified Vendor
                </span>
              )}
            </div>
            <p className="text-muted mb-0 small">
              Account: <strong className="text-dark font-monospace">{user?.email}</strong> &bull;
              Role: <strong className="text-capitalize">{user?.role}</strong> &bull;
              Permissions: <span className="text-success fw-semibold">Can Modify Products &amp; Orders</span>
              {isAdmin && <span className="text-danger fw-semibold ms-2">&bull; Can Add Vendors</span>}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`btn btn-sm ${soundEnabled ? "btn-outline-success" : "btn-outline-secondary"}`}
              title="Toggle audio alert"
            >
              {soundEnabled ? "🔔 Chime: ON" : "🔕 Chime: OFF"}
            </button>
            <button onClick={fetchOrders} className="btn btn-sm btn-primary">
              ↻ Refresh
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/seller/login");
              }}
              className="btn btn-sm btn-outline-danger fw-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Orders / Products / Vendor Management) */}
        <div className="d-flex gap-2 mb-4 bg-white p-2 rounded-4 shadow-sm border overflow-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`btn px-4 py-2 rounded-pill fw-bold transition-all ${activeTab === "orders" ? "btn-dark shadow" : "btn-light text-muted"
              }`}
          >
            📦 Live Orders &amp; Fulfillment ({newOrdersCount + inProgressCount})
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`btn px-4 py-2 rounded-pill fw-bold transition-all ${activeTab === "products" ? "btn-dark shadow" : "btn-light text-muted"
              }`}
          >
            🏷️ Modify Products &amp; Inventory ({products.length})
          </button>

          <button
            onClick={() => setActiveTab("vendors")}
            className={`btn px-4 py-2 rounded-pill fw-bold transition-all ${activeTab === "vendors" ? "btn-danger shadow text-white" : "btn-light text-muted"
              }`}
          >
            👥 Whitelist &amp; Vendor Management ({approvedVendors.length})
            {isAdmin ? (
              <span className="badge bg-white text-danger ms-2">Admin</span>
            ) : (
              <span className="badge bg-secondary ms-2">View Only</span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LIVE ORDERS & FULFILLMENT                                          */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div>
            {/* Metrics Overview Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                  <small className="text-muted fw-bold text-uppercase">New Incoming</small>
                  <h3 className="fw-bold text-warning mb-0">{newOrdersCount}</h3>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                  <small className="text-muted fw-bold text-uppercase">In Progress</small>
                  <h3 className="fw-bold text-primary mb-0">{inProgressCount}</h3>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                  <small className="text-muted fw-bold text-uppercase">Delivered</small>
                  <h3 className="fw-bold text-success mb-0">{deliveredCount}</h3>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card border-0 shadow-sm p-3 rounded-4 bg-white">
                  <small className="text-muted fw-bold text-uppercase">Total Fulfilled</small>
                  <h3 className="fw-bold text-dark mb-0">₹{totalRevenue.toFixed(0)}</h3>
                </div>
              </div>
            </div>

            {/* Filter Navigation Tabs */}
            <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
              {[
                { key: "ACTIVE", label: `Active Orders (${newOrdersCount + inProgressCount})` },
                { key: "NEW", label: `New Orders (${newOrdersCount})` },
                { key: "DELIVERED", label: `Delivered (${deliveredCount})` },
                { key: "ALL", label: `All Orders (${totalOrders})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setOrderFilter(tab.key)}
                  className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${orderFilter === tab.key ? "btn-dark shadow-sm" : "btn-white bg-white text-muted border"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Orders List Feed */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Listening for live store orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
                <span className="fs-1 d-block mb-2">📦</span>
                <h5 className="fw-bold">No orders found in this view</h5>
                <p className="text-muted small">New customer orders will appear here in real-time.</p>
              </div>
            ) : (
              <div className="row g-3">
                {filteredOrders.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.order_status] || {
                    label: order.order_status,
                    color: "secondary",
                  };

                  return (
                    <div key={order.id} className="col-12 col-xl-6">
                      <div className="card border-0 shadow-sm rounded-4 h-100 p-4 bg-white">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className={`badge bg-${statusCfg.color} px-3 py-2 fw-semibold`}>
                                {statusCfg.label}
                              </span>
                              <span className="small text-muted font-monospace">
                                #{order.id.slice(0, 8)}
                              </span>
                            </div>
                            <h5 className="fw-bold text-dark mb-0">{order.customer_name}</h5>
                            <small className="text-muted">📞 {order.customer_phone}</small>
                          </div>

                          <div className="text-end">
                            <span className="badge bg-light text-dark border">
                              {order.payment_method === "ONLINE" ? "💳 Online Paid" : "💵 Cash on Delivery"}
                            </span>
                            <div className="small text-muted mt-1">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                                : "Just now"}
                            </div>
                          </div>
                        </div>

                        {/* Delivery Address Details */}
                        <div className="p-3 bg-light rounded-3 mb-3 small">
                          <strong className="text-dark d-block">📍 Delivery Address:</strong>
                          <div>{order.house_flat_no}, {order.apartment_area}</div>
                          {order.landmark && <div className="text-muted">Landmark: {order.landmark}</div>}
                          <div>{order.city} - {order.pincode}</div>
                        </div>

                        {/* Ordered Items Summary */}
                        <div className="mb-3">
                          <strong className="small text-muted text-uppercase mb-2 d-block">
                            Ordered Groceries ({order.items?.length || order.item_count || 0} items):
                          </strong>
                          <ul className="list-group list-group-flush small">
                            {(order.items || []).map((it, idx) => (
                              <li
                                key={idx}
                                className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center bg-transparent"
                              >
                                <div>
                                  <span className="fw-bold text-dark">{it.quantity}x</span> {it.name}
                                  {it.unit && <small className="text-muted ms-1">({it.unit})</small>}
                                </div>
                                <span className="fw-semibold">
                                  ₹{(Number(it.price || 0) * it.quantity).toFixed(2)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Amount & Status Action Buttons */}
                        <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                          <div>
                            <div className="small text-muted">Total Amount</div>
                            <div className="fs-5 fw-bold text-success">
                              ₹{Number(order.total_amount || 0).toFixed(2)}
                            </div>
                          </div>

                          <div className="d-flex gap-2">
                            {statusCfg.next && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, statusCfg.next)}
                                className="btn btn-success fw-bold px-3 py-2"
                                style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                              >
                                {statusCfg.nextIcon} {statusCfg.nextLabel}
                              </button>
                            )}

                            {order.order_status !== "CANCELLED" &&
                              order.order_status !== "DELIVERED" && (
                                <button
                                  onClick={() => {
                                    if (window.confirm("Cancel this order?")) {
                                      handleUpdateStatus(order.id, "CANCELLED");
                                    }
                                  }}
                                  className="btn btn-outline-danger btn-sm px-2"
                                >
                                  Cancel
                                </button>
                              )}

                            <Link
                              to={`/order-track/${order.id}`}
                              target="_blank"
                              className="btn btn-light border btn-sm px-2"
                            >
                              Track ↗
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MODIFY PRODUCTS & INVENTORY (Vendors & Admins Only)                 */}
        {/* ========================================================================= */}
        {activeTab === "products" && (
          <div>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 bg-white p-3 rounded-4 shadow-sm">
              <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ maxWidth: "450px" }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search products by name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="btn btn-success fw-bold px-3 py-2 rounded-pill shadow-sm"
                  style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                >
                  ➕ Add New Grocery Item
                </button>
              </div>
            </div>

            {/* Products Table */}
            {productsLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted">Loading products catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="card border-0 shadow-sm p-5 text-center rounded-4 bg-white">
                <span className="fs-1 d-block mb-2">🍎</span>
                <h5 className="fw-bold">No products match search</h5>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="py-3 px-4">Item Name</th>
                        <th>Category</th>
                        <th>Price (₹)</th>
                        <th>Unit</th>
                        <th>Badge / Stock</th>
                        <th className="text-end px-4">Modify Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id}>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center gap-3">
                              {p.image && (
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  style={{ width: "40px", height: "40px", objectFit: "contain" }}
                                  className="rounded"
                                />
                              )}
                              <div>
                                <strong className="d-block text-dark">{p.name}</strong>
                                <small className="text-muted font-monospace">{p.id}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">
                              {p.category}
                            </span>
                          </td>
                          <td>
                            <span className="fw-bold text-success fs-6">
                              ₹{Number(p.price || 0).toFixed(2)}
                            </span>
                            {p.old_price && p.old_price > p.price && (
                              <small className="text-muted text-decoration-line-through ms-2">
                                ₹{p.old_price}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="text-muted small">{p.unit || "1 unit"}</span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleBadge(p.id, p.badge || "Sale")}
                              className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-pill small"
                              title="Click to change badge"
                            >
                              🏷️ {p.badge || "Sale"}
                            </button>
                          </td>
                          <td className="text-end px-4">
                            <button
                              onClick={() => handleQuickPriceUpdate(p.id, p.price)}
                              className="btn btn-sm btn-outline-primary me-2"
                              title="Modify Price"
                            >
                              ✏️ Edit Price
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete Product"
                            >
                              🗑️ Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APPROVED VENDORS WHITELIST (Only Admins Can Add/Revoke Vendors)      */}
        {/* ========================================================================= */}
        {activeTab === "vendors" && (
          <div>
            {/* Admin Policy Notice */}
            <div className={`alert ${isAdmin ? "alert-success" : "alert-warning"} rounded-4 p-4 mb-4 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3`}>
              <div>
                <h5 className="fw-bold mb-1">
                  {isAdmin ? "🛡️ Vendor Authorization & Whitelist Directory (Admin Mode)" : "🔒 Vendor Directory (Read-Only for Vendors)"}
                </h5>
                <p className="mb-0 small text-muted">
                  {isAdmin
                    ? "As an Administrator, you have exclusive authorization to add new vendors and stores to the approved vendor whitelist."
                    : "Only Platform Administrators have permissions to whitelist or add new vendors to the platform. Regular vendors and customers cannot add vendors."}
                </p>
              </div>

              {isAdmin ? (
                <button
                  onClick={() => setShowAddVendorModal(true)}
                  className="btn btn-danger fw-bold px-4 py-2 rounded-pill shadow-sm"
                >
                  ➕ Authorize New Vendor
                </button>
              ) : (
                <span className="badge bg-secondary p-2">
                  🔒 Admin Authorization Required to Add Vendors
                </span>
              )}
            </div>

            {/* Approved Vendors Table */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3 px-4">Store / Brand Name</th>
                      <th>Authorized Email</th>
                      <th>Manager Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Authorized By</th>
                      <th className="text-end px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedVendors.map((vnd) => (
                      <tr key={vnd.id}>
                        <td className="py-3 px-4">
                          <strong className="d-block text-dark">🏪 {vnd.storeName}</strong>
                          <small className="text-muted font-monospace">{vnd.id}</small>
                        </td>
                        <td>
                          <span className="font-monospace text-primary fw-bold">
                            {vnd.email}
                          </span>
                        </td>
                        <td>{vnd.name}</td>
                        <td>{vnd.phone || "—"}</td>
                        <td>
                          <span className="badge bg-success-subtle text-success fw-semibold px-2 py-1">
                            ✓ {vnd.status || "APPROVED"}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">{vnd.addedBy || "admin@grocery.com"}</small>
                        </td>
                        <td className="text-end px-4">
                          {isAdmin ? (
                            <button
                              onClick={() => handleRemoveVendor(vnd.id, vnd.storeName)}
                              className="btn btn-sm btn-outline-danger"
                              title="Revoke vendor access"
                            >
                              Revoke Access
                            </button>
                          ) : (
                            <span className="text-muted small">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: ADD NEW GROCERY PRODUCT (Vendors & Admins)                          */}
        {/* ========================================================================= */}
        {showAddProductModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom">
                  <h5 className="modal-title fw-bold">➕ Add New Grocery Item</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddProductModal(false)}
                  />
                </div>
                <form onSubmit={handleAddProductSubmit}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Item Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Organic Brown Bread"
                        value={newProductForm.name}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select
                        className="form-select"
                        value={newProductForm.category}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, category: e.target.value })
                        }
                      >
                        <option value="Dairy, Bread & Eggs">Dairy, Bread & Eggs</option>
                        <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                        <option value="Snacks & Munchies">Snacks & Munchies</option>
                        <option value="Bakery & Biscuits">Bakery & Biscuits</option>
                        <option value="Instant Food">Instant Food</option>
                        <option value="Cold Drinks & Juices">Cold Drinks & Juices</option>
                        <option value="Atta, Rice & Dal">Atta, Rice & Dal</option>
                      </select>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Selling Price (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="45"
                          value={newProductForm.price}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, price: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">MRP (₹)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="55"
                          value={newProductForm.old_price}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, old_price: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Unit / Weight</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 500 g or 1 pc"
                          value={newProductForm.unit}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, unit: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Badge</label>
                        <select
                          className="form-select"
                          value={newProductForm.badge}
                          onChange={(e) =>
                            setNewProductForm({ ...newProductForm, badge: e.target.value })
                          }
                        >
                          <option value="Sale">Sale</option>
                          <option value="Fresh">Fresh</option>
                          <option value="Hot">Hot</option>
                          <option value="Organic">Organic</option>
                          <option value="Bestseller">Bestseller</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-top">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowAddProductModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success fw-bold px-4">
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL: AUTHORIZE NEW VENDOR (Strictly Admin Only)                         */}
        {/* ========================================================================= */}
        {showAddVendorModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow">
                <div className="modal-header border-bottom bg-danger text-white rounded-top-4">
                  <h5 className="modal-title fw-bold">🛡️ Authorize New Vendor (Admin Only)</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowAddVendorModal(false)}
                  />
                </div>

                <form onSubmit={handleAddVendorSubmit}>
                  <div className="modal-body p-4">
                    {vendorFormError && (
                      <div className="alert alert-danger small py-2 px-3 mb-3">
                        ⚠️ {vendorFormError}
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Store / Merchant Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Green Valley Farm Produce"
                        value={vendorForm.storeName}
                        onChange={(e) =>
                          setVendorForm({ ...vendorForm, storeName: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Authorized Vendor Email <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="vendor@example.com"
                        value={vendorForm.email}
                        onChange={(e) =>
                          setVendorForm({ ...vendorForm, email: e.target.value })
                        }
                        required
                      />
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        The vendor must use this exact email when signing in or registering.
                      </small>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Contact Person</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Anand Kumar"
                          value={vendorForm.name}
                          onChange={(e) =>
                            setVendorForm({ ...vendorForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-semibold text-muted">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="e.g. 9876543210"
                          value={vendorForm.phone}
                          onChange={(e) =>
                            setVendorForm({ ...vendorForm, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-muted">
                        Initial Access Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        placeholder="e.g. vendor123"
                        value={vendorForm.password}
                        onChange={(e) =>
                          setVendorForm({ ...vendorForm, password: e.target.value })
                        }
                        required
                      />
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        Vendor can sign in immediately using this password.
                      </small>
                    </div>
                  </div>

                  <div className="modal-footer border-top">
                    <button
                      type="button"
                      className="btn btn-light"
                      onClick={() => setShowAddVendorModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger fw-bold px-4">
                      Whitelist Vendor
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
