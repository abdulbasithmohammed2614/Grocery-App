import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useCart } from "../context/CartContext";
import { fetchProductsFromDb, INITIAL_CATEGORIES } from "../services/dataService";

const ProductItem = () => {
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProductsFromDb(activeCategory).then((data) => {
      if (isMounted) {
        setProducts(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeCategory]);

  const handleAddClick = (product) => {
    addToCart(product, 1);
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${product.name} has been added.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const getCartQuantity = (productId) => {
    const item = cartItems.find((cartItem) => cartItem.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <section className="my-lg-14 my-8">
      <div className="container">
        {/* Section Header */}
        <div className="row">
          <div className="col-12 mb-4">
            <div className="section-head text-center mt-6">
              <h3 className="h3style" data-title="Popular Groceries">
                Popular Groceries
              </h3>
              <div className="wt-separator bg-primarys" />
              <div className="wt-separator2 bg-primarys" />
              <p className="text-muted small mt-2">
                ⚡ Delivered in 10-15 Minutes • Sourced Fresh from Store
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Category Tabs Filter */}
        <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`btn btn-sm px-3 py-2 rounded-pill fw-semibold transition-all ${
                activeCategory === cat.name
                  ? "btn-success text-white shadow-sm"
                  : "btn-light text-muted border bg-white"
              }`}
              style={{
                backgroundColor: activeCategory === cat.name ? "#0aad0a" : "#fff",
                borderColor: activeCategory === cat.name ? "#0aad0a" : "#e0e0e0",
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status"></div>
            <p className="mt-2 text-muted small">Loading fresh groceries from Supabase...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <p>No products found in "{activeCategory}".</p>
          </div>
        ) : (
          <div className="row g-4 row-cols-lg-4 row-cols-md-3 row-cols-2">
            {products.map((product) => {
              const quantity = getCartQuantity(product.id);

              return (
                <div className="col fade-zoom" key={product.id}>
                  <div className="card card-product h-100 border rounded-4 shadow-sm">
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      {/* Badge & Image */}
                      <div className="text-center position-relative mb-2">
                        {product.badge && (
                          <div className="position-absolute top-0 start-0">
                            <span
                              className={`badge ${
                                product.badge === "Hot" || product.badge === "Sale"
                                  ? "bg-danger"
                                  : "bg-success"
                              } rounded-pill px-2 py-1`}
                            >
                              {product.badge}
                            </span>
                          </div>
                        )}

                        <img
                          src={product.image}
                          alt={product.name}
                          className="mb-2 img-fluid rounded-3"
                          style={{ maxHeight: "140px", objectFit: "contain" }}
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <div className="text-small mb-1">
                          <span className="text-muted small">{product.category}</span>
                        </div>

                        <h6 className="fw-bold mb-1 text-dark" style={{ minHeight: "40px" }}>
                          {product.name}
                        </h6>

                        {product.unit && (
                          <div className="small text-muted mb-2">
                            <span>📦 {product.unit}</span>
                          </div>
                        )}

                        {/* Rating */}
                        <div className="mb-2">
                          <small className="text-warning">
                            {"★".repeat(Math.floor(product.rating || 4))}
                          </small>
                          <span className="text-muted small ms-1">
                            {product.rating || 4.5} ({product.reviews || 50})
                          </span>
                        </div>
                      </div>

                      {/* Price & Add to Cart */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                        <div>
                          <span className="fw-bold text-dark fs-6">₹{product.price}</span>
                          {product.old_price && (
                            <span className="text-decoration-line-through text-muted small ms-2">
                              ₹{product.old_price}
                            </span>
                          )}
                        </div>

                        {quantity === 0 ? (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success fw-bold px-3 py-1 rounded-pill"
                            onClick={() => handleAddClick(product)}
                            style={{ borderColor: "#0aad0a", color: "#0aad0a" }}
                          >
                            + ADD
                          </button>
                        ) : (
                          <div
                            className="d-flex align-items-center bg-success text-white rounded-pill px-2 py-1"
                            style={{ backgroundColor: "#0aad0a" }}
                          >
                            <button
                              type="button"
                              className="btn btn-sm text-white p-0 px-2 fw-bold"
                              onClick={() => updateQuantity(product.id, quantity - 1)}
                            >
                              −
                            </button>
                            <span className="fw-bold px-1 small">{quantity}</span>
                            <button
                              type="button"
                              className="btn btn-sm text-white p-0 px-2 fw-bold"
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductItem;
