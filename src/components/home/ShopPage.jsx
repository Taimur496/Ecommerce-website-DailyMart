import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { productAPI } from "../../services/api";
import { X } from "lucide-react";

const ShopPage = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get search query from URL parameters
  const searchQuery = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const subcategoryParam = searchParams.get("subcategory") || "";
  const isSearchResult = Boolean(searchQuery);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [
    searchQuery,
    categoryParam,
    subcategoryParam,
    selectedCategories,
    selectedSubCategories,
    selectedBrands,
  ]);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    // Clear search query from URL
    navigate("/shop", { replace: true });
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [
          categoriesResponse,
          subCategoriesResponse,
          brandsResponse,
          productsResponse,
        ] = await Promise.all([
          productAPI.getCategories(),
          productAPI.getSubCategories(),
          productAPI.getBrands(),
          productAPI.getProducts(),
        ]);

        // Ensure we always set arrays, even if API returns undefined
        setCategories(
          Array.isArray(categoriesResponse?.data?.data)
            ? categoriesResponse.data.data
            : []
        );
        setSubCategories(
          Array.isArray(subCategoriesResponse?.data?.data)
            ? subCategoriesResponse.data.data
            : []
        );
        setBrands(
          Array.isArray(brandsResponse?.data?.data)
            ? brandsResponse.data.data
            : []
        );
        setProducts(
          Array.isArray(productsResponse?.data?.data)
            ? productsResponse.data.data
            : []
        );
      } catch (err) {
        setError("Failed to fetch data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync URL parameters with state
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }

    if (subcategoryParam) {
      setSelectedSubCategories([subcategoryParam]);
    }
  }, [categoryParam, subcategoryParam]);

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) => {
      const isAlreadySelected = prev.includes(categoryName);

      if (isAlreadySelected) {
        // If category is already selected, deselect it manually
        const newCategories = prev.filter((c) => c !== categoryName);

        // Update URL based on remaining filters
        if (newCategories.length === 0 && selectedSubCategories.length === 0) {
          navigate("/shop");
        } else {
          // Keep other filters active, just remove this category
          const params = new URLSearchParams();
          newCategories.forEach((cat) => params.append("category", cat));
          selectedSubCategories.forEach((sub) =>
            params.append("subcategory", sub)
          );
          navigate(`/shop?${params.toString()}`);
        }

        return newCategories;
      } else {
        // Add the category to existing filters
        const newCategories = [...prev, categoryName];

        // Update URL with all active filters
        const params = new URLSearchParams();
        newCategories.forEach((cat) => params.append("category", cat));
        selectedSubCategories.forEach((sub) =>
          params.append("subcategory", sub)
        );
        navigate(`/shop?${params.toString()}`);

        return newCategories;
      }
    });
  };

  const handleSubCategoryChange = (subCategoryName) => {
    setSelectedSubCategories((prev) => {
      const isAlreadySelected = prev.includes(subCategoryName);

      if (isAlreadySelected) {
        // If subcategory is already selected, deselect it manually
        const newSubCategories = prev.filter((sc) => sc !== subCategoryName);

        // Update URL based on remaining filters
        if (newSubCategories.length === 0 && selectedCategories.length === 0) {
          navigate("/shop");
        } else {
          // Keep other filters active, just remove this subcategory
          const params = new URLSearchParams();
          selectedCategories.forEach((cat) => params.append("category", cat));
          newSubCategories.forEach((sub) => params.append("subcategory", sub));
          navigate(`/shop?${params.toString()}`);
        }

        return newSubCategories;
      } else {
        // Add the subcategory to existing filters
        const newSubCategories = [...prev, subCategoryName];

        // Update URL with all active filters
        const params = new URLSearchParams();
        selectedCategories.forEach((cat) => params.append("category", cat));
        newSubCategories.forEach((sub) => params.append("subcategory", sub));
        navigate(`/shop?${params.toString()}`);

        return newSubCategories;
      }
    });
  };

  const handleBrandChange = (brandName) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName]
    );
  };

  // Filter subcategories based on selected categories
  const filteredSubCategories = subCategories.filter((subCategory) => {
    if (selectedCategories.length === 0) return true;
    // Check if subcategory belongs to selected category
    return selectedCategories.includes(subCategory.category?.category_name);
  });

  // Safe filter function - ensure products is always treated as array
  const filteredProducts = (products || []).filter((product) => {
    // Add null checks for product properties
    if (!product) return false;

    // Get category name (handle both object and string)
    const productCategoryName =
      product.category?.category_name || product.category;

    // Get subcategory name (handle both object and string)
    const productSubCategoryName =
      product.subcategory?.subcategory_name || product.subcategory;

    // Get brand name (handle both object and string)
    const productBrandName = product.brand?.brand_name || product.brand;

    const categoryMatch =
      selectedCategories.length === 0 ||
      (productCategoryName && selectedCategories.includes(productCategoryName));

    const subCategoryMatch =
      selectedSubCategories.length === 0 ||
      (productSubCategoryName &&
        selectedSubCategories.includes(productSubCategoryName));

    const brandMatch =
      selectedBrands.length === 0 ||
      (productBrandName && selectedBrands.includes(productBrandName));

    const searchMatch =
      !searchQuery ||
      // Search in product name
      (product.product_name &&
        product.product_name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in category name
      (productCategoryName &&
        productCategoryName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in subcategory name
      (productSubCategoryName &&
        productSubCategoryName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in brand name
      (productBrandName &&
        productBrandName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      // Search in product tags
      (product.product_tags &&
        product.product_tags
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in short description
      (product.short_descp &&
        product.short_descp
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in long description
      (product.long_descp &&
        product.long_descp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      // Search in product code
      (product.product_code &&
        product.product_code
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      // Search in SKU
      (product.sku &&
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && subCategoryMatch && brandMatch && searchMatch;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading products...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-light min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Breadcrumb */}
      <div className="container mt-3 mb-3">
        <div className="d-flex justify-content-between">
          <span
            style={{
              color: "#1a9cb7",
              fontFamily: "Roboto-Regular, Helvetica, Arial, sans-serif",
            }}
          >
            Home / Shop
            {isSearchResult && ` / Search: "${searchQuery}"`}
            {!isSearchResult &&
              selectedCategories.length > 0 &&
              ` / ${selectedCategories.join(", ")}`}
            {!isSearchResult &&
              selectedSubCategories.length > 0 &&
              ` / ${selectedSubCategories.join(", ")}`}
            {!isSearchResult &&
              selectedCategories.length === 0 &&
              selectedSubCategories.length === 0 &&
              " / All Products"}
          </span>
        </div>
      </div>

      <div className="container">
        <div className="row">
          {/* Sidebar Filters */}
          <div className="col-lg-3 col-md-4 mb-4">
            {/* Categories Filter */}
            <div className="card mb-4 bg-light border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Categories</h5>
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <div key={category.id || index} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`category-${category.id || index}`}
                        checked={selectedCategories.includes(
                          category.category_name
                        )}
                        onChange={() =>
                          handleCategoryChange(category.category_name)
                        }
                      />
                      <label
                        className="form-check-label text-muted"
                        htmlFor={`category-${category.id || index}`}
                      >
                        {category.category_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No categories available</p>
                )}
              </div>
            </div>

            {/* SubCategories Filter */}
            <div className="card mb-4 bg-light border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Sub Categories</h5>
                {filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((subCategory, index) => (
                    <div
                      key={subCategory.id || index}
                      className="form-check mb-2"
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`subcategory-${subCategory.id || index}`}
                        checked={selectedSubCategories.includes(
                          subCategory.subcategory_name
                        )}
                        onChange={() =>
                          handleSubCategoryChange(subCategory.subcategory_name)
                        }
                      />
                      <label
                        className="form-check-label text-muted"
                        htmlFor={`subcategory-${subCategory.id || index}`}
                      >
                        {subCategory.subcategory_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">
                    {selectedCategories.length > 0
                      ? "No subcategories for selected category"
                      : "No subcategories available"}
                  </p>
                )}
              </div>
            </div>

            {/* Brands Filter */}
            <div className="card bg-light border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Brands</h5>
                {brands.length > 0 ? (
                  brands.map((brand, index) => (
                    <div key={brand.id || index} className="form-check mb-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`brand-${brand.id || index}`}
                        checked={selectedBrands.includes(brand.brand_name)}
                        onChange={() => handleBrandChange(brand.brand_name)}
                      />
                      <label
                        className="form-check-label text-muted"
                        htmlFor={`brand-${brand.id || index}`}
                      >
                        {brand.brand_name}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-muted small">No brands available</p>
                )}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="col-lg-9 col-md-8">
            {/* Search Results Header with Clear Filter */}
            {isSearchResult && (
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h4>Search results: "{searchQuery}"</h4>
                  <p className="text-muted mb-0">
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1 ? "product" : "products"}{" "}
                    found
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                  style={{ whiteSpace: "nowrap" }}
                >
                  <X size={16} />
                  Clear Search
                </button>
              </div>
            )}

            {/* Products Count with Clear Filter for non-search pages */}
            {!isSearchResult && (
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6>
                      {selectedCategories.length > 0 &&
                        `${selectedCategories.join(", ")} `}
                      {selectedSubCategories.length > 0 &&
                        `${selectedSubCategories.join(", ")} `}
                      {selectedCategories.length === 0 &&
                        selectedSubCategories.length === 0 &&
                        "All Products"}
                    </h6>
                    <p className="text-muted mb-0">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "product" : "products"}{" "}
                      available
                    </p>
                  </div>
                  {(selectedCategories.length > 0 ||
                    selectedSubCategories.length > 0 ||
                    selectedBrands.length > 0) && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <X size={16} />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div className="row g-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="col-xl-4 col-lg-6 col-md-6 col-sm-12"
                  >
                    <Link
                      to={`/productdetails?id=${product.id}`}
                      className="text-decoration-none"
                    >
                      <div
                        className="card h-100 shadow-sm border-0"
                        style={{
                          transition: "transform 0.2s",
                          cursor: "pointer",
                        }}
                      >
                        <div
                          onMouseEnter={(e) => {
                            const overlay =
                              e.currentTarget.querySelector(
                                ".position-absolute"
                              );
                            if (overlay) overlay.style.opacity = "1";
                          }}
                          onMouseLeave={(e) => {
                            const overlay =
                              e.currentTarget.querySelector(
                                ".position-absolute"
                              );
                            if (overlay) overlay.style.opacity = "0";
                          }}
                          className="position-relative overflow-hidden rounded-top"
                        >
                          <img
                            src={
                              product.main_img ||
                              "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            className="card-img-top"
                            alt={product.product_name}
                            style={{
                              height: "250px",
                              objectFit: "cover",
                              width: "100%",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/400x300?text=No+Image";
                            }}
                          />
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                            style={{
                              background: "rgba(0,0,0,0.1)",
                              opacity: 0,
                              transition: "opacity 0.3s",
                              pointerEvents: "none",
                            }}
                          >
                            <button className="btn btn-light btn-sm rounded-pill px-3">
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="card-body d-flex flex-column">
                          <h6 className="card-title mb-3 text-dark fw-normal">
                            {product.product_name}
                          </h6>
                          <div className="mt-auto">
                            <div className="d-flex align-items-center mb-1">
                              <span className="h5 mb-0 text-dark fw-bold me-2">
                                $
                                {product.discount_price ||
                                  product.selling_price}
                              </span>
                              {product.discount_price &&
                                product.selling_price >
                                  product.discount_price && (
                                  <span className="text-muted text-decoration-line-through">
                                    ${product.selling_price}
                                  </span>
                                )}
                            </div>
                            <small className="text-muted">
                              {typeof product.brand === "object"
                                ? product.brand.brand_name
                                : product.brand}
                            </small>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <h4 className="text-muted">No products found</h4>
                  <p className="text-muted">
                    {isSearchResult
                      ? "No products match your search criteria. Try different keywords."
                      : "No products available. Please check back later."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
