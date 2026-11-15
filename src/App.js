// react 
import React from "react";
// css
import "./App.css";
// browserrouter 
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// Components
import Header from "./Component/Header";
import Footer from "./Component/Footer";
// pages
import Home from "./pages/Home";
// About pages
import AboutUs from "./pages/About/AboutUs";
import Contact from "./pages/About/Contact";
// Shop pages
import Shop from "./pages/Shop/Shop";
import QuickCheckout from "./pages/Shop/QuickCheckout";
import OrderTracker from "./pages/Shop/OrderTracker";
import ShopWishList from "./pages/Shop/ShopWishList";
// Store pages
import StoreList from "./pages/store/StoreList";
// Seller Portal & Auth
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerLogin from "./pages/Seller/SellerLogin";
import CustomerLogin from "./pages/Accounts/CustomerLogin";
import { SellerRoute } from "./Component/ProtectedRoute";
// Account pages
import MyAccountOrder from "./pages/Accounts/MyAccountOrder";

const App = () => {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />

          {/* Shop & Single Unified Quick Checkout */}
          <Route path="/Shop" element={<Shop />} />
          <Route path="/ShopWishList" element={<ShopWishList />} />
          <Route path="/ShopCart" element={<Navigate to="/quick-order" replace />} />
          <Route path="/ShopCheckOut" element={<Navigate to="/quick-order" replace />} />
          <Route path="/checkout" element={<Navigate to="/quick-order" replace />} />
          <Route path="/quick-order" element={<QuickCheckout />} />
          <Route path="/order-track/:orderId" element={<OrderTracker />} />

          {/* Stores */}
          <Route path="/StoreList" element={<StoreList />} />
          <Route path="/SingleShop" element={<Navigate to="/Shop" replace />} />

          {/* Seller / Store Portal */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route
            path="/seller"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />

          {/* Customer Auth */}
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/MyAccountSignIn" element={<CustomerLogin />} />
          <Route path="/login" element={<CustomerLogin />} />

          {/* Account & Orders */}
          <Route path="/MyAccountOrder" element={<MyAccountOrder />} />

          {/* Info Pages */}
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/Contact" element={<Contact />} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </Router>
    </div>
  );
};

export default App;
