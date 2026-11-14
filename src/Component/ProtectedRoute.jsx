import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const SellerRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/seller/login" state={{ from: location }} replace />;
  }

  if (user.role !== "seller") {
    return (
      <div className="container py-5 text-center" style={{ minHeight: "65vh" }}>
        <div className="alert alert-danger d-inline-block p-4 rounded-4 shadow-sm" style={{ maxWidth: "550px" }}>
          <span className="fs-1 d-block mb-2">🚫</span>
          <h4 className="fw-bold text-danger">Access Denied: Customer View Only</h4>
          <p className="text-muted mb-3">
            You are currently signed in as a <strong>Customer ({user.name})</strong>.
            Customers are not permitted to view the seller fulfillment dashboard.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/Shop" className="btn btn-success">
              ← Return to Grocery Shop
            </Link>
            <Link to="/seller/login" className="btn btn-outline-dark">
              Switch to Seller Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
