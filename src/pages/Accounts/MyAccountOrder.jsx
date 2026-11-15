import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ScrollToTop from "../ScrollToTop";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";

const STATUS_BADGES = {
  RECEIVED: "bg-primary",
  ACCEPTED: "bg-info text-dark",
  PACKING: "bg-warning text-dark",
  OUT_FOR_DELIVERY: "bg-purple text-white",
  DELIVERED: "bg-success",
  CANCELLED: "bg-danger",
};

const MyAccountOrder = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);

      // 1. Try fetching orders from Supabase
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && Array.isArray(data) && data.length > 0) {
          if (isMounted) {
            setOrders(data);
            setLoading(false);
          }
          return;
        }
      } catch (e) {
        console.error("Supabase fetch error:", e);
      }

      // 2. Fallback to localStorage orders
      try {
        const local = localStorage.getItem("customer_orders");
        if (local) {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (isMounted) {
              setOrders(parsed);
              setLoading(false);
            }
            return;
          }
        }
      } catch (e) {}

      // 3. Fallback sample demo quick-orders
      const demoOrders = [
        {
          id: "ORD-94281",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          customer_name: user?.name || "Rahul Sharma",
          item_count: 3,
          total_amount: 345,
          order_status: "DELIVERED",
          payment_method: "ONLINE",
          delivery_address: "Flat 402, Green Glen Layout, Bangalore",
        },
        {
          id: "ORD-89312",
          created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
          customer_name: user?.name || "Rahul Sharma",
          item_count: 5,
          total_amount: 520,
          order_status: "DELIVERED",
          payment_method: "COD",
          delivery_address: "Flat 402, Green Glen Layout, Bangalore",
        },
      ];

      if (isMounted) {
        setOrders(demoOrders);
        setLoading(false);
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user]);

  return (
    <div className="bg-light py-5" style={{ minHeight: "80vh" }}>
      <ScrollToTop />

      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/Shop">Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              My Orders
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          {/* Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="text-center mb-4">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto mb-2 fw-bold fs-4"
                  style={{ width: "65px", height: "65px" }}
                >
                  {user?.name ? user.name[0].toUpperCase() : "G"}
                </div>
                <h5 className="fw-bold mb-0">{user?.name || "Guest Customer"}</h5>
                <small className="text-muted">{user?.email || "customer@example.com"}</small>
              </div>

              <div className="list-group list-group-flush border-0">
                <Link
                  to="/MyAccountOrder"
                  className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 active bg-success fw-semibold mb-1"
                >
                  <i className="fas fa-shopping-bag me-2" />
                  Your Orders
                </Link>
                <Link
                  to="/ShopWishList"
                  className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 mb-1"
                >
                  <i className="fas fa-heart me-2 text-danger" />
                  My Wishlist
                </Link>
                <Link
                  to="/Shop"
                  className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 mb-1"
                >
                  <i className="fas fa-store me-2 text-success" />
                  Browse Groceries
                </Link>
                <Link
                  to="/quick-order"
                  className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 mb-1"
                >
                  <i className="fas fa-bolt me-2 text-warning" />
                  Quick Checkout
                </Link>
                {user && (
                  <button
                    onClick={logout}
                    className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 text-danger fw-semibold mt-3"
                  >
                    <i className="fas fa-sign-out-alt me-2" />
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Orders Listing */}
          <div className="col-lg-9">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="fw-bold mb-1">Your Orders &amp; Deliveries</h3>
                  <p className="text-muted small mb-0">
                    Track live deliveries or review your order history.
                  </p>
                </div>
                <Link to="/Shop" className="btn btn-outline-success btn-sm rounded-pill px-3 fw-bold">
                  + Order More
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-3 text-muted small">Loading order history...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <span className="fs-1 d-block mb-3">📦</span>
                <h4 className="fw-bold">No orders placed yet</h4>
                <p className="text-muted small">
                  Place your first order to get fresh groceries delivered in 10-15 minutes!
                </p>
                <div className="mt-3">
                  <Link to="/Shop" className="btn btn-success px-4 rounded-pill fw-semibold">
                    Start Shopping →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
                <div className="table-responsive">
                  <table className="table align-middle table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col">Order ID</th>
                        <th scope="col">Placed On</th>
                        <th scope="col">Items</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Total</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const dateStr = order.created_at
                          ? new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Recently";

                        const statusBadge =
                          STATUS_BADGES[order.order_status] || "bg-secondary";

                        return (
                          <tr key={order.id}>
                            <td>
                              <span className="fw-bold text-dark">{order.id}</span>
                            </td>
                            <td>
                              <small className="text-muted">{dateStr}</small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {order.item_count || 1} item(s)
                              </span>
                            </td>
                            <td>
                              <span className="small text-muted fw-semibold">
                                {order.payment_method || "COD"}
                              </span>
                            </td>
                            <td>
                              <span className="fw-bold text-dark">
                                ₹{order.total_amount || 0}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${statusBadge} px-2 py-1`}>
                                {order.order_status}
                              </span>
                            </td>
                            <td className="text-center">
                              <Link
                                to={`/order-track/${order.id}`}
                                className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold"
                              >
                                ⚡ Track Order
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountOrder;
