import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save } from "lucide-react";
import { brandAPI } from "../../services/api";

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand_name: "",
    brand_slug: "",
    brand_img: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Auto-generate slug from brand name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // Auto-generate slug when brand name changes (only if not manually edited)
  useEffect(() => {
    if (formData.brand_name && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(formData.brand_name);
      setFormData((prev) => ({
        ...prev,
        brand_slug: generatedSlug,
      }));
    }
  }, [formData.brand_name, isSlugManuallyEdited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Track if slug is manually edited
    if (name === "brand_slug") {
      setIsSlugManuallyEdited(value !== generateSlug(formData.brand_name));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        brand_img: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "brand_img" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await brandAPI.create(formDataToSend);

      if (response.data.status === 201) {
        toast.success(response.data.message || "Brand created successfully!");
        navigate("/admin/brands");
      } else {
        toast.error("Failed to create brand");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to create brand");
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
            <h4 className="h4">Create Brand</h4>
            <Link to="/admin/brands" className="btn btn-outline-secondary">
              <ArrowLeft className="me-1" size={16} />
              Back to Brands
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="row">
                  <div className="col-md-8">
                    {/* Brand Name */}
                    <div className="mb-4">
                      <label htmlFor="brand_name" className="form-label">
                        Brand Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.brand_name ? "is-invalid" : ""
                        }`}
                        id="brand_name"
                        name="brand_name"
                        value={formData.brand_name}
                        onChange={handleInputChange}
                        placeholder="Enter brand name"
                        required
                      />
                      {errors.brand_name && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.brand_name)
                            ? errors.brand_name[0]
                            : errors.brand_name}
                        </div>
                      )}
                    </div>

                    {/* Brand Slug */}
                    <div className="mb-4">
                      <label htmlFor="brand_slug" className="form-label">
                        Brand Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.brand_slug ? "is-invalid" : ""
                        }`}
                        id="brand_slug"
                        name="brand_slug"
                        value={formData.brand_slug}
                        onChange={handleInputChange}
                        placeholder="Auto-generated from brand name"
                      />
                      {errors.brand_slug && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.brand_slug)
                            ? errors.brand_slug[0]
                            : errors.brand_slug}
                        </div>
                      )}
                      <div className="form-text">
                        URL-friendly version of the brand name. Leave empty for
                        auto-generation.
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Brand Image */}
                    <div className="mb-4">
                      <label htmlFor="brand_img" className="form-label">
                        Brand Image <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.brand_img ? "is-invalid" : ""
                        }`}
                        id="brand_img"
                        name="brand_img"
                        onChange={handleImageChange}
                        accept="image/*"
                        required
                      />
                      {errors.brand_img && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.brand_img)
                            ? errors.brand_img[0]
                            : errors.brand_img}
                        </div>
                      )}
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-fluid rounded"
                            style={{ maxHeight: "200px" }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="row">
                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-end gap-2">
                      <Link
                        to="/admin/brands"
                        className="btn btn-outline-secondary"
                      >
                        Cancel
                      </Link>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
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
                            Create Brand
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
