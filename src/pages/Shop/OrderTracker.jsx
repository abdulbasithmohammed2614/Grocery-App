import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";

const ORDER_STEPS = [
  { key: "RECEIVED", label: "Order Received", desc: "Sent to the store" },
  { key: "ACCEPTED", label: "Accepted", desc: "Store confirmed your order" },
  { key: "PACKING", label: "Packing Items", desc: "Groceries being packed fresh" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", desc: "Rider is heading your way" },
  { key: "DELIVERED", label: "Delivered", desc: "Order delivered to your doorstep" },
];

const getStepIndex = (status) => {
  switch (status) {
    case "RECEIVED":
      return 0;
    case "ACCEPTED":
      return 1;
    case "PACKING":
      return 2;
    case "OUT_FOR_DELIVERY":
      return 3;
    case "DELIVERED":
      return 4;
    default:
      return 0;
  }
};

const OrderTracker = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins countdown

  // Fetch initial order
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        let orderData = null;
        try {
          const res = await fetch(`http://localhost:5000/api/orders/${orderId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.order) {
              orderData = json.order;
            }
          }
        } catch (e) {
          // Backend offline, fallback to Supabase
        }

        if (!orderData) {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .single();

          if (error) throw error;
          orderData = data;
        }

        setOrder(orderData);

        // Calculate remaining delivery time based on created_at
        if (orderData?.created_at) {
          const createdAt = new Date(orderData.created_at).getTime();
          const targetTime = createdAt + (orderData.estimated_delivery_mins || 15) * 60 * 1000;
          const remainingSecs = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
          setTimeLeft(remainingSecs);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Realtime listener for order updates
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (order?.order_status === "DELIVERED" || order?.order_status === "CANCELLED") {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.order_status]);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading order details...</span>
        </div>
        <p className="mt-3 text-muted">Tracking your order live...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "60vh" }}>
        <h3>Order not found</h3>
        <p className="text-muted">The requested order could not be located.</p>
        <Link to="/Shop" className="btn btn-success mt-3">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const currentStep = getStepIndex(order.order_status);
  const isCancelled = order.order_status === "CANCELLED";

  return (
    <div className="container py-4" style={{ maxWidth: "860px", minHeight: "80vh" }}>
      {/* FreshCart Express ETA Banner */}
      <div
        className="card border-0 shadow-sm p-4 mb-4 text-white"
        style={{
          borderRadius: "16px",
          background: isCancelled
            ? "linear-gradient(135deg, #e53935 0%, #b71c1c 100%)"
            : order.order_status === "DELIVERED"
            ? "linear-gradient(135deg, #0aad0a 0%, #088a08 100%)"
            : "linear-gradient(135deg, #10b981 0%, #047857 100%)",
        }}
      >
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <span className="badge bg-light text-dark mb-2 px-3 py-2 fw-semibold" style={{ borderRadius: "20px" }}>
              ⚡ Lightning Delivery
            </span>
            <h2 className="fw-bold mb-1">
              {isCancelled
                ? "Order Cancelled"
                : order.order_status === "DELIVERED"
                ? "Order Delivered!"
                : `Arriving in ${formatTimer(timeLeft)} mins`}
            </h2>
            <p className="mb-0 opacity-75">
              Order ID: <span className="font-monospace">#{order.id.slice(0, 8)}</span>
            </p>
          </div>
          <div className="text-end mt-3 mt-md-0">
            <span className="badge bg-white text-dark px-3 py-2 fs-6">
              Status: <span className="text-success fw-bold">{order.order_status.replace(/_/g, " ")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Order Progress Stepper */}
      {!isCancelled && (
        <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "16px" }}>
          <h5 className="fw-bold mb-4">Live Order Status</h5>
          <div className="position-relative">
            <div className="d-flex flex-column gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="d-flex align-items-start position-relative">
                    {/* Circle Indicator */}
                    <div
                      className="d-flex align-items-center justify-content-center text-white me-3 flex-shrink-0"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: isPassed ? "#0aad0a" : "#e0e0e0",
                        boxShadow: isCurrent ? "0 0 0 4px rgba(10, 173, 10, 0.25)" : "none",
                        fontWeight: "bold",
                        zIndex: 2,
                      }}
                    >
                      {isPassed ? "✓" : idx + 1}
                    </div>

                    {/* Step Info */}
                    <div className="flex-grow-1">
                      <h6
                        className={`mb-0 fw-semibold ${
                          isCurrent ? "text-success fw-bold fs-5" : isPassed ? "text-dark" : "text-muted"
                        }`}
                      >
                        {step.label}{" "}
                        {isCurrent && (
                          <span className="badge bg-success ms-2">
                            {step.key === "DELIVERED" ? "Completed" : "In Progress"}
                          </span>
                        )}
                      </h6>
                      <small className="text-muted">{step.desc}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Address & Customer Details */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px" }}>
            <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "12px", letterSpacing: "1px" }}>
              📍 Delivery Details
            </h6>
            <h6 className="fw-bold mb-1">{order.customer_name}</h6>
            <p className="text-muted mb-2">📞 {order.customer_phone}</p>
            <div className="p-3 bg-light rounded-3">
              <p className="mb-1 fw-semibold text-dark">{order.house_flat_no}, {order.apartment_area}</p>
              {order.landmark && <p className="mb-1 text-muted small">Landmark: {order.landmark}</p>}
              <p className="mb-0 text-muted small">{order.city} - {order.pincode}</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: "16px" }}>
            <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "12px", letterSpacing: "1px" }}>
              💳 Payment Summary
            </h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Payment Method</span>
              <span className="fw-bold">{order.payment_method === "COD" ? "Cash on Delivery" : "Paid Online"}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Payment Status</span>
              <span
                className={`badge ${
                  order.payment_status === "PAID" ? "bg-success" : "bg-warning text-dark"
                }`}
              >
                {order.payment_status}
              </span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Subtotal ({order.item_count} items)</span>
              <span>₹{Number(order.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Delivery Fee</span>
              <span className="text-success fw-semibold">
                {Number(order.delivery_fee) > 0 ? `₹${order.delivery_fee}` : "FREE"}
              </span>
            </div>
            <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-2 border-top">
              <span>Total Amount</span>
              <span className="text-success">₹{Number(order.total_amount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Items List */}
      <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "16px" }}>
        <h6 className="text-muted text-uppercase fw-bold mb-3" style={{ fontSize: "12px", letterSpacing: "1px" }}>
          🛒 Ordered Items ({Array.isArray(order.items) ? order.items.length : 0})
        </h6>
        <div className="table-responsive">
          <table className="table table-borderless align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(order.items) &&
                order.items.map((item, idx) => (
                  <tr key={idx} className="border-bottom">
                    <td>
                      <div className="fw-semibold text-dark">{item.name || item.title || "Grocery Item"}</div>
                      {item.unit && <small className="text-muted">{item.unit}</small>}
                    </td>
                    <td className="text-center fw-bold">{item.quantity}</td>
                    <td className="text-end text-muted">₹{Number(item.price || 0).toFixed(2)}</td>
                    <td className="text-end fw-bold">₹{(Number(item.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="text-center py-2">
        <Link to="/Shop" className="btn btn-outline-success px-4 py-2 me-2">
          ← Shop More Groceries
        </Link>
        <Link to="/seller" className="btn btn-light border px-4 py-2 text-muted">
          Open Seller View ↗
        </Link>
      </div>
    </div>
  );
};

export default OrderTracker;
