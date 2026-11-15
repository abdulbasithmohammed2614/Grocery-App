import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import graphics from "../../images/store-graphics.svg";
import ScrollToTop from "../ScrollToTop";
import { fetchStoresFromDb } from "../../services/dataService";

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("ALL"); // ALL, QUICK, SUPERMARKET, ORGANIC

  useEffect(() => {
    let isMounted = true;
    fetchStoresFromDb().then((data) => {
      if (isMounted) {
        setStores(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredStores = stores.filter((store) => {
    if (filterTab === "QUICK") return store.delivery_time.includes("10-15");
    if (filterTab === "ORGANIC") return store.type.toLowerCase().includes("organic") || store.name.toLowerCase().includes("organic");
    if (filterTab === "SUPERMARKET") return store.type.toLowerCase().includes("supermarket");
    return true; // ALL
  });

  return (
    <div>
      <ScrollToTop />

      {/* Breadcrumb */}
      <div className="mt-4">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Stores
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <section className="mt-4">
        <div className="container">
          <div className="bg-light rounded-4 p-4 p-md-5 d-flex justify-content-between align-items-center">
            <div>
              <span className="badge bg-success p-2 mb-2">⚡ FreshCart Fast Delivery</span>
              <h1 className="fw-bold mb-1">Local Grocery Stores</h1>
              <p className="text-muted mb-0">
                Discover nearby fulfillment stores delivering fresh groceries in 10-15 minutes.
              </p>
            </div>
            <div className="d-none d-md-block">
              <img src={graphics} alt="Stores graphics" style={{ maxHeight: "120px" }} />
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="mt-4">
        <div className="container">
          <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
            {[
              { key: "ALL", label: `All Stores (${stores.length})` },
              { key: "QUICK", label: "⚡ 10-15 Mins Express" },
              { key: "SUPERMARKET", label: "🛒 Supermarkets" },
              { key: "ORGANIC", label: "🌱 Organic & Farm Fresh" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold ${
                  filterTab === tab.key ? "btn-dark shadow-sm" : "btn-light text-muted border bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Store Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted small">Fetching partner stores from Supabase...</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No stores found for this filter.</p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
              {filteredStores.map((store) => (
                <div className="col" key={store.id}>
                  <div className="card h-100 border-0 shadow-sm rounded-4 p-4 hover-shadow transition-all">
                    <div className="d-flex align-items-start gap-3">
                      <img
                        src={store.logo}
                        alt={store.name}
                        className="rounded-circle border p-1"
                        style={{ width: "60px", height: "60px", objectFit: "contain" }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="badge bg-success-subtle text-success small fw-semibold">
                            ⚡ {store.delivery_time}
                          </span>
                          <span className="small text-muted">★ {store.rating}</span>
                        </div>
                        <h5 className="fw-bold mb-1 mt-1 text-dark">{store.name}</h5>
                        <small className="text-muted d-block">{store.type}</small>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-top small text-muted">
                      <div>📍 {store.location}</div>
                      <div className="d-flex justify-content-between mt-2">
                        <span>Min Order: ₹{store.min_order}</span>
                        <span className="text-success fw-semibold">● {store.status}</span>
                      </div>
                    </div>

                    <div className="mt-3 d-flex flex-wrap gap-1">
                      {Array.isArray(store.tags) &&
                        store.tags.map((tag, idx) => (
                          <span key={idx} className="badge bg-light text-muted border small">
                            {tag}
                          </span>
                        ))}
                    </div>

                    <Link
                      to="/Shop"
                      className="btn btn-outline-success btn-sm w-100 mt-3 rounded-pill fw-semibold"
                    >
                      Browse Groceries →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoreList;
