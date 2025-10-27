import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, Search, X, Image, Info } from "lucide-react";
import { sliderAPI, productAPI } from "../../services/api";

const SliderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    is_active: true,
    product_id: "",
  });
  const [currentImage, setCurrentImage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});

  // Product search states
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch slider data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);

        const response = await sliderAPI.getById(id);
        if (response.data.status === "success") {
          const slider = response.data.slider;
          setFormData({
            is_active: slider.is_active || false,
            product_id: slider.product_id || "",
          });

          // Set current image for preview
          if (slider.image_url) {
            setCurrentImage(slider.image_url);
          }

          // If there's a product_id, fetch product details
          if (slider.product_id && slider.product) {
            setSelectedProduct(slider.product);
            setProductSearch(slider.product.product_name || "");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load slider data");
        navigate("/admin/sliders");
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handle product search
  const handleProductSearch = async (searchTerm) => {
    setProductSearch(searchTerm);

    if (searchTerm.length < 2) {
      setProducts([]);
      setShowProductDropdown(false);
      return;
    }

    setSearchingProducts(true);
    try {
      const response = await productAPI.search({ search: searchTerm });
      if (response.data.status === "success") {
        setProducts(response.data.products);
        setShowProductDropdown(true);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setProducts([]);
    } finally {
      setSearchingProducts(false);
    }
  };

  // Select product
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      product_id: product.id,
    }));
    setProductSearch(product.product_name);
    setShowProductDropdown(false);
    setProducts([]);
  };

  // Clear selected product
  const handleClearProduct = () => {
    setSelectedProduct(null);
    setFormData((prev) => ({
      ...prev,
      product_id: "",
    }));
    setProductSearch("");
    setProducts([]);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      if (errors.image) {
        setErrors((prev) => ({
          ...prev,
          image: "",
        }));
      }
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById("image");
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

      // Always append status field
      formDataToSend.append("is_active", formData.is_active ? 1 : 0);
      if (formData.product_id) {
        formDataToSend.append("product_id", formData.product_id);
      }
      formDataToSend.append("_method", "PUT");

      // Only append image if a new file was selected
      if (newImage instanceof File) {
        formDataToSend.append("image", newImage);
      }

      const response = await sliderAPI.update(id, formDataToSend);

      if (response.data.status === "success") {
        toast.success(response.data.message || "Slider updated successfully!");
        navigate("/admin/sliders");
      } else {
        toast.error("Failed to update slider");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(error.response?.data?.message || "Failed to update slider");
      }
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".product-search-container")) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format price function
  const formatPrice = (product) => {
    if (product.discount_price && product.discount_price > 0) {
      return (
        <div>
          <span className="text-danger fw-bold">${product.discount_price}</span>
          <span className="text-muted text-decoration-line-through ms-2">
            ${product.selling_price}
          </span>
        </div>
      );
    }
    return <span className="fw-bold">${product.selling_price}</span>;
  };

  if (fetchingData) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="h4">Edit Slider</h4>
              <Link to="/admin/sliders" className="btn btn-outline-secondary">
                <ArrowLeft className="me-1" size={16} />
                Back to Sliders
              </Link>
            </div>
            <div className="card shadow">
              <div className="card-body p-4 text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading slider data...</p>
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
            <h4 className="h4">Edit Slider</h4>
            <Link to="/admin/sliders" className="btn btn-outline-secondary">
              <ArrowLeft className="me-1" size={16} />
              Back to Sliders
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    {/* Product Search */}
                    <div className="mb-4 product-search-container">
                      <label htmlFor="product_search" className="form-label">
                        Select Product (Optional)
                      </label>
                      <div className="position-relative">
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            id="product_search"
                            placeholder="Search products by name, slug, or SKU..."
                            value={productSearch}
                            onChange={(e) =>
                              handleProductSearch(e.target.value)
                            }
                            onFocus={() =>
                              productSearch.length >= 2 &&
                              setShowProductDropdown(true)
                            }
                          />
                          {selectedProduct && (
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={handleClearProduct}
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Product Dropdown */}
                        {showProductDropdown && (
                          <div
                            className="slider-dropdown-menu show w-100"
                            style={{
                              display: "block",
                              maxHeight: "300px",
                              overflowY: "auto",
                            }}
                          >
                            {searchingProducts ? (
                              <div className="dropdown-item">
                                <div className="d-flex align-items-center">
                                  <div
                                    className="spinner-border text-primary spinner-border-sm me-2"
                                    role="status"
                                  >
                                    <span className="visually-hidden">
                                      Loading...
                                    </span>
                                  </div>
                                  Searching products...
                                </div>
                              </div>
                            ) : products.length > 0 ? (
                              products.map((product) => (
                                <button
                                  key={product.id}
                                  type="button"
                                  className="dropdown-item"
                                  onClick={() => handleSelectProduct(product)}
                                >
                                  <div className="d-flex align-items-start">
                                    {product.image_url && (
                                      <img
                                        src={product.image_url}
                                        alt={product.product_name}
                                        className="me-3 rounded"
                                        style={{
                                          width: "40px",
                                          height: "40px",
                                          objectFit: "cover",
                                        }}
                                      />
                                    )}
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <span className="fw-medium me-2">
                                          {product.product_name}
                                        </span>
                                        {formatPrice(product)}
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                          {product.product_slug}
                                        </small>
                                        <small className="text-muted">
                                          SKU: {product.sku}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="dropdown-item text-muted">
                                No products found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="form-text">
                        Link this slider to a specific product. Users will be
                        redirected to the product when they click the slider.
                      </div>
                      {errors.product_id && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(errors.product_id)
                            ? errors.product_id[0]
                            : errors.product_id}
                        </div>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="is_active">
                          Active Slider
                        </label>
                      </div>
                      <div className="form-text">
                        When active, this slider will be visible on the website.
                      </div>
                    </div>

                    {/* Slider Image */}
                    <div className="mb-4">
                      <label htmlFor="image" className="form-label">
                        Slider Image
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.image ? "is-invalid" : ""
                        }`}
                        id="image"
                        name="image"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                      {errors.image && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.image)
                            ? errors.image[0]
                            : errors.image}
                        </div>
                      )}
                      <div className="form-text">
                        Allowed formats: JPEG, PNG, JPG, GIF, WebP. Max size:
                        2MB. Leave empty to keep current image.
                      </div>
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Image Preview */}
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

                    {/* Selected Product Preview */}
                    {selectedProduct && (
                      <div className="mb-4">
                        <label className="form-label">Selected Product</label>
                        <div className="card border-success">
                          <div className="card-body">
                            <div className="d-flex align-items-start">
                              {selectedProduct.image_url && (
                                <img
                                  src={selectedProduct.image_url}
                                  alt={selectedProduct.product_name}
                                  className="me-3 rounded"
                                  style={{
                                    width: "50px",
                                    height: "50px",
                                    objectFit: "cover",
                                  }}
                                />
                              )}
                              <div className="flex-grow-1">
                                <h6 className="card-title mb-1">
                                  {selectedProduct.product_name}
                                </h6>
                                <p className="card-text text-muted small mb-1">
                                  {selectedProduct.product_slug}
                                </p>
                                <div className="d-flex justify-content-between align-items-center">
                                  {formatPrice(selectedProduct)}
                                </div>
                                <small className="text-muted">
                                  SKU: {selectedProduct.sku}
                                </small>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mt-2"
                              onClick={handleClearProduct}
                            >
                              Remove Product
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="row">
                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-end gap-2">
                      <Link
                        to="/admin/sliders"
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
                            Update Slider
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

export default SliderEdit;
