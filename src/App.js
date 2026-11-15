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
import ShopCart from "./pages/Shop/ShopCart";
import QuickCheckout from "./pages/Shop/QuickCheckout";
import OrderTracker from "./pages/Shop/OrderTracker";
import ShopWishList from "./pages/Shop/ShopWishList";
// Store pages
import StoreList from "./pages/store/StoreList";
// Seller Portal & Auth
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerLogin from "./pages/Seller/SellerLogin";
import VendorRegister from "./pages/Seller/VendorRegister";
import CustomerLogin from "./pages/Accounts/CustomerLogin";
import CustomerSignUp from "./pages/Accounts/CustomerSignUp";
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

          {/* Shop, Cart & Unified Main Checkout */}
          <Route path="/Shop" element={<Shop />} />
          <Route path="/ShopWishList" element={<ShopWishList />} />
          <Route path="/ShopCart" element={<ShopCart />} />
          <Route path="/cart" element={<ShopCart />} />
          <Route path="/checkout" element={<QuickCheckout />} />
          <Route path="/quick-order" element={<Navigate to="/checkout" replace />} />
          <Route path="/ShopCheckOut" element={<Navigate to="/checkout" replace />} />
          <Route path="/order-track/:orderId" element={<OrderTracker />} />

          {/* Stores */}
          <Route path="/StoreList" element={<StoreList />} />
          <Route path="/SingleShop" element={<Navigate to="/Shop" replace />} />

          {/* Seller / Store Portal & Vendor Onboarding */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/vendor/login" element={<SellerLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/seller/register" element={<VendorRegister />} />
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
          <Route
            path="/admin"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />

          {/* Customer Auth (Sign In & Sign Up) */}
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/MyAccountSignIn" element={<CustomerLogin />} />
          <Route path="/login" element={<CustomerLogin />} />
          <Route path="/signup" element={<CustomerSignUp />} />
          <Route path="/register" element={<CustomerSignUp />} />
          <Route path="/customer-signup" element={<CustomerSignUp />} />
          <Route path="/MyAccountSignUp" element={<CustomerSignUp />} />

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
