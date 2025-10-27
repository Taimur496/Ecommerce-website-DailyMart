import React from "react";
import Navbar from "../components/common/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../components/common/Footer";

const MainLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default MainLayout;
