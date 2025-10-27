import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/css/uppermenu.css";
import { ChevronDown } from "lucide-react";
import { useDataCache } from "../../contexts/useDataCache";

const UpperMenu = ({ isMobile = false, isOpen = false, onClose }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const { fetchCategories, fetchSubCategories, cache } = useDataCache();

  const fetchedCategories = async () => {
    try {
      if (cache.categories.data) {
        setCategories(cache.categories.data);
        return;
      }

      const data = await fetchCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchedSubCategories = async () => {
    try {
      if (cache.subCategories.data) {
        setSubCategories(cache.subCategories.data);
        return;
      }

      const data = await fetchSubCategories();
      if (data) {
        setSubCategories(data);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  useEffect(() => {
    fetchedCategories();
    fetchedSubCategories();
  }, []);

  const getMenuItems = () => {
    if (!categories.length) return [];

    return categories.map((category) => {
      // Find subcategories for this category
      const categorySubCategories = subCategories.filter(
        (subCat) => subCat.category_id === category.id
      );

      return {
        id: category.id,
        title: category.category_name,
        slug: category.category_slug,
        hasDropdown: categorySubCategories.length > 0,
        items: categorySubCategories.map((subCat) => ({
          name: subCat.subcategory_name,
          slug: subCat.subcategory_slug,
        })),
      };
    });
  };
  const menuItems = getMenuItems();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = async (index) => {
    if (!isMobile) {
      setActiveDropdown(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setActiveDropdown(null);
    }
  };

  const handleSidebarItemClick = (index) => {
    if (isMobile) {
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };

  const handleTouchStart = (index) => {
    if (!isMobile) {
      setActiveDropdown(activeDropdown === index ? null : index);
    }
  };

  const handleCategoryClick = (e, categoryName) => {
    e.preventDefault();
    // Navigate to shop page with category filter
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSubCategoryClick = (e, subCategoryName) => {
    e.preventDefault();
    // Navigate to shop page with subcategory filter
    navigate(`/shop?subcategory=${encodeURIComponent(subCategoryName)}`);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile sidebar content (when used inside NavMenuDesktop offcanvas)
  if (isMobile && isOpen) {
    return (
      <div className="sidebar-content">
        {menuItems.length > 0 &&
          menuItems.map((item, index) => (
            <div
              key={item.id || index}
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              <div
                className={`sidebar-link ${
                  activeDropdown === index ? "expanded" : ""
                }`}
                onClick={() => handleSidebarItemClick(index)}
              >
                <span onClick={(e) => handleCategoryClick(e, item.title)}>
                  {item.title}
                </span>
                {item.hasDropdown && (
                  <ChevronDown
                    className={`sidebar-icon ${
                      activeDropdown === index ? "rotated" : ""
                    }`}
                    size={18}
                  />
                )}
              </div>
              {item.hasDropdown && (
                <div
                  className={`sidebar-submenu ${
                    activeDropdown === index ? "show" : ""
                  }`}
                >
                  {item.items.map((subItem, subIndex) => (
                    <a
                      key={subIndex}
                      className="sidebar-subitem"
                      href="#"
                      onClick={(e) => handleSubCategoryClick(e, subItem.name)}
                    >
                      {subItem.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    );
  }

  // Desktop Menu (original functionality)
  if (!isMobile) {
    return (
      <div className="ecommerce-menu-wrapper">
        <nav className="down-navbar navbar-expand-lg" ref={menuRef}>
          <div className="container-fluid">
            <div className="navbar-nav d-flex flex-row w-100 justify-content-center">
              {menuItems.length > 0 &&
                menuItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    className={`nav-item dropdown-wrapper ${
                      item.active ? "active" : ""
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={() => handleTouchStart(index)}
                  >
                    <a
                      className={`nav-link ${
                        activeDropdown === index ? "show" : ""
                      }`}
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded={activeDropdown === index}
                      onClick={(e) => handleCategoryClick(e, item.title)}
                    >
                      {item.title}
                    </a>

                    {item.hasDropdown && (
                      <ul
                        className={`dropdown-menu ${
                          activeDropdown === index ? "show" : ""
                        }`}
                      >
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <a
                              className="dropdown-item"
                              href="#"
                              onClick={(e) =>
                                handleSubCategoryClick(e, subItem.name)
                              }
                            >
                              {subItem.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </nav>
      </div>
    );
  }
};

export default UpperMenu;
