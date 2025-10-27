import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  X,
  FolderOpen,
  Edit,
  Trash2,
  Loader,
  ListTree,
} from "lucide-react";
import { subCategoryAPI, categoryAPI } from "../../services/api";

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
    };
  };

  const urlParams = getUrlParams();
  const [subcategories, setSubCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlParams.search);
  const [selectedCategory, setSelectedCategory] = useState(
    urlParams.category_id
  );
  const [pagination, setPagination] = useState({
    current_page: urlParams.page,
    last_page: 1,
    per_page: 5,
    total: 0,
  });

  // Update URL without reload
  const updateUrl = useCallback(
    (page, search, categoryId) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      if (search) params.set("search", search);
      if (categoryId) params.set("category_id", categoryId);

      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      navigate(newUrl, { replace: true });
    },
    [location.pathname, navigate]
  );

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll();
        if (response.data.status === 200) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchSubCategories = useCallback(
    async (page = 1, search = searchTerm, categoryId = selectedCategory) => {
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

        const response = await subCategoryAPI.getAll(params);

        if (response.data.status === 200) {
          setSubCategories(response.data.data);
          setPagination((prevPagination) => ({
            ...prevPagination,
            ...(response.data.meta || {}),
          }));
          updateUrl(page, search, categoryId);
        } else {
          toast.error("Failed to fetch subcategories");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch subcategories"
        );
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedCategory, pagination.per_page, updateUrl]
  );

  const deleteSubCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const response = await subCategoryAPI.delete(id);
        if (response.data.status === 200) {
          toast.success(
            response.data.message || "SubCategory deleted successfully"
          );
          fetchSubCategories(
            pagination.current_page,
            searchTerm,
            selectedCategory
          );
        } else {
          toast.error("Failed to delete subcategory");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete subcategory"
        );
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubCategories(1, searchTerm, selectedCategory);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSelectedCategory("");
    fetchSubCategories(1, "", "");
  };

  const handlePageChange = (page) => {
    fetchSubCategories(page, searchTerm, selectedCategory);
  };

  const handleCategoryFilterChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Load initial data only once
  useEffect(() => {
    // Create a function to handle the initial fetch
    const initialFetch = () => {
      fetchSubCategories(
        urlParams.page,
        urlParams.search,
        urlParams.category_id
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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="h4">SubCategories</h4>
          <Link to="/admin/subcategory-create" className="btn btn-primary">
            <Plus size={16} className="me-1" />
            Create SubCategory
          </Link>
        </div>

        {/* Search Section */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Search SubCategories</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by subcategory name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Filter by Category</label>
                    <select
                      className="form-select"
                      value={selectedCategory}
                      onChange={handleCategoryFilterChange}
                      disabled={fetchingCategories}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary d-flex align-items-center"
                      >
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
                    Loading subcategories...
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
              ) : subcategories.length === 0 ? (
                <div className="text-center py-5">
                  <ListTree size={48} className="text-muted mb-3" />
                  <p className="text-muted h5">No subcategories found</p>
                  {searchTerm || selectedCategory ? (
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
                        to="/admin/subcategory-create"
                        className="btn btn-primary"
                      >
                        Create Your First SubCategory
                      </Link>
                      <br />
                      <button
                        type="button"
                        className="btn btn-outline-success mt-3"
                        onClick={() => fetchSubCategories(1, "", "")}
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
                      Showing {subcategories.length} of {pagination.total}{" "}
                      subcategories
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "8%" }}>ID</th>
                          <th style={{ width: "25%" }}>SubCategory Name</th>
                          <th style={{ width: "20%" }}>Slug</th>
                          <th style={{ width: "20%" }}>Category</th>
                          <th style={{ width: "15%" }}>Created At</th>
                          <th style={{ width: "12%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subcategories.map((subcategory) => (
                          <tr key={subcategory.id}>
                            <td className="fw-bold">{subcategory.id}</td>
                            <td className="fw-semibold">
                              {subcategory.subcategory_name}
                            </td>
                            <td>
                              <code className="text-muted small">
                                {subcategory.subcategory_slug}
                              </code>
                            </td>
                            <td>
                              {subcategory.category ? (
                                <span className="p-1 badge bg-success">
                                  {subcategory.category.category_name}
                                </span>
                              ) : (
                                <span className="text-muted small">N/A</span>
                              )}
                            </td>
                            <td className="text-muted small">
                              {new Date(
                                subcategory.created_at
                              ).toLocaleDateString()}
                              <br />
                              <small>
                                {new Date(
                                  subcategory.created_at
                                ).toLocaleTimeString()}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-2" role="group">
                                <Link
                                  to={`/admin/subcategory-edit/${subcategory.id}`}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  title="Edit SubCategory"
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() =>
                                    deleteSubCategory(subcategory.id)
                                  }
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                  title="Delete SubCategory"
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
