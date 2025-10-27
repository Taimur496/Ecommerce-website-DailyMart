import React, { useState, useEffect } from "react";
import "../../assets/css/header.css";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import avatarImg from "../../assets/images/avatars/avatarnew.jpg";

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

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

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }

    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Listen for storage changes to update user data in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.body.classList.toggle("dark-mode", newDarkMode);
  };

  const { logout } = useAuth();

  const notifications = [
    { id: 1, message: "New user registered", time: "2 min ago", unread: true },
    {
      id: 2,
      message: "Server maintenance scheduled",
      time: "1 hour ago",
      unread: true,
    },
    { id: 3, message: "Payment processed", time: "3 hours ago", unread: false },
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to get profile image
  const getProfileImage = () => {
    if (currentUser?.profile_photo_url) {
      return currentUser.profile_photo_url;
    }
    if (currentUser?.profile_photo_path) {
      return `http://localhost:8000/storage/${currentUser.profile_photo_path}`;
    }
    return avatarImg;
  };

  // Function to get user initials for fallback avatar
  const getUserInitials = () => {
    if (!currentUser?.name) return "U";
    return currentUser.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      <header
        className=" admin-header"
        style={{
          position: isSticky ? "fixed" : "relative",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 999,
          width: "100%",
          transition: "all 0.3s ease",
        }}
      >
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            {/* Logo & Brand */}
            <div className="">
              <div className="brand-section">
                <span className="brand-name"></span>
              </div>
            </div>

            {/* Right Section */}
            <div className="">
              <div className="header-actions">
                {/* Theme Toggle */}
                <button
                  className="action-btn theme-toggle"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </button>

                {/* Notifications */}
                <div className="dropdown-container">
                  <button
                    className="action-btn notification-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    <span className="notification-badge">3</span>
                  </button>

                  <div
                    className={`admin-menu notification-dropdown ${
                      !showNotifications ? "hidden" : ""
                    }`}
                    style={{ display: showNotifications ? "block" : "none" }}
                  >
                    <div className="dropdown-header">
                      <h6>Notifications</h6>
                      <span className="badge">3 new</span>
                    </div>
                    <div className="notification-list">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${
                            notif.unread ? "unread" : ""
                          }`}
                        >
                          <div className="notification-content">
                            <p>{notif.message}</p>
                            <small>{notif.time}</small>
                          </div>
                          {notif.unread && <div className="unread-dot"></div>}
                        </div>
                      ))}
                    </div>
                    <div className="dropdown-footer">
                      <button className="header-btn-link">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <div className="dropdown-container">
                  <button
                    className="profile-btn"
                    onClick={() => setShowProfile(!showProfile)}
                  >
                    <div className="status-indicator online"></div>
                    {getProfileImage() ? (
                      <img
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                        src={getProfileImage()}
                        alt="Profile"
                        className="profile-avatar"
                        onError={(e) => {
                          // If image fails to load, show initials
                          e.target.style.display = "none";
                          const parent = e.target.parentElement;
                          const fallback = document.createElement("div");
                          fallback.className = "profile-avatar-fallback";
                          fallback.textContent = getUserInitials();
                          fallback.style.cssText = `
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: 600;
                            font-size: 14px;
                          `;
                          parent.appendChild(fallback);
                        }}
                      />
                    ) : (
                      <div
                        className="profile-avatar-fallback"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          fontSize: "14px",
                        }}
                      >
                        {getUserInitials()}
                      </div>
                    )}
                    <div className="profile-info">
                      <span className="profile-name">
                        {currentUser?.name || "Admin User"}
                      </span>
                      <span className="profile-role">
                        {currentUser?.role
                          ? currentUser.role.charAt(0).toUpperCase() +
                            currentUser.role.slice(1)
                          : "Admin"}
                      </span>
                    </div>
                    <svg
                      className="dropdown-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>

                  <div
                    className={`admin-menu profile-dropdown ${
                      !showProfile ? "hidden" : ""
                    }`}
                    style={{ display: showProfile ? "block" : "none" }}
                  >
                    <div className="profile-header">
                      {getProfileImage() ? (
                        <img
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                          src={getProfileImage()}
                          alt="Profile"
                          className="profile-avatar-large"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const parent = e.target.parentElement;
                            const fallback = document.createElement("div");
                            fallback.className =
                              "profile-avatar-large-fallback";
                            fallback.textContent = getUserInitials();
                            fallback.style.cssText = `
                              width: 60px;
                              height: 60px;
                              border-radius: 50%;
                              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              font-weight: 600;
                              font-size: 18px;
                              margin-right: 12px;
                            `;
                            parent.insertBefore(fallback, parent.firstChild);
                          }}
                        />
                      ) : (
                        <div
                          className="profile-avatar-large-fallback"
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "600",
                            fontSize: "18px",
                            marginRight: "12px",
                          }}
                        >
                          {getUserInitials()}
                        </div>
                      )}
                      <div>
                        <h6>{currentUser?.name || "Admin User"}</h6>
                        <p>{currentUser?.email || "admin@email.com"}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link className="text-decoration-none" to="/admin/profile">
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
              </div>
            </div>
          </div>
        </div>
      </header>
      {isSticky && <div style={{ height: "80px" }}></div>}
    </div>
  );
};

export default Header;
