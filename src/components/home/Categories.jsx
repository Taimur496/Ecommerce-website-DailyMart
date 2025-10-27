import React, { useEffect, useState } from "react";
import "../../assets/css/categories.css";
import { useDataCache } from "../../contexts/useDataCache";
import SkeletonDemo from "../../pages/Skeleton";
import { Link, useNavigate } from "react-router-dom";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { fetchCategories, cache } = useDataCache();

  const fetchedCategories = async () => {
    try {
      if (cache.categories.data) {
        setCategories(cache.categories.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchCategories();
      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchedCategories();
  }, []);

  const handleCategoryClick = (e, categoryName) => {
    e.preventDefault();
    // Navigate to shop page with category filter
    navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div>
      {loading ? (
        <SkeletonDemo />
      ) : (
        <div className="categories-section">
          <div>
            <div className="categories-header">
              <h2 className="categories-title">Categories</h2>
              <p className="categories-subtitle">
                Some of our exclusive collections, you may like
              </p>
            </div>
            <div className="categories-grid">
              {categories.map((category) => (
                <div key={category.id} className="category-card">
                  <Link
                    className="category-link-wrapper"
                    onClick={(e) =>
                      handleCategoryClick(e, category.category_name)
                    }
                  >
                    <div className="category-image-container">
                      <img
                        src={category.category_img}
                        alt={category.category_name}
                        className="category-image"
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    </div>
                    <h3 className="category-name">{category.category_name}</h3>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
