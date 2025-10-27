import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../assets/css/sidebar.css";
import {
  BarChart3,
  SlidersHorizontal,
  Package,
  ShoppingCart,
  Users,
  Truck,
  TicketPercent,
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Tags,
  FileText,
  Building2,
  Box,
  User,
  Shield,
} from "lucide-react";
import { adminAPI } from "../../services/api";

const Sidebar = ({
  sidebarCollapsed,
  toggleSidebar,
  activeMenu,
  setActiveMenu,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    "product-management": false,
  });
  const [isNavigating, setIsNavigating] = useState(false);
  const [stats, setStats] = useState({
    all_users_count: 0,
    total_orders: 0,
    total_products: 0,
    total_categories: 0,
    total_subcategories: 0,
    total_brands: 0,
  });

  // Fetch dashboard stats for counts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminAPI.dashboard();
        setStats({
          all_users_count: response.data.data.all_users_count || 0,
          total_orders: response.data.data.total_orders || 0,
          total_products: response.data.data.total_products || 0,
          total_categories: response.data.data.total_categories || 0,
          total_subcategories: response.data.data.total_subcategories || 0,
          total_brands: response.data.data.total_brands || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };

    fetchStats();
  }, []);

  const menuItems = [
    {
      id: "dashboard",
      icon: BarChart3,
      label: "Dashboard",
      subtitle: "Overview & Analytics",
      path: "/admin/dashboard",
    },
    {
      id: "sliders",
      icon: SlidersHorizontal,
      label: "Sliders",
      subtitle: "Overview & Analytics",
      path: "/admin/sliders",
    },
    {
      id: "product-management",
      icon: Package,
      label: "Product Management",
      subtitle: "Manage inventory",
      count: stats.total_products,
      hasDropdown: true,
      children: [
        {
          id: "categories",
          icon: Tags,
          label: "Categories",
          path: "/admin/categories",
          count: stats.total_categories,
        },
        {
          id: "subcategories",
          icon: FileText,
          label: "Subcategories",
          path: "/admin/subcategories",
          count: stats.total_subcategories,
        },
        {
          id: "brands",
          icon: Building2,
          label: "Brands",
          path: "/admin/brands",
          count: stats.total_brands,
        },
        {
          id: "products",
          icon: Box,
          label: "Products",
          path: "/admin/products",
          count: stats.total_products,
        },
      ],
    },
    {
      id: "orders",
      icon: ShoppingCart,
      label: "Orders",
      subtitle: "Manage customer orders",
      count: stats.total_orders,
      highlight: true,
      path: "/admin/orders",
    },
    {
      id: "users",
      icon: Users,
      label: "Users",
      subtitle: "User management",
      count: stats.all_users_count,
      path: "/admin/getall-users",
    },
    {
      id: "shipping",
      icon: Truck,
      label: "Shipping",
      subtitle: "Delivery & logistics",
      path: "/admin/shipping",
    },
    {
      id: "coupon",
      icon: TicketPercent,
      label: "Coupon",
      subtitle: "Delivery & logistics",
      path: "/admin/coupons",
    },
    {
      id: "settings",
      icon: Settings,
      label: "Settings",
      subtitle: "System configuration",
      path: "/admin/settings",
    },
  ];

  // Auto-expand Product Management if we're on a product route
  useEffect(() => {
    const productRoutes = [
      "/admin/categories",
      "/admin/subcategories",
      "/admin/brands",
      "/admin/products",
    ];
    const isOnProductRoute = productRoutes.some((route) =>
      location.pathname.startsWith(route)
    );

    if (isOnProductRoute) {
      setExpandedSections((prev) => ({
        ...prev,
        "product-management": true,
      }));
    }

    // Reset navigation state after route changes with a small delay
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleSectionToggle = (sectionId) => {
    if (sidebarCollapsed) return;

    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleMenuClick = (itemId, hasChildren = false, path = null) => {
    if (isNavigating) return; // Prevent clicks when navigating

    setActiveMenu(itemId);

    if (hasChildren) {
      handleSectionToggle(itemId);
    } else if (path) {
      // Only set navigating if we're going to a different page
      if (location.pathname !== path) {
        setIsNavigating(true);
      }
      navigate(path);
    }
  };

  const handleSubmenuClick = (childId, path) => {
    setActiveMenu(childId);
    // Only set navigating if we're going to a different page
    if (location.pathname !== path) {
      setIsNavigating(true);
    }
    navigate(path);
  };

  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle &&
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={`modern-sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header */}
      <div className="sidebar-header">
        {!sidebarCollapsed && (
          <div className="logo">
            <div className="logo-icon">
              <Shield size={20} />
            </div>

            <div className="logo-text">
              <h4>Admin Panel</h4>
              <small>Dashboard</small>
            </div>
          </div>
        )}
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="sidebar-search">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery("")}
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {!sidebarCollapsed && (
        <div className="sidebar-section">
          <div className="sidebar-section-title">
            <Star size={14} className="star-icon" />
            <span>FAVORITES</span>
          </div>
          <div className="favorites-grid">
            <div
              className="favorite-item"
              onClick={() => navigate("/admin/dashboard")}
              style={{
                pointerEvents: isNavigating ? "none" : "auto",
              }}
            >
              <BarChart3 size={16} className="item-icon" />
              <span className="item-label">Analytics</span>
            </div>
            <div
              className="favorite-item"
              onClick={() => navigate("/admin/orders")}
              style={{
                pointerEvents: isNavigating ? "none" : "auto",
              }}
            >
              <ShoppingCart size={16} className="item-icon" />
              <span className="item-label">Orders</span>
            </div>
            <div
              className="favorite-item"
              onClick={() => navigate("/admin/getall-users")}
              style={{
                pointerEvents: isNavigating ? "none" : "auto",
              }}
            >
              <Users size={16} className="item-icon" />
              <span className="item-label">Customers</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Menu */}
      <div className="sidebar-menu">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="menu-item-container">
              <div
                className={`menu-item ${
                  activeMenu === item.id ? "active" : ""
                } ${item.isActive ? "current-active" : ""}${
                  isNavigating ? "disabled" : ""
                }`}
                onClick={() =>
                  handleMenuClick(item.id, item.hasDropdown, item.path)
                }
                style={{
                  pointerEvents: isNavigating ? "none" : "auto",
                }}
              >
                <div className="menu-content">
                  <IconComponent size={18} className="menu-icon" />
                  {!sidebarCollapsed && (
                    <div className="menu-text">
                      <span className="menu-label">{item.label}</span>
                      {item.subtitle && (
                        <small className="menu-subtitle">{item.subtitle}</small>
                      )}
                    </div>
                  )}
                </div>

                <div className="menu-meta">
                  {item.count !== undefined && !sidebarCollapsed && (
                    <span
                      className={`menu-count ${
                        item.highlight ? "highlight-count" : ""
                      }`}
                    >
                      {item.count}
                    </span>
                  )}

                  {item.hasDropdown && !sidebarCollapsed && (
                    <ChevronDown
                      size={12}
                      className={`menu-arrow ${
                        expandedSections[item.id] ? "expanded" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Submenu */}
              {item.children &&
                expandedSections[item.id] &&
                !sidebarCollapsed && (
                  <div className="submenu">
                    {item.children.map((child) => {
                      const ChildIconComponent = child.icon;
                      return (
                        <div
                          key={child.id}
                          className={`submenu-item ${
                            activeMenu === child.id ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isNavigating) {
                              handleSubmenuClick(child.id, child.path);
                            }
                          }}
                          style={{
                            pointerEvents: isNavigating ? "none" : "auto",
                          }}
                        >
                          <div className="submenu-content">
                            <ChildIconComponent
                              size={14}
                              className="submenu-icon"
                            />
                            <span className="submenu-label">{child.label}</span>
                          </div>

                          {child.count !== undefined && (
                            <span className="submenu-count">{child.count}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
    </div>
  );
};

export default Sidebar;
