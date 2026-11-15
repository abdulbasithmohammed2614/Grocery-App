import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Swal from "sweetalert2";
import ScrollToTop from "../ScrollToTop";
import { useCart } from "../../context/CartContext";
import { INITIAL_PRODUCTS } from "../../services/dataService";

const STORAGE_KEY = "grocery_app_wishlist";

const ShopWishList = () => {
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial wishlist items from product catalog
    return INITIAL_PRODUCTS.slice(0, 4);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistItems]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Swal.fire({
      icon: "success",
      title: "Added to Cart!",
      text: `${product.name} is now in your basket.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleRemove = (productId, productName) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    Swal.fire({
      icon: "info",
      title: "Removed",
      text: `${productName} removed from wishlist.`,
      timer: 1200,
      showConfirmButton: false,
    });
  };

  const handleAddAllToCart = () => {
    if (wishlistItems.length === 0) return;
    wishlistItems.forEach((item) => addToCart(item, 1));
    Swal.fire({
      icon: "success",
      title: "All Items Added!",
      text: `${wishlistItems.length} products added to your cart.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleClearWishlist = () => {
    setWishlistItems([]);
    Swal.fire({
      icon: "info",
      title: "Wishlist Cleared",
      timer: 1200,
      showConfirmButton: false,
    });
  };

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
              My Wishlist
            </li>
          </ol>
        </nav>

        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <h2 className="fw-bold mb-1">❤️ My Wishlist</h2>
              <p className="text-muted mb-0">
                You have {wishlistItems.length} saved product{wishlistItems.length === 1 ? "" : "s"}.
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="btn btn-success btn-sm rounded-pill px-3 fw-semibold"
                >
                  ⚡ Move All to Cart
                </button>
                <button
                  type="button"
                  onClick={handleClearWishlist}
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <span className="fs-1 d-block mb-3">🤍</span>
            <h4 className="fw-bold">Your Wishlist is Empty</h4>
            <p className="text-muted small">
              Explore our fresh groceries and add your favorite items to your wishlist!
            </p>
            <div className="mt-3">
              <Link to="/Shop" className="btn btn-success px-4 rounded-pill fw-semibold">
                Browse Groceries →
              </Link>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" style={{ width: "80px" }}>Item</th>
                    <th scope="col">Product Details</th>
                    <th scope="col">Price</th>
                    <th scope="col">Stock Status</th>
                    <th scope="col" className="text-center">Action</th>
                    <th scope="col" className="text-center">Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="rounded-3 border p-1"
                          style={{ width: "65px", height: "65px", objectFit: "contain" }}
                        />
                      </td>

                      <td>
                        <h6 className="fw-bold mb-0 text-dark">{item.name}</h6>
                        <small className="text-muted">{item.category} {item.unit ? `• ${item.unit}` : ""}</small>
                      </td>

                      <td>
                        <span className="fw-bold text-dark fs-6">₹{item.price}</span>
                        {item.old_price && (
                          <small className="text-decoration-line-through text-muted ms-2">
                            ₹{item.old_price}
                          </small>
                        )}
                      </td>

                      <td>
                        <span className="badge bg-success-subtle text-success fw-semibold">
                          ● In Stock (10m Dispatch)
                        </span>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleAddToCart(item)}
                          className="btn btn-sm btn-success rounded-pill px-3 fw-bold shadow-sm"
                        >
                          + Add to Cart
                        </button>
                      </td>

                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id, item.name)}
                          className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2"
                          title="Remove from wishlist"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopWishList;
