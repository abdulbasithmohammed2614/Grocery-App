import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEMO_CUSTOMER } from "../../context/AuthContext";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginCustomer, loginAsGuest, user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState("guest"); // "guest" or "signin"

  // Registered customer form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Guest customer form
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  const redirectUrl = location.state?.from?.pathname || "/Shop";

  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await loginCustomer(email, password);
    setLoading(false);

    if (res.success) {
      navigate(redirectUrl, { replace: true });
    } else {
      setErrorMsg(res.message || "Invalid credentials");
    }
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    loginAsGuest({
      name: guestName.trim() || "Guest Customer",
      phone: guestPhone.trim(),
    });
    navigate(redirectUrl, { replace: true });
  };

  const handleFastGuest = () => {
    loginAsGuest({
      name: "Guest Customer",
      phone: "9876543210",
    });
    navigate(redirectUrl, { replace: true });
  };

  const handleFillDemoCustomer = () => {
    setEmail(DEMO_CUSTOMER.email);
    setPassword(DEMO_CUSTOMER.password);
    setErrorMsg("");
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "85vh" }}>
      <div className="container" style={{ maxWidth: "520px" }}>
        {user && (
          <div className="alert alert-info mb-4 rounded-3 d-flex justify-content-between align-items-center">
            <div>
              Signed in as: <strong>{user.name}</strong> ({user.isGuest ? "Guest" : user.role})
            </div>
            <button onClick={logout} className="btn btn-sm btn-outline-danger py-0">
              Sign Out
            </button>
          </div>
        )}

        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">Customer Access</h3>
            <p className="text-muted small">
              Shop fresh groceries with 15-minute delivery
            </p>

            {/* Toggle Pills */}
            <div className="d-flex p-1 bg-light rounded-pill mt-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("guest");
                  setErrorMsg("");
                }}
                className={`btn btn-sm w-50 rounded-pill fw-semibold ${
                  activeTab === "guest" ? "btn-success text-white shadow-sm" : "btn-light text-muted"
                }`}
              >
                ⚡ Continue as Guest
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMsg("");
                }}
                className={`btn btn-sm w-50 rounded-pill fw-semibold ${
                  activeTab === "signin" ? "btn-success text-white shadow-sm" : "btn-light text-muted"
                }`}
              >
                👤 Sign In with Email
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-danger small py-2 px-3 rounded-3" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: GUEST CHECKOUT (Express 1-Click) */}
          {activeTab === "guest" ? (
            <div>
              <div className="p-3 bg-light rounded-3 mb-3 border">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h6 className="fw-bold mb-0 text-success">⚡ Instant Guest Checkout</h6>
                    <small className="text-muted">No password required. Start ordering immediately!</small>
                  </div>
                  <button
                    type="button"
                    onClick={handleFastGuest}
                    className="btn btn-sm btn-outline-success py-1 px-3 fw-bold"
                  >
                    1-Click Fast
                  </button>
                </div>
              </div>

              <form onSubmit={handleGuestLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Your Name (Optional)</label>
                  <input
                    type="text"
                    className="form-control py-2"
                    placeholder="e.g. Rahul Sharma"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    className="form-control py-2"
                    placeholder="e.g. 9876543210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm"
                  style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                >
                  ⚡ Start Shopping as Guest
                </button>
              </form>
            </div>
          ) : (
            /* TAB 2: REGISTERED CUSTOMER LOGIN */
            <div>
              <div className="p-2 bg-light rounded-3 mb-3 border d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Demo: <strong className="font-monospace">customer@gmail.com</strong>
                </small>
                <button
                  type="button"
                  onClick={handleFillDemoCustomer}
                  className="btn btn-sm btn-outline-secondary py-0 px-2"
                  style={{ fontSize: "11px" }}
                >
                  Auto-Fill
                </button>
              </div>

              <form onSubmit={handleCustomerLogin}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Email Address</label>
                  <input
                    type="email"
                    className="form-control py-2"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-muted">Password</label>
                  <input
                    type="password"
                    className="form-control py-2"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow-sm"
                  style={{ backgroundColor: "#0aad0a", borderColor: "#0aad0a" }}
                >
                  {loading ? "Signing in..." : "Sign In to Account"}
                </button>
              </form>
            </div>
          )}

          <div className="text-center mt-4 pt-3 border-top">
            <Link to="/seller/login" className="text-muted small text-decoration-none">
              🏪 Store Manager? <strong>Open Seller Login →</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
