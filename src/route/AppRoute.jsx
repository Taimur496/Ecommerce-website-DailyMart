import React, { Fragment } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import MainLayout from "../layouts/MainLayout";
import UserLogin from "../pages/UserLogin";
import Contact from "../pages/Contact";
import Privacy from "../pages/Privacy";
import Purchase from "../pages/Purchase";
import Refund from "../pages/Refund";
import ProductDetails from "../components/ProductDetails/ProductDetails";
import Notification from "../components/Notification/Notification";
import Cart from "../components/Cart/Cart";
import About from "../components/others/About";
import Register from "../pages/Register";
import ForgetPassword from "../pages/ForgetPassword";
import ResetPassword from "../pages/ResetPassword";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../admin-components/AdminDashboard";

// Import admin page components
import AdminBody from "../admin-components/common/AdminBody";
import CatShow from "../admin-components/category/Show";
import CatCreate from "../admin-components/category/Create";
import CatEdit from "../admin-components/category/Edit";
import SubCatShow from "../admin-components/subcategory/Show";
import SubCatCreate from "../admin-components/subcategory/Create";
import SubCatEdit from "../admin-components/subcategory/Edit";
import ProductShow from "../admin-components/product/Show";
import ProductCreate from "../admin-components/product/Create";
import ProductEdit from "../admin-components/product/Edit";
import BrandShow from "../admin-components/brand/Show";
import BrandCreate from "../admin-components/brand/Create";
import BrandEdit from "../admin-components/brand/Edit";
import Order from "../admin/orders/Order";
import ShopPage from "../components/home/ShopPage";
import Checkout from "../pages/Checkout";
import OrderSuccess from "../pages/OrderSuccess";
import MyOrders from "../profile/MyOrders";
import OrderDetails from "../profile/OrderDetails";
import AdminOrderDetails from "../admin/orders/OrderDetails";
import UserManagement from "../admin/usermanagement/UserManagement";
import AdminProfile from "../admin/profile/AdminProfile";
import UserProfile from "../components/common/UserProfile";
import ShippingManagement from "../admin/shipping/ShippingManagement";
import CouponManagement from "../admin/coupon/CouponManagement ";
import Wishlist from "../components/Favourite/Wishlist";
import SliderCreate from "../admin-components/slider/create";
import SliderShow from "../admin-components/slider/Show";
import SliderEdit from "../admin-components/slider/Edit";
import NotFound from "../pages/NotFound";

const AppRoute = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="purchase" element={<Purchase />} />
        <Route path="refund" element={<Refund />} />
        <Route path="productdetails" element={<ProductDetails />} />
        <Route path="shop" element={<ShopPage />} />
      </Route>

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute requiredRole="user">
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="my-profile" element={<UserProfile />} />
        {/* <Route path="/user/profile" element={<UserProfile />} /> */}
        <Route path="notification" element={<Notification />} />
        <Route path="wishlists" element={<Wishlist />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="my-orders" element={<MyOrders />} />
        <Route path="/order-details/:orderId" element={<OrderDetails />} />
      </Route>

      {/* Admin routes with proper nesting */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        {/* Nested admin routes */}
        <Route index element={<AdminBody />} />
        <Route path="dashboard" element={<AdminBody />} />
        <Route path="getall-users" element={<UserManagement />} />
        <Route path="profile" element={<AdminProfile />} />

        {/* Category routes */}
        <Route path="categories" element={<CatShow />} />
        <Route path="category-create" element={<CatCreate />} />
        <Route path="category-edit/:id" element={<CatEdit />} />

        {/* Subcategory routes */}
        <Route path="subcategories" element={<SubCatShow />} />
        <Route path="subcategory-create" element={<SubCatCreate />} />
        <Route path="subcategory-edit/:id" element={<SubCatEdit />} />
        {/* Product routes */}
        <Route path="products" element={<ProductShow />} />
        <Route path="product-create" element={<ProductCreate />} />
        <Route path="product-edit/:id" element={<ProductEdit />} />

        {/* Brand routes */}
        <Route path="brands" element={<BrandShow />} />
        <Route path="brand-create" element={<BrandCreate />} />
        <Route path="brand-edit/:id" element={<BrandEdit />} />
        {/* Orders */}
        <Route path="orders" element={<Order />} />
        <Route path="order-details/:orderId" element={<AdminOrderDetails />} />
        {/* Shipping */}
        <Route path="shipping" element={<ShippingManagement />} />
        {/* coupon */}
        <Route path="coupons" element={<CouponManagement />} />
        {/* sliders */}
        <Route path="sliders" element={<SliderShow />} />
        <Route path="sliders/create" element={<SliderCreate />} />
        <Route path="sliders/edit/:id" element={<SliderEdit />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoute;
