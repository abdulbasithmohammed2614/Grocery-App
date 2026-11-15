import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEMO_SELLER, DEMO_ADMIN } from "../../context/AuthContext";
import ScrollToTop from "../ScrollToTop";

const SellerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSeller, user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/seller";

  const handleFillVendor = () => {
    setEmail(DEMO_SELLER.email);
    setPassword(DEMO_SELLER.password);
    setErrorMsg("");
  };

  const handleFillAdmin = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await loginSeller(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setErrorMsg(res.message || "Invalid credentials");
    }
  };

  return (
    <div className="bg-light py-5" style={{ minHeight: "85vh" }}>
      <ScrollToTop />
      <div className="container" style={{ maxWidth: "520px" }}>
        {user?.role === "customer" && (
          <div className="alert alert-warning mb-4 rounded-3 d-flex justify-content-between align-items-center">
            <small>
              Currently signed in as customer: <strong>{user.name}</strong>
            </small>
            <button onClick={logout} className="btn btn-sm btn-outline-dark py-0">
              Logout
            </button>
          </div>
        )}

        <div className="card border-0 shadow-sm p-4 p-md-5 rounded-4 bg-white">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle mb-3 shadow"
              style={{ width: "64px", height: "64px", fontSize: "2rem" }}
            >
              🏪
            </div>
            <h3 className="fw-bold mb-1">Vendor &amp; Admin Portal</h3>
            <p className="text-muted small">
              Store order fulfillment, inventory modification &amp; vendor management
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger small py-2 px-3 rounded-3" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick Demo Fill Helpers */}
          <div className="p-3 bg-light rounded-3 mb-4 border">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <span className="badge bg-dark me-1">Store Vendor</span>
                <small className="text-dark font-monospace">{DEMO_SELLER.email}</small>
              </div>
              <button
                type="button"
                onClick={handleFillVendor}
                className="btn btn-sm btn-outline-dark py-0 px-2"
                style={{ fontSize: "11px" }}
              >
                Auto-Fill
              </button>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-2 border-top">
              <div>
                <span className="badge bg-primary me-1">SuperAdmin</span>
                <small className="text-dark font-monospace">{DEMO_ADMIN.email}</small>
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="btn btn-sm btn-outline-primary py-0 px-2"
                style={{ fontSize: "11px" }}
              >
                Auto-Fill
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Vendor or Admin Email</label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="seller@grocery.com or admin@grocery.com"
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
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-100 py-3 fw-bold rounded-3 mb-3 shadow-sm"
            >
              {loading ? "Authenticating..." : "Sign In to Management Portal"}
            </button>

            {/* Vendor Onboarding Link */}
            <div className="text-center py-2 mb-3 bg-light rounded-3 border">
              <small className="text-muted d-block mb-1">Whitelisted by an Admin?</small>
              <Link to="/vendor/register" className="fw-bold text-dark text-decoration-none small">
                🚀 Complete Vendor Store Registration →
              </Link>
            </div>

            <div className="text-center">
              <Link to="/Shop" className="text-muted small text-decoration-none">
                ← Return to Customer Grocery Shop
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
