import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  X,
  Package,
  Edit,
  Trash2,
  Loader,
  Eye,
} from "lucide-react";
import {
  productAPI,
  categoryAPI,
  subCategoryAPI,
  brandAPI,
} from "../../services/api";

const Show = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial values from URL parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      page: parseInt(searchParams.get("page")) || 1,
      search: searchParams.get("search") || "",
      category_id: searchParams.get("category_id") || "",
      subcategory_id: searchParams.get("subcategory_id") || "",
      brand_id: searchParams.get("brand_id") || "",
    };
  };

  const urlParams = getUrlParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFilters, setFetchingFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = useState(
    urlParams.category_id
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    urlParams.subcategory_id
  );
  const [selectedBrand, setSelectedBrand] = useState(urlParams.brand_id);
  const [pagination, setPagination] = useState({
    current_page: urlParams.page,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Update URL without reload
  const updateUrl = useCallback(
    (page, search, categoryId, subcategoryId, brandId) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      if (search) params.set("search", search);
      if (categoryId) params.set("category_id", categoryId);
      if (subcategoryId) params.set("subcategory_id", subcategoryId);
      if (brandId) params.set("brand_id", brandId);

      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      navigate(newUrl, { replace: true });
    },
    [location.pathname, navigate]
  );

  // Fetch categories, subcategories, and brands for filter dropdowns
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          categoryAPI.getAll(),
          brandAPI.getAll(),
        ]);

        if (categoriesRes.data.status === 200) {
          setCategories(categoriesRes.data.data);
        }

        if (brandsRes.data.status === 200) {
          setBrands(brandsRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
        toast.error("Failed to load filters");
      } finally {
        setFetchingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (selectedCategory) {
        try {
          const response = await subCategoryAPI.getByCategory(selectedCategory);
          if (response.data.status === 200) {
            setSubCategories(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          toast.error("Failed to load subcategories");
        }
      } else {
        setSubCategories([]);
        setSelectedSubcategory("");
      }
    };

    fetchSubCategories();
  }, [selectedCategory]);

  const fetchProducts = useCallback(
    async (
      page = 1,
      search = searchTerm,
      categoryId = selectedCategory,
      subcategoryId = selectedSubcategory,
      brandId = selectedBrand
    ) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.per_page,
        };

        if (search) {
          params.search = search;
        }

        if (categoryId) {
          params.category_id = categoryId;
        }

        if (subcategoryId) {
          params.subcategory_id = subcategoryId;
        }

        if (brandId) {
          params.brand_id = brandId;
        }

        const response = await productAPI.getAll(params);

        if (response.data.status === 200) {
          setProducts(response.data.data);
          setPagination((prevPagination) => ({
            ...prevPagination,
            ...(response.data.meta || {}),
          }));
          updateUrl(page, search, categoryId, subcategoryId, brandId);
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand,
      pagination.per_page,
      updateUrl,
    ]
  );

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await productAPI.delete(id);
        if (response.data.status === 200) {
          toast.success(
            response.data.message || "Product deleted successfully"
          );
          fetchProducts(
            pagination.current_page,
            searchTerm,
            selectedCategory,
            selectedSubcategory,
            selectedBrand
          );
        } else {
          toast.error("Failed to delete product");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete product"
        );
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(
      1,
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand
    );
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    fetchProducts(1, "", "", "", "");
  };

  const handlePageChange = (page) => {
    fetchProducts(
      page,
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand
    );
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleSubcategoryFilterChange = (e) => {
    setSelectedSubcategory(e.target.value);
  };

  const handleBrandFilterChange = (e) => {
    setSelectedBrand(e.target.value);
  };

  // Load initial data only once
  useEffect(() => {
    // Create a function to handle the initial fetch
    const initialFetch = () => {
      fetchProducts(
        urlParams.page,
        urlParams.search,
        urlParams.category_id,
        urlParams.subcategory_id,
        urlParams.brand_id
      );
    };

    // Call the function
    initialFetch();

    // We're intentionally leaving out dependencies to run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderPagination = () => {
    if (pagination.last_page <= 1) return null;

    const pages = [];
    const maxPagesToShow = 5;
    const currentPage = pagination.current_page;
    const lastPage = pagination.last_page;

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(lastPage, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Previous button
    pages.push(
      <li
        key="prev"
        className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
      </li>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <li
          key={i}
          className={`page-item ${i === currentPage ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    // Next button
    pages.push(
      <li
        key="next"
        className={`page-item ${currentPage === lastPage ? "disabled" : ""}`}
      >
        <button
          className="page-link"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
        >
          Next
        </button>
      </li>
    );

    return (
      <nav>
        <ul className="pagination justify-content-center">{pages}</ul>
      </nav>
    );
  };

  const getStatusBadge = (status) => {
    return status === 1 ? (
      <span className="p-1 badge bg-success">Active</span>
    ) : (
      <span className="p-1 badge bg-danger">Inactive</span>
    );
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="h4">Products</h4>
          <Link to="/admin/product-create" className="btn btn-primary">
            <Plus size={16} className="me-1" />
            Create Product
          </Link>
        </div>

        {/* Search Section */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="d-flex flex-wrap gap-3 align-items-end">
                  <div style={{ minWidth: "220px", flex: "1" }}>
                    <label className="form-label">Search Products</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by product name, SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div style={{ minWidth: "180px" }}>
                    <label className="form-label">Filter by Category</label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={handleCategoryFilterChange}
                      disabled={fetchingFilters}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ minWidth: "180px" }}>
                    <label className="form-label">Filter by SubCategory</label>
                    <select
                      className="form-select"
                      value={selectedSubcategory}
                      onChange={handleSubcategoryFilterChange}
                      disabled={!selectedCategory || fetchingFilters}
                    >
                      <option value="">All SubCategories</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.subcategory_name}
                        </option>
                      ))}
                    </select>
                    {/* {!selectedCategory && (
                      <div className="form-text text-info">
                        Please select a category first
                      </div>
                    )} */}
                  </div>
                  <div style={{ minWidth: "180px" }}>
                    <label className="form-label">Filter by Brand</label>
                    <select
                      className="form-select"
                      value={selectedBrand}
                      onChange={handleBrandFilterChange}
                      disabled={fetchingFilters}
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary">
                        <Search size={16} className="me-1" />
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={clearSearch}
                      >
                        <X size={16} className="me-1" />
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow">
            <div className="card-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <Loader
                    className="mb-3"
                    size={40}
                    style={{
                      color: "#0d6efd",
                      filter: "drop-shadow(0 0 8px rgba(139, 92, 246, 0.4))",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p className="mt-2 text-muted fw-medium">
                    Loading products...
                  </p>
                  <div className="mt-3">
                    <div
                      className="mx-auto position-relative overflow-hidden rounded-pill"
                      style={{
                        width: "200px",
                        height: "4px",
                        backgroundColor: "#f3f4f6",
                      }}
                    >
                      <div
                        className="position-absolute h-100 rounded-pill"
                        style={{
                          width: "60px",
                          background:
                            "linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981)",
                          animation: "shimmer 2s ease-in-out infinite",
                          left: 0,
                        }}
                      ></div>
                    </div>
                  </div>
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(-100%); }
        }
      `,
                    }}
                  />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-5">
                  <Package size={48} className="text-muted mb-3" />
                  <p className="text-muted h5">No products found</p>
                  {searchTerm || selectedCategory || selectedBrand ? (
                    <div>
                      <p className="text-muted">
                        No results for your search criteria
                      </p>
                      <button
                        className="btn btn-outline-primary me-2"
                        onClick={clearSearch}
                      >
                        Clear Search
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Link
                        to="/admin/product-create"
                        className="btn btn-primary"
                      >
                        Create Your First Product
                      </Link>
                      <br />
                      <button
                        type="button"
                        className="btn btn-outline-success mt-3"
                        onClick={() => fetchProducts(1, "", "", "", "")}
                      >
                        Refresh This Page
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">
                      Showing {products.length} of {pagination.total} products
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "10%" }}>Image</th>
                          <th style={{ width: "20%" }}>Product Name</th>
                          <th style={{ width: "10%" }}>Price</th>
                          <th style={{ width: "10%" }}>Discount</th>
                          <th style={{ width: "10%" }}>Quantity</th>
                          <th style={{ width: "10%" }}>Status</th>
                          <th style={{ width: "15%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              {product.main_img && (
                                <img
                                  src={product.main_img}
                                  alt={product.product_name}
                                  className="img-fluid rounded"
                                  style={{
                                    width: "60px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                            </td>
                            <td className="fw-semibold">
                              {product.product_name}
                            </td>
                            <td className="fw-bold text-primary">
                              ${product.selling_price}
                            </td>
                            <td>
                              {product.discount_price ? (
                                <span className="text-danger fw-bold">
                                  ${product.discount_price}
                                </span>
                              ) : (
                                <span className="text-muted small">-</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`p-1 badge ${
                                  product.product_qty > 0
                                    ? "bg-success"
                                    : "bg-danger"
                                }`}
                              >
                                {product.product_qty || 0}
                              </span>
                            </td>
                            <td>{getStatusBadge(product.status)}</td>
                            <td>
                              <div className="d-flex gap-2" role="group">
                                <Link
                                  to={`/admin/product-edit/${product.id}`}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  title="Edit Product"
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </Link>
                                <Link
                                  to={`/admin/product-view/${product.id}`}
                                  className="btn btn-sm btn-outline-info d-flex align-items-center"
                                  title="View Product"
                                >
                                  <Eye size={14} className="me-1" />
                                  View
                                </Link>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} className="me-1" />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.last_page > 1 && (
                    <div className="mt-4">{renderPagination()}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Show;
