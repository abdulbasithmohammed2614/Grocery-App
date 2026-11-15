import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useCart } from "../../context/CartContext";
import { fetchProductsFromDb, fetchCategoriesFromDb, INITIAL_CATEGORIES } from "../../services/dataService";
import assortment from "../../images/assortment-citrus-fruits.png";

const Shop = () => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || searchParams.get("q") || ""
  );
  const [sortBy, setSortBy] = useState("featured"); // featured, low-to-high, high-to-low
  const [viewMode, setViewMode] = useState("grid"); // grid, list

  // Sync category & search from URL params
  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search") || searchParams.get("q");

    if (cat && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Fetch products based on category
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProductsFromDb(selectedCategory).then((data) => {
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  // Fetch dynamic categories with real item counts from DB
  useEffect(() => {
    let isMounted = true;
    fetchCategoriesFromDb().then((cats) => {
      if (isMounted && Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    const newParams = new URLSearchParams(searchParams);
    if (catName === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", catName);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set("search", val);
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("search");
    newParams.delete("q");
    setSearchParams(newParams);
  };

  const handleAddProduct = (product) => {
    addToCart(product, 1);
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${product.name} has been added to your basket.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const getQuantityInCart = (productId) => {
    const item = cartItems.find((ci) => ci.id === productId);
    return item ? item.quantity : 0;
  };

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = (p.name || "").toLowerCase().includes(q);
    const catMatch = (p.category || "").toLowerCase().includes(q);
    const badgeMatch = (p.badge || "").toLowerCase().includes(q);
    const unitMatch = (p.unit || "").toLowerCase().includes(q);
    return nameMatch || catMatch || badgeMatch || unitMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low-to-high") return Number(a.price) - Number(b.price);
    if (sortBy === "high-to-low") return Number(b.price) - Number(a.price);
    return 0; // featured
  });

  return (
    <div className="bg-light py-4" style={{ minHeight: "100vh" }}>
      <ScrollToTop />

      <div className="container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/Shop" onClick={() => handleCategorySelect("All")}>Shop</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {selectedCategory}
            </li>
          </ol>
        </nav>

        {/* Promo Header Card */}
        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div className="row align-items-center">
            <div className="col-md-8">
              <span className="badge bg-success p-2 mb-2">⚡ 15-Minute Instant Delivery</span>
              <h2 className="fw-bold text-dark mb-1">Fresh Groceries &amp; Daily Essentials</h2>
              <p className="text-muted mb-0">
                Shop from 1000+ local store items at store prices, delivered directly to your doorstep.
              </p>
            </div>
            <div className="col-md-4 text-end d-none d-md-block">
              <img
                src={assortment}
                alt="Grocery assortment"
                style={{ maxHeight: "110px", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Categories Sidebar */}
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "90px" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0">Categories</h5>
                {selectedCategory !== "All" && (
                  <button
                    onClick={() => handleCategorySelect("All")}
                    className="btn btn-sm btn-link text-success p-0 text-decoration-none small fw-bold"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="list-group list-group-flush border-0">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.name)}
                      className={`list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 mb-1 d-flex justify-content-between align-items-center ${
                        isSelected ? "bg-success text-white fw-bold shadow-sm" : "text-dark"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <span>{cat.name}</span>
                      <span
                        className={`badge ${
                          isSelected ? "bg-white text-success" : "bg-light text-muted"
                        } rounded-pill`}
                      >
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Delivery Guarantee Card */}
              <div className="mt-4 p-3 bg-light rounded-3 border">
                <h6 className="fw-bold mb-1 text-dark">⚡ Lightning Guarantee</h6>
                <small className="text-muted d-block">
                  Orders dispatched from nearest dark store within 5 minutes.
                </small>
                <Link to="/quick-order" className="btn btn-sm btn-outline-success w-100 mt-2 fw-semibold">
                  1-Click Quick Order →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Products Listing */}
          <div className="col-lg-9">
            {/* Live Search & Filter Bar */}
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
              <div className="row g-3 align-items-center">
                {/* Search Input */}
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 bg-light"
                      placeholder="Search milk, bread, snacks..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    {searchQuery && (
                      <button
                        className="btn btn-light border"
                        type="button"
                        onClick={handleClearSearch}
                        title="Clear Search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Showing info & Sort / View toggles */}
                <div className="col-md-7 d-flex flex-wrap justify-content-md-end align-items-center gap-3">
                  <span className="text-muted small">
                    Showing <strong className="text-dark">{sortedProducts.length}</strong> items
                    {searchQuery && <span> for "<span className="text-success fw-bold">{searchQuery}</span>"</span>}
                  </span>

                  {/* Sorting dropdown */}
                  <div className="d-flex align-items-center gap-2">
                    <label className="text-muted small fw-semibold mb-0">Sort:</label>
                    <select
                      className="form-select form-select-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{ width: "auto" }}
                    >
                      <option value="featured">Featured Deals</option>
                      <option value="low-to-high">Price: Low to High</option>
                      <option value="high-to-low">Price: High to Low</option>
                    </select>
                  </div>

                  {/* Grid / List view toggle */}
                  <div className="btn-group btn-group-sm">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`btn ${viewMode === "grid" ? "btn-dark" : "btn-light border"}`}
                      title="Grid View"
                    >
                      ▦
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`btn ${viewMode === "list" ? "btn-dark" : "btn-light border"}`}
                      title="List View"
                    >
                      ☰
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Rendering */}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="mt-2 text-muted small">Loading fresh groceries from Supabase...</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
                <span className="fs-1 d-block mb-2">🔍</span>
                <h5 className="fw-bold">No products found</h5>
                <p className="text-muted small">
                  {searchQuery
                    ? `No matching grocery items found for "${searchQuery}".`
                    : "Try selecting another category from the sidebar."}
                </p>
                <div className="d-flex justify-content-center gap-2">
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="btn btn-sm btn-outline-success px-4">
                      Clear Search Filter
                    </button>
                  )}
                  {selectedCategory !== "All" && (
                    <button onClick={() => handleCategorySelect("All")} className="btn btn-sm btn-success px-4">
                      View All Products
                    </button>
                  )}
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="row g-3 row-cols-1 row-cols-sm-2 row-cols-md-3">
                {sortedProducts.map((product) => {
                  const qty = getQuantityInCart(product.id);

                  return (
                    <div className="col" key={product.id}>
                      <div className="card h-100 border-0 shadow-sm rounded-4 bg-white p-3 d-flex flex-column justify-content-between hover-shadow transition-all">
                        {/* Image & Badge */}
                        <div className="text-center position-relative mb-2">
                          {product.badge && (
                            <span
                              className={`position-absolute top-0 start-0 badge ${
                                product.badge === "Hot" || product.badge === "Sale"
                                  ? "bg-danger"
                                  : "bg-success"
                              } rounded-pill px-2 py-1`}
                            >
                              {product.badge}
                            </span>
                          )}

                          <img
                            src={product.image}
                            alt={product.name}
                            className="img-fluid rounded-3 mb-2"
                            style={{ height: "130px", objectFit: "contain" }}
                          />
                        </div>

                        {/* Info */}
                        <div>
                          <small className="text-muted d-block">{product.category}</small>
                          <h6 className="fw-bold text-dark mb-1" style={{ minHeight: "38px" }}>
                            {product.name}
                          </h6>
                          {product.unit && (
                            <small className="text-muted d-block mb-2">📦 {product.unit}</small>
                          )}
                          <div className="small text-warning mb-3">
                            {"★".repeat(Math.floor(product.rating || 4))}{" "}
                            <span className="text-muted">({product.reviews || 50})</span>
                          </div>
                        </div>

                        {/* Price & Add to Cart button */}
                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <div>
                            <span className="fw-bold fs-5 text-dark">₹{product.price}</span>
                            {product.old_price && (
                              <span className="text-decoration-line-through text-muted small ms-2">
                                ₹{product.old_price}
                              </span>
                            )}
                          </div>

                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() => handleAddProduct(product)}
                              className="btn btn-sm btn-outline-success fw-bold px-3 rounded-pill"
                            >
                              + ADD
                            </button>
                          ) : (
                            <div className="d-flex align-items-center bg-success text-white rounded-pill px-2 py-1">
                              <button
                                type="button"
                                className="btn btn-sm text-white p-0 px-2 fw-bold"
                                onClick={() => updateQuantity(product.id, qty - 1)}
                              >
                                −
                              </button>
                              <span className="fw-bold px-1 small">{qty}</span>
                              <button
                                type="button"
                                className="btn btn-sm text-white p-0 px-2 fw-bold"
                                onClick={() => updateQuantity(product.id, qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="d-flex flex-column gap-3">
                {sortedProducts.map((product) => {
                  const qty = getQuantityInCart(product.id);

                  return (
                    <div
                      key={product.id}
                      className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="rounded-3"
                          style={{ width: "80px", height: "80px", objectFit: "contain" }}
                        />
                        <div>
                          <small className="text-muted">{product.category}</small>
                          <h6 className="fw-bold text-dark mb-0">{product.name}</h6>
                          {product.unit && (
                            <small className="text-muted d-block">📦 {product.unit}</small>
                          )}
                          <div className="small text-warning mt-1">
                            {"★".repeat(Math.floor(product.rating || 4))}{" "}
                            <span className="text-muted">({product.reviews || 50})</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end">
                        <div className="mb-2">
                          <span className="fw-bold fs-5 text-dark">₹{product.price}</span>
                          {product.old_price && (
                            <span className="text-decoration-line-through text-muted small ms-2">
                              ₹{product.old_price}
                            </span>
                          )}
                        </div>

                        {qty === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleAddProduct(product)}
                            className="btn btn-sm btn-outline-success fw-bold px-4 rounded-pill"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="d-inline-flex align-items-center bg-success text-white rounded-pill px-2 py-1">
                            <button
                              type="button"
                              className="btn btn-sm text-white p-0 px-2 fw-bold"
                              onClick={() => updateQuantity(product.id, qty - 1)}
                            >
                              −
                            </button>
                            <span className="fw-bold px-2 small">{qty}</span>
                            <button
                              type="button"
                              className="btn btn-sm text-white p-0 px-2 fw-bold"
                              onClick={() => updateQuantity(product.id, qty + 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
