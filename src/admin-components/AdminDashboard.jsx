import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "../assets/css/admindashboard.css";
import Sidebar from "./common/Sidebar";
import Header from "./common/Header";

const AdminDashboard = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Set active menu based on current path
  React.useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath.includes("/dashboard")) {
      setActiveMenu("dashboard");
    } else if (currentPath.includes("/sliders")) {
      setActiveMenu("sliders");
    } else if (currentPath.includes("/categories")) {
      setActiveMenu("categories");
    } else if (currentPath.includes("/subcategories")) {
      setActiveMenu("subcategories");
    } else if (currentPath.includes("/brands")) {
      setActiveMenu("brands");
    } else if (currentPath.includes("/products")) {
      setActiveMenu("products");
    } else if (currentPath.includes("/orders")) {
      setActiveMenu("orders");
    } else if (currentPath.includes("/getall-users")) {
      setActiveMenu("users");
    } else if (currentPath.includes("/shipping")) {
      setActiveMenu("shipping");
    } else if (currentPath.includes("/coupon")) {
      setActiveMenu("coupon");
    } else if (currentPath.includes("/settings")) {
      setActiveMenu("settings");
    }
  }, [location.pathname]);

  return (
    <div className="admin-dashboard">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className={`main-content ${sidebarCollapsed ? "expanded" : ""}`}>
        {/* Header */}
        <Header />

        {/* Dynamic Content Based on Route - Now uses React Router's Outlet */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
