import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  X,
  Image,
  Edit,
  Trash2,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import { sliderAPI } from "../../services/api";

const SliderShow = () => {
  const [sliders, setSliders] = useState([]);
  const [allSliders, setAllSliders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await sliderAPI.getAll();

      if (response.data.status === "success") {
        setAllSliders(response.data.sliders); // Store all sliders
        filterSliders(response.data.sliders, searchTerm); // Apply current search filter
      } else {
        toast.error("Failed to fetch sliders");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "Failed to fetch sliders");
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Filter sliders based on search term
  const filterSliders = (slidersToFilter, term) => {
    if (!term.trim()) {
      setSliders(slidersToFilter);
      return;
    }

    const filtered = slidersToFilter.filter((slider) => {
      const searchLower = term.toLowerCase();

      // Search by ID
      if (slider.id.toString().includes(searchLower)) {
        return true;
      }

      // Search by status
      if (
        (slider.is_active && "active".includes(searchLower)) ||
        (!slider.is_active && "inactive".includes(searchLower))
      ) {
        return true;
      }

      // Search by date (created_at and updated_at)
      const createdDate = new Date(slider.created_at).toLocaleDateString();
      const updatedDate = new Date(slider.updated_at).toLocaleDateString();

      if (createdDate.includes(term) || updatedDate.includes(term)) {
        return true;
      }

      return false;
    });

    setSliders(filtered);
  };

  const deleteSlider = async (id) => {
    if (window.confirm("Are you sure you want to delete this slider?")) {
      try {
        const response = await sliderAPI.delete(id);
        if (response.data.status === "success") {
          toast.success(response.data.message || "Slider deleted successfully");
          fetchSliders();
        } else {
          toast.error("Failed to delete slider");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(error.response?.data?.message || "Failed to delete slider");
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterSliders(allSliders, searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSliders(allSliders); // Show all sliders when search is cleared
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterSliders(allSliders, value); // Real-time filtering
  };

  const toggleSliderStatus = async (id, currentStatus) => {
    try {
      setUpdatingId(id);

      const formData = new FormData();
      formData.append("is_active", currentStatus ? 0 : 1);
      formData.append("_method", "PUT");

      const response = await sliderAPI.update(id, formData);

      if (response.data.status === "success") {
        toast.success(
          `Slider ${currentStatus ? "deactivated" : "activated"} successfully`
        );
        fetchSliders(); // Refresh the list to get updated data
      } else {
        toast.error("Failed to update slider status");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update slider status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchSliders();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="h4">Sliders</h4>
          <Link to="/admin/sliders/create" className="btn btn-primary">
            <Plus size={16} className="me-1" />
            Create Slider
          </Link>
        </div>

        {/* Search Section */}
        <div className="col-12 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Search Sliders</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by ID, status (active/inactive), or date..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <div className="form-text">
                      Search by: ID, status (active/inactive), or date
                    </div>
                  </div>
                  <div className="col-md-6">
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
                        disabled={!searchTerm}
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
                    Loading sliders...
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
              ) : sliders.length === 0 ? (
                <div className="text-center py-5">
                  <Image size={48} className="text-muted mb-3" />
                  <p className="text-muted h5">
                    {searchTerm
                      ? "No matching sliders found"
                      : "No sliders found"}
                  </p>
                  {searchTerm ? (
                    <div>
                      <p className="text-muted">
                        No results found for "{searchTerm}"
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
                        to="/admin/sliders/create"
                        className="btn btn-primary"
                      >
                        Create Your First Slider
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-muted">
                      Showing {sliders.length} of {allSliders.length} sliders
                      {searchTerm && ` for "${searchTerm}"`}
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: "15%" }}>Image</th>
                          <th style={{ width: "10%" }}>ID</th>
                          <th style={{ width: "15%" }}>Status</th>
                          <th style={{ width: "20%" }}>Created At</th>
                          <th style={{ width: "20%" }}>Updated At</th>
                          <th style={{ width: "20%" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sliders.map((slider) => (
                          <tr key={slider.id}>
                            <td>
                              {slider.image_url ? (
                                <img
                                  src={slider.image_url}
                                  alt={`Slider ${slider.id}`}
                                  className="img-fluid rounded"
                                  style={{
                                    width: "100px",
                                    height: "55px",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    // Fallback if image fails to load
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display =
                                      "block";
                                  }}
                                />
                              ) : (
                                <div
                                  className="border rounded d-flex flex-column align-items-center justify-content-center text-muted"
                                  style={{
                                    width: "100px",
                                    height: "55px",
                                  }}
                                >
                                  <Image size={20} />
                                  <small>No image</small>
                                </div>
                              )}
                            </td>
                            <td className="fw-semibold">#{slider.id}</td>
                            <td>
                              <span
                                className={`badge ${
                                  slider.is_active
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {slider.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {new Date(slider.created_at).toLocaleDateString()}
                              <br />
                              <small>
                                {new Date(
                                  slider.created_at
                                ).toLocaleTimeString()}
                              </small>
                            </td>
                            <td className="text-muted small">
                              {new Date(slider.updated_at).toLocaleDateString()}
                              <br />
                              <small>
                                {new Date(
                                  slider.updated_at
                                ).toLocaleTimeString()}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex gap-2" role="group">
                                <button
                                  onClick={() =>
                                    toggleSliderStatus(
                                      slider.id,
                                      slider.is_active
                                    )
                                  }
                                  className={`btn btn-sm d-flex align-items-center ${
                                    slider.is_active
                                      ? "btn-warning"
                                      : "btn-success"
                                  }`}
                                  title={
                                    slider.is_active ? "Deactivate" : "Activate"
                                  }
                                  disabled={updatingId === slider.id}
                                >
                                  {updatingId === slider.id ? (
                                    <>
                                      <span
                                        className="spinner-border spinner-border-sm me-1"
                                        role="status"
                                      >
                                        <span className="visually-hidden">
                                          Loading...
                                        </span>
                                      </span>
                                      {slider.is_active
                                        ? "Deactivating..."
                                        : "Activating..."}
                                    </>
                                  ) : (
                                    <>
                                      {slider.is_active ? (
                                        <EyeOff size={14} className="me-1" />
                                      ) : (
                                        <Eye size={14} className="me-1" />
                                      )}
                                      {slider.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                    </>
                                  )}
                                </button>
                                <Link
                                  to={`/admin/sliders/edit/${slider.id}`}
                                  className="btn btn-sm btn-outline-primary d-flex align-items-center"
                                  title="Edit Slider"
                                >
                                  <Edit size={14} className="me-1" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => deleteSlider(slider.id)}
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center"
                                  title="Delete Slider"
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderShow;
