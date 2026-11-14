// react 
import React from "react";
// css
import "./App.css";
// browserrouter 
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// Components
import Header from './Component/Header';
import Footer from "./Component/Footer";
// pages
import Home from "./pages/Home";
// About pages
import AboutUs from "./pages/About/AboutUs";
import Blog from "./pages/About/Blog";
import BlogCategory from "./pages/About/BlogCategory";
import Contact from "./pages/About/Contact";
// Shop pages
import Shop from "./pages/Shop/Shop";
import ShopGridCol3 from "./pages/Shop/ShopGridCol3";
import ShopListCol from "./pages/Shop/ShopListCol";
import ShopCart from "./pages/Shop/ShopCart";
import QuickCheckout from "./pages/Shop/QuickCheckout";
import OrderTracker from "./pages/Shop/OrderTracker";
import ShopWishList from "./pages/Shop/ShopWishList";
// Store pages
import StoreList from "./pages/store/StoreList";
import SingleShop from "./pages/store/SingleShop";
// Seller Portal & Auth
import SellerDashboard from "./pages/Seller/SellerDashboard";
import SellerLogin from "./pages/Seller/SellerLogin";
import CustomerLogin from "./pages/Accounts/CustomerLogin";
import { SellerRoute } from "./Component/ProtectedRoute";
// Account pages
import MyAccountOrder from "./pages/Accounts/MyAccountOrder";
import MyAccountSetting from "./pages/Accounts/MyAcconutSetting";
import MyAcconutNotification from "./pages/Accounts/MyAcconutNotification";
import MyAcconutPaymentMethod from "./pages/Accounts/MyAcconutPaymentMethod";
import MyAccountAddress from "./pages/Accounts/MyAccountAddress";
import MyAccountForgetPassword from "./pages/Accounts/MyAccountForgetPassword";
import MyAccountSignIn from "./pages/Accounts/MyAccountSignIn";
import MyAccountSignUp from "./pages/Accounts/MyAccountSignUp";
const App = () => {
  return (
    <div>
      <Router>
        <Header/>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Shop & Quick Delivery pages */}
          <Route path="/Shop" element={<Shop />} />
          <Route path="/ShopGridCol3" element={<ShopGridCol3 />} />
          <Route path="/ShopListCol" element={<ShopListCol />} />
          <Route path="/ShopWishList" element={<ShopWishList />} />
          <Route path="/ShopCheckOut" element={<QuickCheckout />} />
          <Route path="/quick-order" element={<QuickCheckout />} />
          <Route path="/order-track/:orderId" element={<OrderTracker />} />
          <Route path="/ShopCart" element={<ShopCart />} />
          {/* Seller / Store Dashboard (Protected: Sellers only) */}
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route
            path="/seller"
            element={
              <SellerRoute>
                <SellerDashboard />
              </SellerRoute>
            }
          />
          {/* Customer Auth */}
          <Route path="/customer-login" element={<CustomerLogin />} />
          <Route path="/MyAccountSignIn" element={<CustomerLogin />} />
          {/* Store pages */}
          <Route path="/StoreList" element={<StoreList />} />
          <Route path="/SingleShop" element={<SingleShop />} />
          {/* Accounts pages */}
          <Route path="/MyAccountOrder" element={<MyAccountOrder />} />
          <Route path="/MyAccountSetting" element={<MyAccountSetting />} />
          <Route path="/MyAcconutNotification" element={<MyAcconutNotification />} />
          <Route path="/MyAcconutPaymentMethod" element={<MyAcconutPaymentMethod />} />
          <Route path="/MyAccountAddress" element={<MyAccountAddress />} />
          <Route path="/MyAccountForgetPassword" element={<MyAccountForgetPassword />} />
          <Route path="/MyAccountSignIn" element={<MyAccountSignIn />} />
          <Route path="/MyAccountSignUp" element={<MyAccountSignUp />} />
          {/* About pages */}
          <Route path="/Blog" element={<Blog />} />
          <Route path="/BlogCategory" element={<BlogCategory />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/AboutUs" element={<AboutUs />} />
        </Routes>
        <Footer/>
      </Router>
    </div>
  );
};

export default App;
