import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Route protection: Only Vendors (Sellers) and Admins can access
 * Regular customers and unauthenticated users are blocked.
 */
export const AdminOrVendorRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  const isAuthorized =
    user.role === "admin" || user.role === "vendor" || user.role === "seller";

  if (!isAuthorized) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "65vh" }}>
        <div
          className="alert alert-danger d-inline-block p-4 rounded-4 shadow-sm text-center"
          style={{ maxWidth: "580px" }}
        >
          <span className="fs-1 d-block mb-2">🚫</span>
          <h4 className="fw-bold text-danger">Access Denied: Vendors &amp; Admins Only</h4>
          <p className="text-muted mb-3">
            You are signed in as a <strong>Customer ({user.name})</strong>.
            Customers are not permitted to modify products, view store metrics, or fulfill customer orders.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/Shop" className="btn btn-success">
              ← Return to Grocery Shop
            </Link>
            <Link to="/seller/login" className="btn btn-outline-dark">
              Switch to Vendor / Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

// Backwards compatibility alias
export const SellerRoute = AdminOrVendorRoute;

/**
 * Route protection: Strictly Admins only (e.g. for vendor onboarding/whitelist)
 */
export const AdminOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "65vh" }}>
        <div
          className="alert alert-warning d-inline-block p-4 rounded-4 shadow-sm text-center"
          style={{ maxWidth: "550px" }}
        >
          <span className="fs-1 d-block mb-2">🛡️</span>
          <h4 className="fw-bold text-dark">Admin Privileges Required</h4>
          <p className="text-muted mb-3">
            Only platform Administrators have permissions to whitelist or onboard new vendors.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/seller/dashboard" className="btn btn-dark">
              ← Return to Store Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
