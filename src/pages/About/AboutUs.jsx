import React from "react";
import { Link } from "react-router-dom";
import ScrollToTop from "../ScrollToTop";
import groceryBanner from "../../images/grocery-banner.png";
import idea from "../../images/idea.gif";
import team from "../../images/team.gif";
import award from "../../images/award.gif";
import { Slide, Zoom } from "react-awesome-reveal";

const AboutUs = () => {
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
            <li className="breadcrumb-item active" aria-current="page">
              About FreshCart
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-5">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <Slide direction="left">
                <span className="badge bg-success p-2 mb-3">⚡ 10-15 Minute Quick Commerce</span>
                <h1 className="fw-bold display-5 mb-3 text-dark">
                  Pioneering Fast, Fresh &amp; Reliable Grocery Delivery
                </h1>
                <p className="lead text-muted mb-4">
                  FreshCart connects consumers directly with local darkstores and neighborhood merchants. We bring fruits, vegetables, dairy, snacks, and daily household essentials to your doorstep in 10-15 minutes.
                </p>
                <div className="d-flex flex-wrap gap-3">
                  <Link to="/Shop" className="btn btn-success btn-lg rounded-pill px-4 fw-bold">
                    Browse Groceries →
                  </Link>
                  <Link to="/StoreList" className="btn btn-outline-dark btn-lg rounded-pill px-4 fw-semibold">
                    Explore Partner Stores
                  </Link>
                </div>
              </Slide>
            </div>

            <div className="col-lg-5 text-center">
              <Zoom>
                <img
                  src={groceryBanner}
                  alt="Quick Grocery Delivery"
                  className="img-fluid rounded-4 shadow-sm"
                  style={{ maxHeight: "280px", objectFit: "contain" }}
                />
              </Zoom>
            </div>
          </div>
        </div>

        {/* Three Value Pillars */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center">
              <img src={idea} alt="Instant Speed" style={{ width: "80px", height: "80px" }} className="mx-auto mb-3" />
              <h4 className="fw-bold mb-2">10-15 Min Dispatch</h4>
              <p className="text-muted small mb-0">
                Optimized micro-fulfillment dark stores placed within 2-3km radius ensure your items are picked and packed in under 3 minutes.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center">
              <img src={award} alt="Farm Fresh Quality" style={{ width: "80px", height: "80px" }} className="mx-auto mb-3" />
              <h4 className="fw-bold mb-2">Farm Fresh Quality</h4>
              <p className="text-muted small mb-0">
                Direct sourcing from farmers and certified brands ensures that dairy, bakery, and produce are fresh and hygienically handled.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center">
              <img src={team} alt="Local Merchants" style={{ width: "80px", height: "80px" }} className="mx-auto mb-3" />
              <h4 className="fw-bold mb-2">Empowering Local Stores</h4>
              <p className="text-muted small mb-0">
                We partner with local neighborhood grocery retailers, giving them seller dashboards to manage real-time inventory and delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Partner with us CTA */}
        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-dark text-white text-center">
          <div className="py-3" style={{ maxWidth: "650px", margin: "0 auto" }}>
            <h2 className="fw-bold mb-3">Are you a Retailer or Darkstore Merchant?</h2>
            <p className="text-light mb-4">
              Join our network of quick-commerce fulfillment partners. List your catalog, accept orders with sound alerts, and reach thousands of nearby customers.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/seller/login" className="btn btn-warning btn-lg rounded-pill px-4 fw-bold text-dark">
                🏪 Merchant Login
              </Link>
              <Link to="/Contact" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold">
                Partner Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
