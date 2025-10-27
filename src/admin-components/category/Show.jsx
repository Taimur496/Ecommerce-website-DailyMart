import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
import toast, { Toaster } from "react-hot-toast";

import {
  Plus,
  Search,
  X,
  FolderOpen,
  Image as ImageIcon,
  Edit,
  Trash2,
  Loader,
} from "lucide-react";
import { categoryAPI } from "../../services/api";

const Show = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial values from URL parameters
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      page: parseInt(searchParams.get("page")) || 1,
      search: searchParams.get("search") || "",
    };
  };

  const urlParams = getUrlParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(urlParams.search);
  const [pagination, setPagination] = useState({
    current_page: urlParams.page,
    last_page: 1,
    per_page: 5,
    total: 0,
  });

  // Update URL without reload
  const updateUrl = useCallback(
    (page, search) => {
      const params = new URLSearchParams();
      if (page > 1) params.set("page", page.toString());
      if (search) params.set("search", search);

      const newUrl = `${location.pathname}${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      navigate(newUrl, { replace: true });
    },
    [location.pathname, navigate]
  );

  const fetchCategories = useCallback(
    async (page = 1, search = searchTerm) => {
      setLoading(true);
      try {
        const params = {
          page,
          per_page: pagination.per_page,
        };

        if (search) {
          params.search = search;
        }

        const response = await categoryAPI.getAll(params);

        if (response.data.status === 200) {
          setCategories(response.data.data);
          setPagination((prevPagination) => ({
            ...prevPagination,
            ...(response.data.meta || {}),
          }));
          updateUrl(page, search);
        } else {
          toast.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch categories"
        );
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, pagination.per_page, updateUrl]
  );

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await categoryAPI.delete(id);
        if (response.data.status === 200) {
          toast.success(
            response.data.message || "Category deleted successfully"
          );
          fetchCategories(pagination.current_page, searchTerm);
        } else {
          toast.error("Failed to delete category");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(
          error.response?.data?.message || "Failed to delete category"
        );
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCategories(1, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    fetchCategories(1, "");
  };

  const handlePageChange = (page) => {
    fetchCategories(page, searchTerm);
  };

  // Load initial data only once
  useEffect(() => {
    // Create a function to handle the initial fetch
    const initialFetch = () => {
      fetchCategories(urlParams.page, urlParams.search);
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="h4">Categories</h4>
          <Link to="/admin/category-create" className="btn btn-primary">
            <Plus size={16} className="me-1" />
            Create Category
          </Link>
        </div>

        {/* Search Section */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-8">
                    <label className="form-label">Search Categories</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by category name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">&nbsp;</label>
                    <div className="d-flex gap-2 ">
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
                    Loading categories...
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
              ) : categories.length === 0 ? (
                <div className="text-center py-5">
                  <FolderOpen size={48} className="text-muted mb-3" />
                  <p className="text-muted h5">No categories found</p>
                  {searchTerm ? (
                    <div>
                      <p className="text-muted">
                        No results for "{searchTerm}"
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
                        to="/admin/category-create"
                        className="btn btn-primary"
                      >
                        Create Your First Category
                      </Link>
                      <br />
                      <button
                        type="button"
                        className="btn btn-outline-success mt-3"
                        onClick={clearSearch}
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
                      Showing {categories.length} of {pagination.total}{" "}
                      categories
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "8%" }}>ID</th>
                          <th style={{ width: "12%" }}>Image</th>
                          <th style={{ width: "25%" }}>Category Name</th>
                          <th style={{ width: "20%" }}>Slug</th>
                          <th style={{ width: "18%" }}>Created At</th>
                          <th style={{ width: "17%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category.id}>
                            <td className="fw-bold">{category.id}</td>
                            <td>
                              {category.category_img ? (
                                <img
                                  src={category.category_img}
                                  alt={category.category_name}
                                  className=" img-fluid rounded"
                                  style={{
                                    width: "60px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              ) : (
                                <div
                                  className=" bg-light d-flex align-items-center justify-content-center"
                                  style={{ width: "60px", height: "60px" }}
                                >
                                  <ImageIcon size={24} className="text-muted" />
                                </div>
                              )}
                            </td>
                            <td className="fw-semibold">
                              {category.category_name}
                            </td>
                            <td>
                              <code className="text-muted small">
                                {category.category_slug}
                              </code>
                            </td>
                            <td className="text-muted small">
                              {new Date(
                                category.created_at
                              ).toLocaleDateString()}
                              <br />
                              <small>
                                {new Date(
                                  category.created_at
                                ).toLocaleTimeString()}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-2" role="group">
                                <Link
                                  to={`/admin/category-edit/${category.id}`}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  title="Edit Category"
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => deleteCategory(category.id)}
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                  title="Delete Category"
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
