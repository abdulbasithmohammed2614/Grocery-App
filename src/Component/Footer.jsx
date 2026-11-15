import React, { useState } from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.min.css";
import groceryshop from "../images/fdlogo.png";
import amazonpay from "../images/amazonpay.svg";
import american from "../images/american-express.svg";
import mastercard from "../images/mastercard.svg";
import paypal from "../images/paypal.svg";
import visa from "../images/visa.svg";
import Swal from "sweetalert2";

const Footer = () => {
  const year = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: `Coupon code FRESH10 has been sent to ${newsletterEmail}`,
        timer: 2000,
        showConfirmButton: false,
      });
      setNewsletterEmail("");
    }
  };

  return (
    <div>
      <footer className="footer mt-8">
        <div className="overlay" />
        <div className="container">
          <div className="row footer-row g-4">
            {/* Column 1: Brand & Payment */}
            <div className="col-sm-6 col-lg-3 mb-30">
              <div className="footer-widget">
                <div className="footer-logo">
                  <Link to="/">
                    <img
                      src={groceryshop}
                      style={{ width: 220, padding: 10, marginLeft: "-10px" }}
                      alt="Grocery App Logo"
                    />
                  </Link>
                </div>
                <p className="mb-30 text-muted small">
                  ⚡ 10-15 minute grocery delivery from your local neighborhood dark stores. Fresh fruits, dairy, snacks, and essentials delivered safely.
                </p>
              </div>
              <div className="dimc-protect">
                <div className="text-lg-start text-center mb-2 mb-lg-0">
                  <h6 className="fw-bold mb-2">Accepted Payments</h6>
                  <ul className="list-inline d-flex gap-2 mb-0">
                    <li className="list-inline-item">
                      <img src={amazonpay} alt="Amazon Pay" style={{ height: "24px" }} />
                    </li>
                    <li className="list-inline-item">
                      <img src={american} alt="Amex" style={{ height: "24px" }} />
                    </li>
                    <li className="list-inline-item">
                      <img src={mastercard} alt="Mastercard" style={{ height: "24px" }} />
                    </li>
                    <li className="list-inline-item">
                      <img src={paypal} alt="Paypal" style={{ height: "24px" }} />
                    </li>
                    <li className="list-inline-item">
                      <img src={visa} alt="Visa" style={{ height: "24px" }} />
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: Categories */}
            <div className="col-sm-6 col-lg-3 mb-30">
              <div className="footer-widget mb-0">
                <h5 className="fw-bold mb-3">Popular Categories</h5>
                <div className="line-footer mb-3" />
                <ul className="footer-link list-unstyled mb-0">
                  <li className="mb-2">
                    <Link to="/Shop?category=Dairy,%20Bread%20&%20Eggs" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Dairy, Bread &amp; Eggs
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Snacks%20&%20Munchies" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Snacks &amp; Munchies
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Fruits%20&%20Vegetables" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Fruits &amp; Vegetables
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Cold%20Drinks%20&%20Juices" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Cold Drinks &amp; Juices
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Instant%20Food" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Instant Food
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Bakery%20&%20Biscuits" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Bakery &amp; Biscuits
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/Shop?category=Atta,%20Rice%20&%20Dal" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Atta, Rice &amp; Dal
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div className="col-sm-6 col-lg-3 mb-30">
              <div className="footer-widget mb-0">
                <h5 className="fw-bold mb-3">Quick Links</h5>
                <div className="line-footer mb-3" />
                <ul className="footer-link list-unstyled mb-0">
                  <li className="mb-2">
                    <Link to="/Shop" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Browse All Products
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/quick-order" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> ⚡ 1-Click Quick Order
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/ShopWishList" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> My Saved Wishlist
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/ShopCart" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> View Cart
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/MyAccountOrder" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Track Active Deliveries
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/StoreList" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Nearby Darkstores
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link to="/seller/login" className="text-decoration-none text-muted">
                      <i className="fa fa-angle-right me-2 text-success" /> Partner / Seller Portal
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Newsletter */}
            <div className="col-sm-6 col-lg-3 mb-30">
              <div className="footer-widget mb-0">
                <h5 className="fw-bold mb-3">Get Deals &amp; Discounts</h5>
                <div className="line-footer mb-3" />
                <p className="text-muted small">
                  Subscribe to receive weekly coupon codes &amp; flash delivery notifications.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="newsletter-item d-flex mt-3">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="form-control rounded-start"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-success rounded-end">
                    <i className="fa fa-paper-plane" />
                  </button>
                </form>

                <div className="mt-4">
                  <h6 className="fw-bold small text-muted mb-2">Connect With Us</h6>
                  <div className="d-flex gap-2">
                    <Link to="/Contact" className="btn btn-sm btn-outline-secondary rounded-circle" title="Contact Us">
                      <i className="fas fa-envelope"></i>
                    </Link>
                    <Link to="/AboutUs" className="btn btn-sm btn-outline-secondary rounded-circle" title="About Us">
                      <i className="fas fa-info"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bar mt-4 pt-3 border-top">
          <div className="container text-center">
            <small className="text-muted">
              © {year} FreshCart Grocery Delivery. All Rights Reserved. Delivered in 10-15 minutes.
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
