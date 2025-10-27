import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { categoryAPI } from "../../services/api";
import { ArrowLeft, Save, X, Image, Info } from "lucide-react";

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    category_name: "",
    category_slug: "",
  });
  const [originalData, setOriginalData] = useState({
    category_name: "",
    category_slug: "",
  });
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug from category name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim("-"); // Remove leading/trailing hyphens
  };

  const fetchCategory = useCallback(async () => {
    try {
      const response = await categoryAPI.getById(id);
      if (response.data.status === 200) {
        const category = response.data.data;
        const categoryData = {
          category_name: category.category_name,
          category_slug: category.category_slug || "",
        };

        setFormData(categoryData);
        setOriginalData(categoryData);
        setCurrentImage(category.category_img);
      } else {
        toast.error("Category not found");
        navigate("/admin/categories");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch category details");
      navigate("/admin/categories");
    } finally {
      setFetchingData(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  // Auto-generate slug when category name changes (only if not manually edited)
  useEffect(() => {
    if (formData.category_name && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(formData.category_name);
      setFormData((prev) => ({
        ...prev,
        category_slug: generatedSlug,
      }));
    }
  }, [formData.category_name, isSlugManuallyEdited]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Track if slug is manually edited
    if (name === "category_slug") {
      const expectedSlug = generateSlug(formData.category_name);
      setIsSlugManuallyEdited(
        value !== expectedSlug && value !== originalData.category_slug
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, JPG, GIF)");
        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }

      setNewImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.category_img) {
        setErrors((prev) => ({
          ...prev,
          category_img: "",
        }));
      }
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("category_img");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append("category_name", formData.category_name);

      // Only append slug if it's different from original or if it's provided
      if (formData.category_slug.trim()) {
        submitData.append("category_slug", formData.category_slug.trim());
      }

      if (newImage) {
        submitData.append("category_img", newImage);
      }

      const response = await categoryAPI.update(id, submitData);

      if (response.data.status === 200) {
        toast.success(
          response.data.message || "Category updated successfully!"
        );
        navigate("/admin/categories");
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update category"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container-fluid">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="h4">Edit Category</h4>
            <Link to="/admin/categories" className="btn btn-outline-secondary">
              <ArrowLeft className="me-1" size={16} />
              Back to Categories
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    {/* Category Name */}
                    <div className="mb-4">
                      <label htmlFor="category_name" className="form-label">
                        Category Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.category_name ? "is-invalid" : ""
                        }`}
                        id="category_name"
                        name="category_name"
                        value={formData.category_name}
                        onChange={handleInputChange}
                        placeholder="Enter category name"
                        required
                      />
                      {errors.category_name && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.category_name)
                            ? errors.category_name[0]
                            : errors.category_name}
                        </div>
                      )}
                    </div>

                    {/* Category Slug */}
                    <div className="mb-4">
                      <label htmlFor="category_slug" className="form-label">
                        Category Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.category_slug ? "is-invalid" : ""
                        }`}
                        id="category_slug"
                        name="category_slug"
                        value={formData.category_slug}
                        onChange={handleInputChange}
                        placeholder="Auto-generated from category name"
                      />
                      {errors.category_slug && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.category_slug)
                            ? errors.category_slug[0]
                            : errors.category_slug}
                        </div>
                      )}
                      <div className="form-text">
                        URL-friendly version of the category name. Leave empty
                        for auto-generation.
                      </div>
                    </div>

                    {/* Category Image */}
                    <div className="mb-4">
                      <label htmlFor="category_img" className="form-label">
                        Category Image
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.category_img ? "is-invalid" : ""
                        }`}
                        id="category_img"
                        name="category_img"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      {errors.category_img && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.category_img)
                            ? errors.category_img[0]
                            : errors.category_img}
                        </div>
                      )}
                      <div className="form-text">
                        Allowed formats: JPEG, PNG, JPG, GIF. Max size: 2MB.
                        Leave empty to keep current image.
                      </div>
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="col-md-4">
                    <div className="mb-4">
                      <div className="text-center">
                        <label className="form-label">Image Preview</label>
                        {imagePreview ? (
                          // New image preview
                          <div className="mb-3">
                            <p className="small text-success mb-2">
                              <Info className="me-1" size={14} />
                              New image (will replace current)
                            </p>
                            <div className="position-relative">
                              <img
                                src={imagePreview}
                                alt="New Preview"
                                className="img-fluid rounded border"
                                style={{
                                  maxWidth: "200px",
                                  maxHeight: "200px",
                                  objectFit: "cover",
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle"
                                onClick={removeNewImage}
                                title="Remove new image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : currentImage ? (
                          // Current image
                          <div>
                            <p className="small text-muted mb-2">
                              Current image
                            </p>
                            <img
                              src={currentImage}
                              alt="Current"
                              className="img-fluid rounded border"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "200px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        ) : (
                          // No image
                          <div
                            className="border rounded d-flex flex-column align-items-center justify-content-center text-muted"
                            style={{
                              height: "200px",
                              maxWidth: "200px",
                              margin: "0 auto",
                            }}
                          >
                            <Image size={48} className="mb-2" />
                            <small>No image available</small>
                          </div>
                        )}
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
                        to="/admin/categories"
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
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="me-1" size={16} />
                            Update Category
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

export default Edit;
