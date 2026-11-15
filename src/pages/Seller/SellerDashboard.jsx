import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { playOrderChime } from "../../utils/audioAlert";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../utils/apiConfig";

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
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ACTIVE"); // ACTIVE, ALL, NEW, DELIVERED
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderNotice, setNewOrderNotice] = useState(null);

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

  useEffect(() => {
    fetchOrders();

    // Supabase Realtime Subscription
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

          // Show floating visual alert banner
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
  }, [fetchOrders, soundEnabled]);

  // Update status handler
  const handleUpdateStatus = async (orderId, newStatus) => {
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
      } catch (e) {
        // Backend offline, fallback to direct Supabase
      }

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

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    if (filter === "NEW") return order.order_status === "RECEIVED";
    if (filter === "ACTIVE")
      return ["RECEIVED", "ACCEPTED", "PACKING", "OUT_FOR_DELIVERY"].includes(order.order_status);
    if (filter === "DELIVERED") return order.order_status === "DELIVERED";
    return true; // "ALL"
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

        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 bg-white p-3 rounded-4 shadow-sm">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="fw-bold mb-0 text-dark">🏪 {user?.name || "Store Fulfillment Dashboard"}</h3>
              <span className="badge bg-success">Live Orders</span>
            </div>
            <p className="text-muted mb-0 small">
              Store Account: <span className="font-monospace text-dark">{user?.email || "seller@grocery.com"}</span> • Status: <span className="text-success fw-semibold">Open for Delivery</span>
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (!soundEnabled) playOrderChime();
              }}
              className={`btn btn-sm ${soundEnabled ? "btn-outline-success" : "btn-outline-secondary"}`}
              title="Toggle audio alert"
            >
              {soundEnabled ? "🔔 Sound: ON" : "🔕 Sound: OFF"}
            </button>
            <button
              onClick={() => playOrderChime()}
              className="btn btn-sm btn-light border"
              title="Test audio chime"
            >
              🔊 Test Sound
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
              🚪 Logout (Seller)
            </button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4">
              <small className="text-muted fw-bold text-uppercase">New Incoming</small>
              <h3 className="fw-bold text-warning mb-0">{newOrdersCount}</h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4">
              <small className="text-muted fw-bold text-uppercase">In Progress</small>
              <h3 className="fw-bold text-primary mb-0">{inProgressCount}</h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4">
              <small className="text-muted fw-bold text-uppercase">Delivered</small>
              <h3 className="fw-bold text-success mb-0">{deliveredCount}</h3>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm p-3 rounded-4">
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
              onClick={() => setFilter(tab.key)}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${
                filter === tab.key ? "btn-dark shadow-sm" : "btn-white bg-white text-muted border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted">Listening for incoming orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card border-0 shadow-sm p-5 text-center rounded-4">
            <div className="fs-1 mb-2">📦</div>
            <h5 className="fw-bold">No orders found in this view</h5>
            <p className="text-muted small">
              When a customer places an order on the grocery app, it will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.order_status] || {
                label: order.order_status,
                color: "secondary",
                next: null,
              };

              const isCOD = order.payment_method === "COD";
              const isPaid = order.payment_status === "PAID";
              const orderTime = order.created_at
                ? new Date(order.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Just now";

              return (
                <div key={order.id} className="col-12 col-xl-6">
                  <div
                    className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
                    style={{
                      borderLeft:
                        order.order_status === "RECEIVED"
                          ? "6px solid #ffc107"
                          : order.order_status === "OUT_FOR_DELIVERY"
                          ? "6px solid #6f42c1"
                          : order.order_status === "DELIVERED"
                          ? "6px solid #0aad0a"
                          : "6px solid #0d6efd",
                    }}
                  >
                    {/* Order Card Header */}
                    <div className="p-3 bg-white border-bottom d-flex justify-content-between align-items-center">
                      <div>
                        <span className="font-monospace fw-bold text-dark">
                          #{order.id.slice(0, 8)}
                        </span>
                        <span className="text-muted small ms-2">🕒 {orderTime}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {isPaid && <span className="badge bg-success-subtle text-success">Paid</span>}
                        <span className={`badge bg-${statusCfg.color} px-3 py-2 rounded-pill`}>
                          {statusCfg.label}
                        </span>
                      </div>
                    </div>

                    {/* Order Body */}
                    <div className="p-4">
                      {/* Customer & Delivery Address Highlight */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <h6 className="text-muted text-uppercase small fw-bold mb-1">
                            Customer Details
                          </h6>
                          <div className="fw-bold text-dark fs-6">{order.customer_name}</div>
                          <a
                            href={`tel:${order.customer_phone}`}
                            className="btn btn-sm btn-outline-success mt-1 py-1 px-2 d-inline-flex align-items-center gap-1"
                          >
                            📞 {order.customer_phone}
                          </a>
                        </div>

                        <div className="col-md-6">
                          <h6 className="text-muted text-uppercase small fw-bold mb-1">
                            📍 Delivery Address
                          </h6>
                          <div className="p-2 bg-light rounded-3 small">
                            <div className="fw-semibold text-dark">
                              {order.house_flat_no}, {order.apartment_area}
                            </div>
                            {order.landmark && (
                              <div className="text-muted">Landmark: {order.landmark}</div>
                            )}
                            <div className="text-muted">
                              {order.city} - <span className="fw-bold">{order.pincode}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className="border rounded-3 p-3 bg-white mb-3">
                        <div className="d-flex justify-content-between text-muted small fw-bold border-bottom pb-2 mb-2">
                          <span>ITEMS ({Array.isArray(order.items) ? order.items.length : 0})</span>
                          <span>QTY</span>
                        </div>
                        <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                          {Array.isArray(order.items) &&
                            order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between align-items-center py-1 text-dark small"
                              >
                                <div>
                                  <span className="fw-semibold">
                                    {item.name || item.title || "Item"}
                                  </span>
                                  {item.unit && (
                                    <span className="text-muted ms-1">({item.unit})</span>
                                  )}
                                </div>
                                <span className="badge bg-light text-dark border fw-bold px-2">
                                  × {item.quantity}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Payment & Total Amount */}
                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 mb-3">
                        <div>
                          <div className="small text-muted">Payment Type</div>
                          <div className="fw-bold">
                            {isCOD ? (
                              <span className="text-danger">💵 COD (Collect Cash)</span>
                            ) : (
                              <span className="text-success">💳 Paid Online (Razorpay)</span>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">Total Payable</div>
                          <div className="fs-5 fw-bold text-success">
                            ₹{Number(order.total_amount || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="d-flex gap-2 justify-content-end pt-2 border-top">
                        {statusCfg.next && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, statusCfg.next)}
                            className="btn btn-success fw-bold px-4 py-2"
                            style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                          >
                            {statusCfg.nextIcon} {statusCfg.nextLabel}
                          </button>
                        )}

                        {order.order_status !== "CANCELLED" &&
                          order.order_status !== "DELIVERED" && (
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to cancel this order?")) {
                                  handleUpdateStatus(order.id, "CANCELLED");
                                }
                              }}
                              className="btn btn-outline-danger btn-sm px-3"
                            >
                              Cancel Order
                            </button>
                          )}

                        <Link
                          to={`/order-track/${order.id}`}
                          target="_blank"
                          className="btn btn-light border btn-sm px-3"
                          title="View customer tracking page"
                        >
                          Customer View ↗
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
    </div>
  );
};

export default SellerDashboard;
