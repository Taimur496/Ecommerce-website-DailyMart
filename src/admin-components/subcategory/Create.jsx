import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import { subCategoryAPI, categoryAPI } from "../../services/api";

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_name: "",
    subcategory_slug: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Fetch categories for dropdown
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

  // Auto-generate slug from subcategory name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // Auto-generate slug when subcategory name changes (only if not manually edited)
  useEffect(() => {
    if (formData.subcategory_name && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(formData.subcategory_name);
      setFormData((prev) => ({
        ...prev,
        subcategory_slug: generatedSlug,
      }));
    }
  }, [formData.subcategory_name, isSlugManuallyEdited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Track if slug is manually edited
    if (name === "subcategory_slug") {
      setIsSlugManuallyEdited(
        value !== generateSlug(formData.subcategory_name)
      );
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await subCategoryAPI.create(formData);

      if (response.data.status === 201) {
        toast.success(
          response.data.message || "SubCategory created successfully!"
        );
        navigate("/admin/subcategories");
      } else {
        toast.error("Failed to create subcategory");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to create subcategory"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="h4">Create SubCategory</h4>
            <Link
              to="/admin/subcategories"
              className="btn btn-outline-secondary"
            >
              <ArrowLeft className="me-1" size={16} />
              Back to SubCategories
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    {/* Category Selection */}
                    <div className="mb-4">
                      <label htmlFor="category_id" className="form-label">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.category_id ? "is-invalid" : ""
                        }`}
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        required
                        disabled={fetchingCategories}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      {fetchingCategories && (
                        <div className="form-text text-success">
                          Loading categories...
                        </div>
                      )}
                      {errors.category_id && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.category_id)
                            ? errors.category_id[0]
                            : errors.category_id}
                        </div>
                      )}
                    </div>

                    {/* SubCategory Name */}
                    <div className="mb-4">
                      <label htmlFor="subcategory_name" className="form-label">
                        SubCategory Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.subcategory_name ? "is-invalid" : ""
                        }`}
                        id="subcategory_name"
                        name="subcategory_name"
                        value={formData.subcategory_name}
                        onChange={handleInputChange}
                        placeholder="Enter subcategory name"
                        required
                      />
                      {errors.subcategory_name && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.subcategory_name)
                            ? errors.subcategory_name[0]
                            : errors.subcategory_name}
                        </div>
                      )}
                    </div>

                    {/* SubCategory Slug */}
                    <div className="mb-4">
                      <label htmlFor="subcategory_slug" className="form-label">
                        SubCategory Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.subcategory_slug ? "is-invalid" : ""
                        }`}
                        id="subcategory_slug"
                        name="subcategory_slug"
                        value={formData.subcategory_slug}
                        onChange={handleInputChange}
                        placeholder="Auto-generated from subcategory name"
                      />
                      {errors.subcategory_slug && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.subcategory_slug)
                            ? errors.subcategory_slug[0]
                            : errors.subcategory_slug}
                        </div>
                      )}
                      <div className="form-text">
                        URL-friendly version of the subcategory name. Leave
                        empty for auto-generation.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="row">
                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-end gap-2">
                      <Link
                        to="/admin/subcategories"
                        className="btn btn-outline-secondary"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || fetchingCategories}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                            >
                              <span className="visually-hidden">
                                Loading...
                              </span>
                            </span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="me-1" size={16} />
                            Create SubCategory
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
