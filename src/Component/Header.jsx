import React, { useState } from "react";
import Grocerylogo from "../images/fdlogo.png";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const DELIVERY_LOCATIONS = [
  { area: "Indiranagar", city: "Bangalore", pincode: "560038", time: "10-12 mins" },
  { area: "Koramangala", city: "Bangalore", pincode: "560034", time: "12-15 mins" },
  { area: "HSR Layout", city: "Bangalore", pincode: "560102", time: "10-15 mins" },
  { area: "Whitefield", city: "Bangalore", pincode: "560066", time: "15-20 mins" },
  { area: "Connaught Place", city: "New Delhi", pincode: "110001", time: "15 mins" },
  { area: "Bandra West", city: "Mumbai", pincode: "400050", time: "12 mins" },
];

const Header = () => {
  const navigate = useNavigate();
const { user, isSeller, logout } = useAuth();
  const {
    cartItems,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return localStorage.getItem("user_delivery_location") || "Indiranagar, Bangalore (560038)";
  });
  const [customLocationInput, setCustomLocationInput] = useState("");

  // Modal Auth form state

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/Shop?search=${encodeURIComponent(query)}`);
    } else {
      navigate("/Shop");
    }
  };

  const handleSelectLocation = (loc) => {
    const locString = `${loc.area}, ${loc.city} (${loc.pincode})`;
    setSelectedLocation(locString);
    localStorage.setItem("user_delivery_location", locString);
    Swal.fire({
      icon: "success",
      title: "Delivery Location Updated",
      text: `Delivering to ${locString} in ${loc.time}`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocationInput.trim()) {
      const locString = customLocationInput.trim();
      setSelectedLocation(locString);
      localStorage.setItem("user_delivery_location", locString);
      setCustomLocationInput("");
      Swal.fire({
        icon: "success",
        title: "Location Saved",
        text: `Delivering to ${locString}`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // const handleModalSignUp = (e) => {
  //   e.preventDefault();
  //   if (!modalName.trim()) {
  //     Swal.fire("Notice", "Please enter your name", "warning");
  //     return;
  //   }
  //   loginAsGuest({
  //     name: modalName.trim(),
  //     email: modalEmail.trim() || `${modalName.toLowerCase().replace(/\s+/g, "")}@example.com`,
  //     phone: modalPhone.trim() || "9876543210",
  //   });
  //   Swal.fire({
  //     icon: "success",
  //     title: "Welcome!",
  //     text: `Signed in as ${modalName}`,
  //     timer: 1500,
  //     showConfirmButton: false,
  //   });
  // };

  return (
    <div>
      {/* Top Banner Bar */}
      <div className="border-bottom pb-2">
        <div className="bg-light py-2">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-7 col-12 d-flex align-items-center gap-2">
                <span className="badge bg-success">⚡ 10-15 Min Delivery</span>
                <span className="small text-muted">Super Value Deals &bull; Free delivery on orders above ₹499</span>
              </div>

              {/* Location Selector Pill & Quick Action Icons */}
              <div className="col-md-5 col-12 text-md-end mt-2 mt-md-0 d-flex justify-content-md-end align-items-center gap-3">
                {/* Location trigger */}
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-1 px-2 rounded-pill small"
                  data-bs-toggle="modal"
                  data-bs-target="#locationModal"
                  title="Change delivery address"
                >
                  <i className="fas fa-map-marker-alt text-danger"></i>
                  <span className="text-truncate" style={{ maxWidth: "160px" }}>
                    {selectedLocation}
                  </span>
                  <i className="fas fa-chevron-down small text-muted"></i>
                </button>

                {/* Wishlist Link */}
                <Link to="/ShopWishList" className="text-muted position-relative" title="Wishlist">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-heart"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </Link>

                {/* Account Link / Login Modal Trigger */}
                {user ? (
                  <Link to="/MyAccountOrder" className="text-muted small fw-semibold" title="Account">
                    👤 {user.name}
                  </Link>
                ) : (
                  <Link
                    to="/customer-login"
                    className="text-muted"
                    title="Sign In / Register"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="feather feather-user"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx={12} cy={7} r={4} />
                    </svg>
                  </Link>
                )}

                {/* Cart Offcanvas Trigger */}
                <button
                  type="button"
                  className="btn btn-link text-muted position-relative p-0"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasRight"
                  title="Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={22}
                    height={22}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-shopping-bag text-success"
                  >
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1={3} y1={6} x2={21} y2={6} />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                    {cartCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar & Search Bar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm py-2">
        <div className="container">
          {/* Brand Logo */}
          <Link className="navbar-brand me-3" to="/">
            <img
              src={Grocerylogo}
              style={{ width: 180, maxHeight: 50, objectFit: "contain" }}
              alt="Grocery Logo"
            />
          </Link>

          {/* Working Search Bar */}
          <form onSubmit={handleSearchSubmit} className="d-flex flex-grow-1 mx-lg-4 my-2 my-lg-0" style={{ maxWidth: "550px" }}>
            <div className="input-group">
              <input
                className="form-control border-end-0 bg-light"
                type="search"
                placeholder="Search milk, atta, snacks, fruits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-outline-success bg-light border-start-0" type="submit">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          {/* Mobile Toggler */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#main_nav"
            aria-controls="main_nav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Nav Items */}
          <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="main_nav">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              {/* Home */}
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/">
                  Home
                </Link>
              </li>

              {/* All Departments / Categories Dropdown */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle fw-semibold"
                  to="/Shop"
                  id="deptDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Categories
                </Link>
                <ul className="dropdown-menu shadow-sm border-0" aria-labelledby="deptDropdown">
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Dairy,%20Bread%20&%20Eggs">
                      🥛 Dairy, Bread &amp; Eggs
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Fruits%20&%20Vegetables">
                      🍎 Fruits &amp; Vegetables
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Snacks%20&%20Munchies">
                      🍟 Snacks &amp; Munchies
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Bakery%20&%20Biscuits">
                      🍪 Bakery &amp; Biscuits
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Instant%20Food">
                      🍜 Instant Food &amp; Noodles
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Cold%20Drinks%20&%20Juices">
                      🥤 Cold Drinks &amp; Juices
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/Shop?category=Atta,%20Rice%20&%20Dal">
                      🌾 Atta, Rice &amp; Dal
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item fw-bold text-success" to="/Shop">
                      View All Products →
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Shop Dropdown */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle fw-semibold"
                  to="/Shop"
                  id="shopDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Shop
                </Link>
                <ul className="dropdown-menu shadow-sm border-0" aria-labelledby="shopDropdown">
                  <li>
                    <Link className="dropdown-item" to="/Shop">
                      🛒 Browse Groceries
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/ShopWishList">
                      ❤️ My Wishlist
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/ShopCart">
                      🛍️ Shopping Cart ({cartCount})
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item text-success fw-semibold" to="/quick-order">
                      ⚡ Quick Checkout
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Stores */}
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/StoreList">
                  Stores
                </Link>
              </li>

              {/* Account Dropdown */}
              <li className="nav-item dropdown">
                <Link
                  className="nav-link dropdown-toggle fw-semibold"
                  to="#"
                  id="accDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Account
                </Link>
                <ul className="dropdown-menu shadow-sm border-0" aria-labelledby="accDropdown">
                  {user ? (
                    <>
                      <li className="dropdown-header">
                        Signed in as <strong>{user.name}</strong>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/MyAccountOrder">
                          📦 Order History &amp; Tracking
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="dropdown-item text-danger fw-semibold"
                        >
                          🚪 Sign Out
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item text-success fw-bold" to="/customer-login">
                          ⚡ Sign In / Guest Checkout
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" to="/MyAccountOrder">
                          📦 Track Past Orders
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link className="dropdown-item small text-muted" to="/seller/login">
                      🏪 Merchant / Seller Login
                    </Link>
                  </li>
                </ul>
              </li>

              {/* About / Contact */}
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/AboutUs">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" to="/Contact">
                  Contact
                </Link>
              </li>

              {/* ⚡ Quick Checkout Action Button */}
              {!isSeller && (
                <li className="nav-item ms-lg-2">
                  <Link to="/quick-order" className="btn btn-success btn-sm rounded-pill px-3 fw-bold">
                    ⚡ Checkout ({cartCount})
                  </Link>
                </li>
              )}

              {/* Seller portal indicator */}
              {isSeller && (
                <li className="nav-item ms-lg-2 d-flex align-items-center gap-2">
                  <Link to="/seller" className="badge bg-warning text-dark p-2 text-decoration-none fw-bold">
                    🏪 Live Seller Feed
                  </Link>
                  <button onClick={logout} className="btn btn-sm btn-outline-danger py-0 px-2 small">
                    Logout
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Delivery Location Modal */}
      <div
        className="modal fade"
        id="locationModal"
        tabIndex={-1}
        aria-labelledby="locationModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow">
            <div className="modal-header border-bottom">
              <div>
                <h5 className="modal-title fw-bold" id="locationModalLabel">
                  📍 Choose Delivery Location
                </h5>
                <small className="text-muted">Enter your area to verify 10-15 minute grocery delivery</small>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>

            <div className="modal-body p-4">
              {/* Custom Search / Address Input */}
              <form onSubmit={handleCustomLocationSubmit} className="mb-4">
                <label className="form-label small fw-semibold text-muted">Enter your locality or pincode</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Indiranagar, 560038"
                    value={customLocationInput}
                    onChange={(e) => setCustomLocationInput(e.target.value)}
                  />
                  <button className="btn btn-success" type="submit" data-bs-dismiss="modal">
                    Set Area
                  </button>
                </div>
              </form>

              <h6 className="fw-bold mb-2 text-dark">Popular Service Areas:</h6>
              <div className="list-group list-group-flush">
                {DELIVERY_LOCATIONS.map((loc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    data-bs-dismiss="modal"
                    className="list-group-item list-group-item-action border-0 px-3 py-2 rounded-3 d-flex justify-content-between align-items-center mb-1"
                  >
                    <div>
                      <strong className="d-block text-dark">{loc.area}, {loc.city}</strong>
                      <small className="text-muted">Pincode: {loc.pincode}</small>
                    </div>
                    <span className="badge bg-success-subtle text-success small fw-semibold">
                      ⚡ {loc.time}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Offcanvas Drawer */}
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header border-bottom">
          <div>
            <h5 id="offcanvasRightLabel" className="mb-0 fs-5 fw-bold">
              🛒 Shopping Basket ({cartCount})
            </h5>
            <small className="text-muted">Delivering to: {selectedLocation}</small>
          </div>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>

        <div className="offcanvas-body">
          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <span className="fs-1 d-block mb-3">🛍️</span>
              <h5 className="fw-bold">Your basket is empty</h5>
              <p className="text-muted small">Add groceries to enjoy 15-minute express delivery.</p>
              <Link
                to="/Shop"
                className="btn btn-success px-4 rounded-pill mt-2"
                data-bs-dismiss="offcanvas"
              >
                Browse Groceries
              </Link>
            </div>
          ) : (
            <>
              <div className="alert alert-success py-2 small mb-3">
                ⚡ Express 10-15 min dispatch guaranteed!
              </div>

              <ul className="list-group list-group-flush">
                {cartItems.map((item) => (
                  <li key={item.id} className="list-group-item py-3 px-0 border-bottom">
                    <div className="row align-items-center g-2">
                      <div className="col-3 text-center">
                        <img
                          src={item.image || item.imageUrl}
                          alt={item.name || item.title}
                          className="img-fluid rounded"
                          style={{ maxHeight: "60px", objectFit: "contain" }}
                        />
                      </div>

                      <div className="col-5">
                        <h6 className="mb-0 text-dark small fw-bold text-truncate">
                          {item.name || item.title}
                        </h6>
                        <small className="text-muted d-block">
                          ₹{Number(item.price || 0).toFixed(2)}
                        </small>
                        <button
                          type="button"
                          className="btn btn-link text-danger p-0 small text-decoration-none mt-1"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="col-4 text-end">
                        <div className="btn-group btn-group-sm mb-1">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="btn btn-light disabled text-dark fw-bold px-2">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="fw-bold small text-dark">
                          ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-top mt-3 pt-3">
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Subtotal</span>
                  <strong className="text-dark">₹{cartTotal.toFixed(2)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Delivery Fee</span>
                  <strong className="text-success">{cartTotal >= 499 ? "FREE" : "₹40.00"}</strong>
                </div>

                <div className="d-flex justify-content-between border-top pt-2 mb-3">
                  <strong className="fs-6">Total Amount</strong>
                  <strong className="fs-5 text-success">
                    ₹{(cartTotal + (cartTotal >= 499 ? 0 : 40)).toFixed(2)}
                  </strong>
                </div>

                <Link
                  to="/quick-order"
                  data-bs-dismiss="offcanvas"
                  className="btn btn-success btn-lg w-100 fw-bold rounded-pill"
                >
                  Proceed to Quick Checkout →
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
