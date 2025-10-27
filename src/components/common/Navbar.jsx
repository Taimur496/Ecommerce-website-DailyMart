import React, { useState, useEffect } from "react";
import Logo from "../../assets/images/logoedited.png";
import { FaSearch } from "react-icons/fa";
import "../../assets/css/navbar.css";

import {
  User,
  Heart,
  ShoppingCart,
  Menu,
  Bell,
  ShoppingBag,
} from "lucide-react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import UpperMenu from "../home/UpperMenu";
import { useSelector, useDispatch } from "react-redux";
import { fetchWishlistCount } from "../../redux/slices/wishlistSlice";

const Navbar = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  const dispatch = useDispatch();
  const totalItems = useSelector((state) => state.cart.totalItems);
  const wishlistCount = useSelector((state) => state.wishlist.count);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 0) {
        // Adjust this value as needed
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Fetch wishlist count on component mount
  useEffect(() => {
    dispatch(fetchWishlistCount());

    // Refresh wishlist count every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchWishlistCount());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1000) {
        setShowMobileSearch(false);
        setShowMobileMenu(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileView = windowWidth <= 1000;
  const { user, logout } = useAuth();

  const handleCloseMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      {/* Main Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light bg-white"
        style={{
          position: isSticky ? "fixed" : "relative",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        <div className="container-fluid">
          {/* Left Side - Menu Toggle (mobile only) */}
          {isMobileView && (
            <Button
              className="custom_padding bg-primary"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <Menu className="custom_nav_menu text-white" />
            </Button>
          )}
          {/* Logo */}
          <Link
            className={`navbar-brand ${
              isMobileView ? "order-2 mx-auto" : "order-1"
            }`}
            to="/"
          >
            <img className="logo-img" src={Logo} alt="Logo" height="34" />
          </Link>

          {/* Mobile Right Side (search toggle + login) */}
          {isMobileView && (
            <div className="d-flex custom_search order-3">
              <button
                className="btn btn-link me-2"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
              >
                <FaSearch />
              </button>

              {user ? (
                <div className="dropdown-container">
                  <button
                    className="btn btn-link "
                    onClick={() => setShowProfile(!showProfile)}
                  >
                    <User size={20} className="profile-btn-hover" />
                  </button>

                  <div
                    className={`admin-menu profile-dropdown ${
                      !showProfile ? "hidden" : ""
                    }`}
                    style={{ display: showProfile ? "block" : "none" }}
                  >
                    <Link className="text-decoration-none" to="my-profile">
                      <div className="dropdown-item">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                      </div>
                    </Link>
                    <div className="dropdown-item">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                      </svg>
                      Account Settings
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      className="text-decoration-none"
                      onClick={logout}
                      to="/"
                    >
                      <div className="dropdown-item text-danger">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Logout
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn btn-link">
                  <User size={20} className="profile-btn-hover" />
                </Link>
              )}
            </div>
          )}

          {/* Desktop Navigation */}
          {!isMobileView && (
            <>
              {/* Desktop Search (centered) */}
              <form
                onSubmit={handleSearch}
                className="d-flex order-2 flex-grow-1 justify-content-center mx-4"
              >
                <div
                  className="input-group"
                  style={{ maxWidth: "600px", width: "100%" }}
                >
                  <input
                    type="search"
                    className="form-control"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    className="custom_radius btn btn-primary"
                    type="submit"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>

              {/* Desktop Right Side Items */}
              <div className="d-flex order-3 ms-auto align-items-center">
                <Link
                  to="/notification"
                  className="btn btn-link position-relative me-3"
                >
                  <Bell size={22} className="" />
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    3
                  </span>
                </Link>

                {/* Wishlist with Counter */}
                <Link
                  to="/wishlists"
                  className="btn btn-link position-relative me-3"
                >
                  <Heart size={22} className="" />
                  {wishlistCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="btn btn-link position-relative me-3"
                >
                  <ShoppingCart size={22} className="" />
                  {totalItems > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div className="dropdown-container">
                    <button
                      className="navbar-profile-btn"
                      onClick={() => setShowProfile(!showProfile)}
                    >
                      <div className="navbar-profile-info">
                        <span className="profile-name ">My Account</span>
                      </div>
                    </button>

                    <div
                      className={`admin-menu profile-dropdown ${
                        !showProfile ? "hidden" : ""
                      }`}
                      style={{ display: showProfile ? "block" : "none" }}
                    >
                      <Link className="text-decoration-none" to="my-profile">
                        <div className="dropdown-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          Profile
                        </div>
                      </Link>
                      <Link className="text-decoration-none" to="/my-orders">
                        <div className="dropdown-item">
                          <ShoppingBag size={18} />
                          My Orders
                        </div>
                      </Link>
                      <div className="dropdown-item">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                        </svg>
                        Account Settings
                      </div>
                      <div className="dropdown-divider"></div>
                      <Link
                        className="text-decoration-none"
                        onClick={logout}
                        to="/"
                      >
                        <div className="dropdown-item text-danger">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                          </svg>
                          Logout
                        </div>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn btn-link text-decoration-none"
                  >
                    <button className="icon_border">
                      <User size={20} className="me-1" />
                      <span>Login</span>
                    </button>
                  </Link>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Search Bar (appears below navbar) */}
        {isMobileView && showMobileSearch && (
          <div className="container-fluid py-2 bg-light border-top rounded-2 mt-2">
            <form onSubmit={handleSearch} className="d-flex w-100">
              <div className="input-group">
                <input
                  type="search"
                  className="form-control"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="custom_radius btn btn-primary" type="submit">
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>
        )}
      </nav>
      {/* Add spacer to prevent content jump when navbar becomes fixed */}
      {isSticky && <div style={{ height: "80px" }}></div>}
      {/* Mobile Menu (offcanvas) */}
      {isMobileView && (
        <div className={`custom-offcanvas ${showMobileMenu ? "show" : ""}`}>
          <div className="d-flex justify-content-between mega-menu-header border-bottom">
            <h5 className="offcanvas-title">All Categories</h5>
            <svg
              onClick={handleCloseMobileMenu}
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-x cursor-pointer"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="m15 9-6 6"></path>
              <path d="m9 9 6 6"></path>
            </svg>
          </div>
          <div>
            <UpperMenu
              isMobile={isMobileView}
              isOpen={showMobileMenu}
              onClose={handleCloseMobileMenu}
            />
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav (fixed) */}
      {isMobileView && (
        <div className="fixed-bottom bg-white shadow-lg d-lg-none border-top custom-z-index">
          <div className="container-fluid">
            <div className="d-flex justify-content-between py-1">
              <Link
                to="/notification"
                className="text-center text-decoration-none text-dark"
              >
                <div
                  className="position-relative mx-auto"
                  style={{ width: "24px" }}
                >
                  <Bell size={22} className=" text-secondary" />
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style={{ fontSize: "11px" }}
                  >
                    3
                  </span>
                </div>
                <div className="custom_font small mt-0">Notification</div>
              </Link>
              <Link
                to="/wishlists"
                className="text-center text-decoration-none text-dark"
              >
                <div
                  className="position-relative mx-auto"
                  style={{ width: "24px" }}
                >
                  <Heart size={22} className=" text-secondary" />
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: "11px" }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <div className="custom_font small mt-0">Wishlist</div>
              </Link>

              <Link
                to="/cart"
                className="text-center text-decoration-none text-dark"
              >
                <div
                  className="position-relative mx-auto"
                  style={{ width: "24px" }}
                >
                  <ShoppingCart size={22} className="text-secondary" />
                  {totalItems > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"
                      style={{ fontSize: "11px" }}
                    >
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="custom_font small mt-0">Cart</div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
