import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X, Image, Info } from "lucide-react";
import { brandAPI } from "../../services/api";

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    brand_name: "",
    brand_slug: "",
  });
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Auto-generate slug from brand name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // Fetch brand data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        const response = await brandAPI.getById(id);
        if (response.data.status === 200) {
          const brand = response.data.data;
          setFormData({
            brand_name: brand.brand_name || "",
            brand_slug: brand.brand_slug || "",
          });

          // Set current image for preview
          if (brand.brand_img) {
            setCurrentImage(brand.brand_img);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load brand data");
        navigate("/admin/brands");
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Please select a valid image file (JPEG, PNG, JPG, GIF, WebP)"
        );
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
      if (errors.brand_img) {
        setErrors((prev) => ({
          ...prev,
          brand_img: "",
        }));
      }
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("brand_img");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Always append text fields
      formDataToSend.append("brand_name", formData.brand_name);

      if (formData.brand_slug.trim()) {
        formDataToSend.append("brand_slug", formData.brand_slug.trim());
      }

      // Only append image if a new file was selected
      if (newImage instanceof File) {
        formDataToSend.append("brand_img", newImage);
      }

      const response = await brandAPI.update(id, formDataToSend);

      if (response.data.status === 200) {
        toast.success(response.data.message || "Brand updated successfully!");
        navigate("/admin/brands");
      } else {
        toast.error("Failed to update brand");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to update brand");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="h4">Edit Brand</h4>
              <Link to="/admin/brands" className="btn btn-outline-secondary">
                <ArrowLeft className="me-1" size={16} />
                Back to Brands
              </Link>
            </div>
            <div className="card shadow">
              <div className="card-body p-4 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading brand data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="h4">Edit Brand</h4>
            <Link to="/admin/brands" className="btn btn-outline-secondary">
              <ArrowLeft className="me-1" size={16} />
              Back to Brands
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
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

                    {/* Brand Image */}
                    <div className="mb-4">
                      <label htmlFor="brand_img" className="form-label">
                        Brand Image
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
                      />
                      {errors.brand_img && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.brand_img)
                            ? errors.brand_img[0]
                            : errors.brand_img}
                        </div>
                      )}
                      <div className="form-text">
                        Allowed formats: JPEG, PNG, JPG, GIF, WebP. Max size:
                        2MB. Leave empty to keep current image.
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
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="me-1" size={16} />
                            Update Brand
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
