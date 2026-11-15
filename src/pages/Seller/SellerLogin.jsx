import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEMO_SELLER } from "../../context/AuthContext";

const SellerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSeller, user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/seller";

  const handleFillDemo = () => {
    setEmail(DEMO_SELLER.email);
    setPassword(DEMO_SELLER.password);
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
      <div className="container" style={{ maxWidth: "480px" }}>
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
              className="d-inline-flex align-items-center justify-content-center bg-dark text-white rounded-circle mb-3"
              style={{ width: "64px", height: "64px", fontSize: "2rem" }}
            >
              🏪
            </div>
            <h3 className="fw-bold mb-1">Seller Portal Login</h3>
            <p className="text-muted small">
              Store fulfillment & order dispatch dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="alert alert-danger small py-2 px-3 rounded-3" role="alert">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Quick Demo Fill Helper */}
          <div className="p-3 bg-light rounded-3 mb-4 border d-flex justify-content-between align-items-center">
            <div>
              <small className="d-block text-muted">Demo Credentials:</small>
              <strong className="small text-dark font-monospace">seller@grocery.com</strong>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="btn btn-sm btn-outline-success py-1 px-2"
              style={{ fontSize: "12px" }}
            >
              ⚡ Auto-Fill
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Store Email</label>
              <input
                type="email"
                className="form-control py-2"
                placeholder="seller@grocery.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold text-muted">Store Password</label>
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
              className="btn btn-dark w-100 py-2 fw-semibold rounded-3 mb-3"
            >
              {loading ? "Signing in..." : "Sign In to Seller Dashboard"}
            </button>

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
