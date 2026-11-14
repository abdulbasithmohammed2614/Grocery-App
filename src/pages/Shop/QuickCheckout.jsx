import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const QuickCheckout = () => {
  const navigate = useNavigate();
  const { cartItems, cartCount, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    customer_name: user?.name || "",
    customer_phone: user?.phone || "",
    house_flat_no: "",
    apartment_area: "",
    landmark: "",
    city: "Bangalore",
    pincode: "",
    payment_method: "COD", // "COD" or "ONLINE"
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  // Pricing calculations
  const subtotal = cartTotal;
  const deliveryFee = subtotal > 199 || subtotal === 0 ? 0 : 25;
  const handlingFee = subtotal > 0 ? 3 : 0;
  const totalAmount = subtotal + deliveryFee + handlingFee;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setErrorMsg("Your cart is empty. Please add items before placing an order.");
      return;
    }

    if (!formData.customer_name.trim() || !formData.customer_phone.trim()) {
      setErrorMsg("Please enter your name and contact phone number.");
      return;
    }

    if (!formData.house_flat_no.trim() || !formData.apartment_area.trim() || !formData.pincode.trim()) {
      setErrorMsg("Please fill in complete delivery address details.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      if (formData.payment_method === "ONLINE") {
        // Razorpay flow
        await handleRazorpayFlow();
      } else {
        // Cash on delivery flow
        await createSupabaseOrder({
          payment_method: "COD",
          payment_status: "PENDING",
        });
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      setErrorMsg(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const createSupabaseOrder = async ({ payment_method, payment_status }) => {
    const orderPayload = {
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      house_flat_no: formData.house_flat_no.trim(),
      apartment_area: formData.apartment_area.trim(),
      landmark: formData.landmark.trim() || null,
      city: formData.city.trim() || "Bangalore",
      pincode: formData.pincode.trim(),
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.title || item.name || "Grocery Item",
        price: Number(item.price || 0),
        quantity: item.quantity,
        unit: item.unit || "",
      })),
      item_count: cartCount,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_method: payment_method,
      payment_status: payment_status,
      order_status: "RECEIVED",
      estimated_delivery_mins: 15,
    };

    let createdOrder = null;

    // 1. Try Express backend API
    try {
      const apiRes = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.success && json.order) {
          createdOrder = json.order;
        }
      }
    } catch (e) {
      // Backend offline, fallback to direct Supabase client
      console.log("Express API unavailable, connecting directly via Supabase client...");
    }

    // 2. Fallback to direct Supabase client if backend was not reachable
    if (!createdOrder) {
      const { data, error } = await supabase
        .from("orders")
        .insert([orderPayload])
        .select()
        .single();

      if (error) throw error;
      createdOrder = data;
    }

    clearCart();
    navigate(`/order-track/${createdOrder.id}`);
  };

  const handleRazorpayFlow = async () => {
    const loadRazorpay = () =>
      new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });

    const loaded = await loadRazorpay();
    if (!loaded) throw new Error("Unable to initialize Razorpay payment SDK.");

    const res = await fetch("http://localhost:5000/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: totalAmount }),
    });

    const orderData = await res.json();
    if (!res.ok || !orderData.success) {
      throw new Error(orderData.message || "Payment server error.");
    }

    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "Grocery App",
      description: "Quick Grocery Order",
      order_id: orderData.order.id,
      handler: async (response) => {
        try {
          const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error("Payment verification failed.");
          }

          await createSupabaseOrder({
            payment_method: "ONLINE",
            payment_status: "PAID",
          });
        } catch (error) {
          setErrorMsg(error.message || "Payment failed verification.");
          setLoading(false);
        }
      },
      modal: {
        ondismiss: () => setLoading(false),
      },
      theme: { color: "#0aad0a" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (cartItems.length === 0) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "65vh" }}>
        <div className="mb-4">
          <span style={{ fontSize: "5rem" }}>🛒</span>
        </div>
        <h3 className="fw-bold">Your Cart is Empty</h3>
        <p className="text-muted">Add some groceries to your basket to enjoy 15-minute delivery!</p>
        <Link to="/Shop" className="btn btn-success px-4 py-2 mt-2" style={{ borderRadius: "10px" }}>
          Browse Fresh Groceries
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: "1050px" }}>
      {/* Top Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between p-3 mb-4 bg-light rounded-4 border gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-success p-2">⚡ 15 MINS</span>
          <span className="fw-semibold text-dark">Blinkit-Style Instant Delivery to your doorstep</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span className="small text-muted">
            {user ? (
              <span>Ordering as: <strong>{user.name}</strong> ({user.isGuest ? "Guest" : "Member"})</span>
            ) : (
              <span>Ordering as: <strong>Guest</strong> • <Link to="/customer-login" className="text-success fw-semibold">Sign In</Link></span>
            )}
          </span>
          <Link to="/ShopCart" className="text-decoration-none text-success small fw-bold">
            ← Edit Cart ({cartCount})
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Notice:</strong> {errorMsg}
          <button type="button" className="btn-close" onClick={() => setErrorMsg("")}></button>
        </div>
      )}

      <form onSubmit={handleSubmitOrder}>
        <div className="row g-4">
          {/* Left Column: Delivery Address & Payment */}
          <div className="col-lg-7">
            {/* Delivery Address Card */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "16px" }}>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-2">📍</span>
                <h5 className="fw-bold mb-0">Delivery Address</h5>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Flat / House / Floor No. *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Flat 402, 4th Floor, Green Orchid"
                    name="house_flat_no"
                    value={formData.house_flat_no}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold text-muted">Area / Street / Society *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 5th Main, Indiranagar, 100ft Road"
                    name="apartment_area"
                    value={formData.apartment_area}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-muted">Landmark (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Near Apollo Pharmacy"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold text-muted">City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3 col-6">
                  <label className="form-label small fw-semibold text-muted">Pincode *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="560038"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ borderRadius: "16px" }}>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 me-2">💳</span>
                <h5 className="fw-bold mb-0">Select Payment Method</h5>
              </div>

              <div className="d-flex flex-column gap-3">
                <label
                  className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                    formData.payment_method === "COD" ? "border-success bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="COD"
                      checked={formData.payment_method === "COD"}
                      onChange={handleChange}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <div className="fw-bold text-dark">💵 Cash on Delivery (COD)</div>
                      <small className="text-muted">Pay with cash or UPI directly to the delivery partner</small>
                    </div>
                  </div>
                  <span className="badge bg-success-subtle text-success">Recommended</span>
                </label>

                <label
                  className={`p-3 border rounded-3 d-flex align-items-center justify-content-between cursor-pointer ${
                    formData.payment_method === "ONLINE" ? "border-success bg-light" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value="ONLINE"
                      checked={formData.payment_method === "ONLINE"}
                      onChange={handleChange}
                      className="form-check-input mt-0"
                    />
                    <div>
                      <div className="fw-bold text-dark">💳 Online Payment (Razorpay)</div>
                      <small className="text-muted">Pay securely using UPI, Credit/Debit Card, or Netbanking</small>
                    </div>
                  </div>
                  <span className="badge bg-light text-muted">Instant</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: "90px", borderRadius: "16px" }}>
              <h5 className="fw-bold mb-3">Order Summary ({cartCount} items)</h5>

              {/* Items List */}
              <div className="mb-3" style={{ maxHeight: "240px", overflowY: "auto" }}>
                {cartItems.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <div className="fw-semibold text-dark small">{item.title || item.name}</div>
                      <small className="text-muted">Qty: {item.quantity}</small>
                    </div>
                    <div className="fw-bold text-dark small">
                      ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bill breakdown */}
              <div className="d-flex justify-content-between py-1 text-muted small">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between py-1 text-muted small">
                <span>Delivery Charge</span>
                <span>{deliveryFee === 0 ? <strong className="text-success">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              <div className="d-flex justify-content-between py-1 text-muted small">
                <span>Handling Fee</span>
                <span>₹{handlingFee.toFixed(2)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-center py-2 fs-5 fw-bold text-dark">
                <span>To Pay</span>
                <span className="text-success">₹{totalAmount.toFixed(2)}</span>
              </div>

              {/* Place Order CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success w-100 py-3 mt-3 fw-bold fs-6 shadow-sm"
                style={{
                  borderRadius: "12px",
                  backgroundColor: "#0aad0a",
                  borderColor: "#0aad0a",
                }}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Placing Order...
                  </span>
                ) : (
                  `⚡ Place Order • ₹${totalAmount.toFixed(2)}`
                )}
              </button>

              <div className="text-center mt-3 text-muted small">
                🔒 Safe & Contactless Delivery in 10-15 Minutes
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuickCheckout;
