import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Save, X, Image, Info } from "lucide-react";
import {
  productAPI,
  categoryAPI,
  subCategoryAPI,
  brandAPI,
} from "../../services/api";

const Edit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    category_id: "",
    subcategory_id: "",
    brand_id: "",
    product_name: "",
    product_slug: "",
    selling_price: "",
    discount_price: "",
    product_qty: "",
    sku: "",
    product_code: "",
    product_tags: "",
    product_size: "",
    product_color: "",
    long_descp: "",
    short_descp: "",
    main_img: null,
    multi_img: [],

    hot_deals: null,
    featured: null,
    special_offer: null,
    special_deals: null,
    status: 0,
  });
  const [originalData, setOriginalData] = useState({
    category_id: "",
    subcategory_id: "",
    brand_id: "",
    product_name: "",
    product_slug: "",
    selling_price: "",
    discount_price: "",
    product_qty: "",
    sku: "",
    product_code: "",
    product_tags: "",
    product_size: "",
    product_color: "",
    long_descp: "",
    short_descp: "",

    hot_deals: null,
    featured: null,
    special_offer: null,
    special_deals: null,
    status: 0,
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [currentMainImage, setCurrentMainImage] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [currentMultiImages, setCurrentMultiImages] = useState([]);
  const [multiImagePreviews, setMultiImagePreviews] = useState([]);
  const [multiImageDisplay, setMultiImageDisplay] = useState("No file chosen");

  // Add ref for multi image input
  const multiImageInputRef = useRef(null);

  // Auto-generate slug from product name
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  // Function to reset the multi image input
  const resetMultiImageInput = () => {
    if (multiImageInputRef.current) {
      multiImageInputRef.current.value = "";
    }
  };

  const fetchProduct = useCallback(async () => {
    try {
      const [productRes, categoriesRes, brandsRes] = await Promise.all([
        productAPI.getById(id),
        categoryAPI.getAll(),
        brandAPI.getAll(),
      ]);

      if (productRes.data.status === 200) {
        const product = productRes.data.data;

        // Set current images
        setCurrentMainImage(product.main_img || "");

        // FIX: Extract the actual image URLs from the multi_img property
        const multiImages = product.multi_images
          ? product.multi_images.map((img) => img.multi_img)
          : [];

        setCurrentMultiImages(multiImages);

        // Format product data for form
        const productData = {
          category_id: product.category_id || "",
          subcategory_id: product.subcategory_id || "",
          brand_id: product.brand_id || "",
          product_name: product.product_name || "",
          product_slug: product.product_slug || "",
          selling_price: product.selling_price || "",
          discount_price: product.discount_price || "",
          product_qty: product.product_qty || "",
          sku: product.sku || "",
          product_code: product.product_code || "",
          product_tags: product.product_tags || "",
          product_size: product.product_size || "",
          product_color: product.product_color || "",
          long_descp: product.long_descp || "",
          short_descp: product.short_descp || "",
          main_img: null,
          multi_img: [],
          hot_deals: product.hot_deals || null,
          featured: product.featured || null,
          special_offer: product.special_offer || null,
          special_deals: product.special_deals || null,
          status: product.status || 0,
        };

        setFormData(productData);
        setOriginalData(productData);

        // Set the initial display text for multi images
        const initialMultiImageCount = product.multi_images?.length || 0;
        setMultiImageDisplay(
          initialMultiImageCount > 0
            ? `${initialMultiImageCount} file${
                initialMultiImageCount !== 1 ? "s" : ""
              } selected`
            : "No file chosen"
        );

        // Fetch subcategories based on the product's category
        if (product.category_id) {
          try {
            const subCatResponse = await subCategoryAPI.getByCategory(
              product.category_id
            );
            if (subCatResponse.data.status === 200) {
              setSubCategories(subCatResponse.data.data);
            }
          } catch (error) {
            console.error("Error fetching subcategories:", error);
          }
        }
      } else {
        toast.error("Product not found");
        navigate("/admin/products");
      }

      // Set categories and brands
      if (categoriesRes.data.status === 200) {
        setCategories(categoriesRes.data.data);
      }

      if (brandsRes.data.status === 200) {
        setBrands(brandsRes.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to fetch product details");
      navigate("/admin/products");
    } finally {
      setFetchingData(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch subcategories when category changes
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (formData.category_id) {
        try {
          const response = await subCategoryAPI.getByCategory(
            formData.category_id
          );
          if (response.data.status === 200) {
            setSubCategories(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching subcategories:", error);
          toast.error("Failed to load subcategories");
        }
      } else {
        setSubCategories([]);
        setFormData((prev) => ({ ...prev, subcategory_id: "" }));
      }
    };

    fetchSubCategories();
  }, [formData.category_id]);

  // Auto-generate slug when product name changes (only if not manually edited)
  useEffect(() => {
    if (formData.product_name && !isSlugManuallyEdited) {
      const generatedSlug = generateSlug(formData.product_name);
      setFormData((prev) => ({
        ...prev,
        product_slug: generatedSlug,
      }));
    }
  }, [formData.product_name, isSlugManuallyEdited]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 1 : 0,
      }));
      return;
    }

    // for nullable flags (null or 1)
    if (
      ["featured", "hot_deals", "special_offer", "special_deals"].includes(name)
    ) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? 1 : null,
      }));
      return;
    }

    // Track if slug is manually edited
    if (name === "product_slug") {
      const expectedSlug = generateSlug(formData.product_name);
      setIsSlugManuallyEdited(
        value !== expectedSlug && value !== originalData.product_slug
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

  const handleMainImageChange = (e) => {
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
          "Please select a valid image file (JPEG, PNG, JPG, GIF, WEBP)"
        );
        e.target.value = "";

        return;
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        main_img: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.main_img) {
        setErrors((prev) => ({
          ...prev,
          main_img: "",
        }));
      }
    }
  };

  const removeNewMainImage = () => {
    setMainImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      main_img: null,
    }));
    // Reset file input
    const fileInput = document.getElementById("main_img");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleMultiImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 0) {
      // Validate each file
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/webp",
      ];
      let hasInvalidFiles = false;
      const validFiles = files.filter((file) => {
        if (!allowedTypes.includes(file.type)) {
          toast.error(
            `Invalid file type: ${file.name}. Only JPEG, PNG, JPG, GIF, WEBP are allowed.`
          );
          hasInvalidFiles = true;
          return false;
        }

        if (file.size > 2 * 1024 * 1024) {
          toast.error(`File too large: ${file.name}. Max size is 2MB.`);
          hasInvalidFiles = true;
          return false;
        }

        return true;
      });

      if (hasInvalidFiles) {
        resetMultiImageInput();
      }

      if (validFiles.length === 0) return;

      // Add new files to existing ones
      setFormData((prev) => ({
        ...prev,
        multi_img: [...prev.multi_img, ...validFiles],
      }));

      // Create previews for new files
      const newPreviews = [];
      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === validFiles.length) {
            setMultiImagePreviews((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Update display text for new selection
      const totalFiles = formData.multi_img.length + validFiles.length;
      setMultiImageDisplay(
        `${totalFiles} file${totalFiles !== 1 ? "s" : ""} selected`
      );
    }

    // Reset the file input to allow selecting the same files again
    resetMultiImageInput();
  };

  const removeNewMultiImage = (index) => {
    setFormData((prev) => {
      const newMultiImg = [...prev.multi_img];
      newMultiImg.splice(index, 1);

      // Update display text after removal
      const newCount = newMultiImg.length;
      setMultiImageDisplay(
        newCount > 0
          ? `${newCount} file${newCount !== 1 ? "s" : ""} selected`
          : "No file chosen"
      );

      return { ...prev, multi_img: newMultiImg };
    });

    setMultiImagePreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    // Reset the file input when all new images are removed
    if (formData.multi_img.length === 1) {
      resetMultiImageInput();
    }
  };

  const removeCurrentMultiImage = (index) => {
    setCurrentMultiImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);

      // Update the display text to reflect total count
      const totalFiles = newImages.length + formData.multi_img.length;
      setMultiImageDisplay(
        totalFiles > 0
          ? `${totalFiles} file${totalFiles !== 1 ? "s" : ""} selected`
          : "No file chosen"
      );

      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Append all fields that have changed
      Object.keys(formData).forEach((key) => {
        if (key === "main_img" && formData[key] instanceof File) {
          formDataToSend.append(key, formData[key]);
        } else if (key === "multi_img" && Array.isArray(formData[key])) {
          // Append each multi-image file
          formData[key].forEach((file, index) => {
            formDataToSend.append(`multi_img[${index}]`, file);
          });
        } else if (formData[key] !== originalData[key]) {
          // Only append changed fields
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add flag to indicate which current multi images to keep
      // This is the crucial fix - send the updated currentMultiImages array
      currentMultiImages.forEach((img, index) => {
        formDataToSend.append(`keep_multi_img[${index}]`, img);
      });

      // Also send the count of current images being kept for validation
      formDataToSend.append(
        "current_multi_images_count",
        currentMultiImages.length
      );

      const response = await productAPI.update(id, formDataToSend);

      if (response.data.status === 200) {
        toast.success(response.data.message || "Product updated successfully!");
        navigate("/admin/products");
      } else {
        toast.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error:", error);

      if (error.response?.status === 422) {
        // Validation errors
        setErrors(error.response.data.errors || {});
        toast.error("Please check the form for errors");
      } else {
        toast.error(
          error.response?.data?.message || "Failed to update product"
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
          <p className="mt-2">Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="h4">Edit Product</h4>
            <Link to="/admin/products" className="btn btn-outline-secondary">
              <ArrowLeft className="me-1" size={16} />
              Back to Products
            </Link>
          </div>

          <div className="card shadow">
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.category_id)
                            ? errors.category_id[0]
                            : errors.category_id}
                        </div>
                      )}
                    </div>

                    {/* SubCategory Selection */}
                    <div className="mb-4">
                      <label htmlFor="subcategory_id" className="form-label">
                        SubCategory <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.subcategory_id ? "is-invalid" : ""
                        }`}
                        id="subcategory_id"
                        name="subcategory_id"
                        value={formData.subcategory_id}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.category_id}
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.subcategory_name}
                          </option>
                        ))}
                      </select>
                      {!formData.category_id && (
                        <div className="form-text text-info">
                          Please select a category first
                        </div>
                      )}
                      {errors.subcategory_id && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.subcategory_id)
                            ? errors.subcategory_id[0]
                            : errors.subcategory_id}
                        </div>
                      )}
                    </div>

                    {/* Brand Selection */}
                    <div className="mb-4">
                      <label htmlFor="brand_id" className="form-label">
                        Brand <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${
                          errors.brand_id ? "is-invalid" : ""
                        }`}
                        id="brand_id"
                        name="brand_id"
                        value={formData.brand_id}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select a brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.brand_name}
                          </option>
                        ))}
                      </select>
                      {errors.brand_id && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.brand_id)
                            ? errors.brand_id[0]
                            : errors.brand_id}
                        </div>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="mb-4">
                      <label htmlFor="product_name" className="form-label">
                        Product Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_name ? "is-invalid" : ""
                        }`}
                        id="product_name"
                        name="product_name"
                        value={formData.product_name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        required
                      />
                      {errors.product_name && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_name)
                            ? errors.product_name[0]
                            : errors.product_name}
                        </div>
                      )}
                    </div>

                    {/* Product Slug */}
                    <div className="mb-4">
                      <label htmlFor="product_slug" className="form-label">
                        Product Slug <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_slug ? "is-invalid" : ""
                        }`}
                        id="product_slug"
                        name="product_slug"
                        value={formData.product_slug}
                        onChange={handleInputChange}
                        placeholder="Auto-generated from product name"
                      />
                      {errors.product_slug && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_slug)
                            ? errors.product_slug[0]
                            : errors.product_slug}
                        </div>
                      )}
                      <div className="form-text">
                        URL-friendly version of the product name. Leave empty
                        for auto-generation.
                      </div>
                    </div>

                    {/* Selling Price */}
                    <div className="mb-4">
                      <label htmlFor="selling_price" className="form-label">
                        Selling Price <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        pattern="[0-9]+(\.[0-9]{1,2})?"
                        inputMode="decimal"
                        className={`form-control ${
                          errors.selling_price ? "is-invalid" : ""
                        }`}
                        id="selling_price"
                        name="selling_price"
                        value={formData.selling_price}
                        onChange={handleInputChange}
                        placeholder="Enter selling price"
                        required
                      />
                      {errors.selling_price && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.selling_price)
                            ? errors.selling_price[0]
                            : errors.selling_price}
                        </div>
                      )}
                    </div>

                    {/* Discount Price */}
                    <div className="mb-4">
                      <label htmlFor="discount_price" className="form-label">
                        Discount Price
                      </label>
                      <input
                        type="text"
                        pattern="[0-9]+(\.[0-9]{1,2})?"
                        inputMode="decimal"
                        className={`form-control ${
                          errors.discount_price ? "is-invalid" : ""
                        }`}
                        id="discount_price"
                        name="discount_price"
                        value={formData.discount_price}
                        onChange={handleInputChange}
                        placeholder="Enter discount price"
                      />
                      {errors.discount_price && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.discount_price)
                            ? errors.discount_price[0]
                            : errors.discount_price}
                        </div>
                      )}
                    </div>

                    {/* Product Quantity */}
                    <div className="mb-4">
                      <label htmlFor="product_qty" className="form-label">
                        Product Quantity
                      </label>
                      <input
                        type="text"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        className={`form-control ${
                          errors.product_qty ? "is-invalid" : ""
                        }`}
                        id="product_qty"
                        name="product_qty"
                        value={formData.product_qty}
                        onChange={handleInputChange}
                        placeholder="Enter product quantity"
                      />
                      {errors.product_qty && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_qty)
                            ? errors.product_qty[0]
                            : errors.product_qty}
                        </div>
                      )}
                    </div>

                    {/* SKU */}
                    <div className="mb-4">
                      <label htmlFor="sku" className="form-label">
                        SKU <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.sku ? "is-invalid" : ""
                        }`}
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="Enter SKU"
                        required
                      />
                      {errors.sku && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.sku)
                            ? errors.sku[0]
                            : errors.sku}
                        </div>
                      )}
                    </div>

                    {/* Product Code */}
                    <div className="mb-4">
                      <label htmlFor="product_code" className="form-label">
                        Product Code
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_code ? "is-invalid" : ""
                        }`}
                        id="product_code"
                        name="product_code"
                        value={formData.product_code}
                        onChange={handleInputChange}
                        placeholder="Enter product code"
                      />
                      {errors.product_code && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_code)
                            ? errors.product_code[0]
                            : errors.product_code}
                        </div>
                      )}
                    </div>

                    {/* Product Tags */}
                    <div className="mb-4">
                      <label htmlFor="product_tags" className="form-label">
                        Product Tags
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_tags ? "is-invalid" : ""
                        }`}
                        id="product_tags"
                        name="product_tags"
                        value={formData.product_tags}
                        onChange={handleInputChange}
                        placeholder="Enter tags (comma separated)"
                      />
                      {errors.product_tags && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_tags)
                            ? errors.product_tags[0]
                            : errors.product_tags}
                        </div>
                      )}
                      <div className="form-text">
                        Separate tags with commas (e.g., tag1, tag2, tag3)
                      </div>
                    </div>

                    {/* Product Size */}
                    <div className="mb-4">
                      <label htmlFor="product_size" className="form-label">
                        Product Size
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_size ? "is-invalid" : ""
                        }`}
                        id="product_size"
                        name="product_size"
                        value={formData.product_size}
                        onChange={handleInputChange}
                        placeholder="Enter product size"
                      />
                      {errors.product_size && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_size)
                            ? errors.product_size[0]
                            : errors.product_size}
                        </div>
                      )}
                    </div>

                    {/* Product Color */}
                    <div className="mb-4">
                      <label htmlFor="product_color" className="form-label">
                        Product Color
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_color ? "is-invalid" : ""
                        }`}
                        id="product_color"
                        name="product_color"
                        value={formData.product_color}
                        onChange={handleInputChange}
                        placeholder="Enter product color"
                      />
                      {errors.product_color && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.product_color)
                            ? errors.product_color[0]
                            : errors.product_color}
                        </div>
                      )}
                    </div>

                    {/* Short Description */}
                    <div className="mb-4">
                      <label htmlFor="short_descp" className="form-label">
                        Short Description
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.short_descp ? "is-invalid" : ""
                        }`}
                        id="short_descp"
                        name="short_descp"
                        value={formData.short_descp}
                        onChange={handleInputChange}
                        placeholder="Enter short description"
                        rows="3"
                      />
                      {errors.short_descp && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.short_descp)
                            ? errors.short_descp[0]
                            : errors.short_descp}
                        </div>
                      )}
                    </div>

                    {/* Long Description */}
                    <div className="mb-4">
                      <label htmlFor="long_descp" className="form-label">
                        Long Description
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.long_descp ? "is-invalid" : ""
                        }`}
                        id="long_descp"
                        name="long_descp"
                        value={formData.long_descp}
                        onChange={handleInputChange}
                        placeholder="Enter long description"
                        rows="5"
                      />
                      {errors.long_descp && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.long_descp)
                            ? errors.long_descp[0]
                            : errors.long_descp}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    {/* Main Image */}
                    <div className="mb-4">
                      <label htmlFor="main_img" className="form-label">
                        Main Image
                      </label>
                      <input
                        type="file"
                        className={`form-control ${
                          errors.main_img ? "is-invalid" : ""
                        }`}
                        id="main_img"
                        name="main_img"
                        onChange={handleMainImageChange}
                        accept="image/*"
                      />
                      {errors.main_img && (
                        <div className="invalid-feedback">
                          {Array.isArray(errors.main_img)
                            ? errors.main_img[0]
                            : errors.main_img}
                        </div>
                      )}
                      <div className="form-text">
                        Allowed formats: JPEG, PNG, JPG, GIF, WEBP. Max size:
                        2MB. Leave empty to keep current image.
                      </div>

                      {/* Main Image Preview */}
                      <div className="mt-3">
                        <label className="form-label">Current Image:</label>
                        {mainImagePreview ? (
                          // New image preview
                          <div className="mb-3">
                            <p className="small text-success mb-2">
                              <Info className="me-1" size={14} />
                              New image (will replace current)
                            </p>
                            <div className="position-relative">
                              <img
                                src={mainImagePreview}
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
                                onClick={removeNewMainImage}
                                title="Remove new image"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ) : currentMainImage ? (
                          // Current image
                          <div>
                            <img
                              src={currentMainImage}
                              alt="Current"
                              className="img-fluid rounded border"
                              style={{
                                maxWidth: "200px",
                                maxHeight: "200px",
                                objectFit: "cover",
                              }}
                            />
                            <div style={{ marginTop: "10px" }}>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => setCurrentMainImage("")}
                                title="Remove current image"
                              >
                                <X size={14} className="me-1" />
                                Remove Current Image
                              </button>
                            </div>
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

                    {/* Status */}
                    <div className="mb-4">
                      <label className="form-label">Status</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="status"
                          name="status"
                          checked={formData.status === 1}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="status">
                          {formData.status === 1 ? "Active" : "Inactive"}
                        </label>
                      </div>
                    </div>

                    {/* Hot Deals */}
                    <div className="mb-4">
                      <label className="form-label">Hot Deals</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="hot_deals"
                          name="hot_deals"
                          checked={formData.hot_deals === 1}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="hot_deals">
                          Hot Deal
                        </label>
                      </div>
                    </div>

                    {/* Featured */}
                    <div className="mb-4">
                      <label className="form-label">Featured</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="featured"
                          name="featured"
                          checked={formData.featured === 1}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="featured">
                          Featured Product
                        </label>
                      </div>
                    </div>

                    {/* Special Offer */}
                    <div className="mb-4">
                      <label className="form-label">Slider side 2 images</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="special_offer"
                          name="special_offer"
                          checked={formData.special_offer === 1}
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="special_offer"
                        >
                          Special Offer
                        </label>
                      </div>
                    </div>

                    {/* Special Deals */}
                    <div className="mb-4">
                      <label className="form-label">Special Deals</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="special_deals"
                          name="special_deals"
                          checked={formData.special_deals === 1}
                          onChange={handleInputChange}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="special_deals"
                        >
                          Special Deals
                        </label>
                      </div>
                    </div>

                    {/* Multi Images */}
                    <div className="mb-4">
                      <label htmlFor="multi_img" className="form-label">
                        Multi Images
                      </label>
                      <div className="input-group">
                        <input
                          ref={multiImageInputRef}
                          type="file"
                          className={`form-control ${
                            errors.multi_img ? "is-invalid" : ""
                          }`}
                          id="multi_img"
                          name="multi_img"
                          onChange={handleMultiImageChange}
                          accept="image/*"
                          multiple
                          style={{ display: "none" }} // Hide the default input
                        />
                        <label
                          className="custom-choose-file form-control rounded-2 d-flex justify-content-between align-items-center"
                          htmlFor="multi_img"
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          <span>Choose files</span>
                          <span className="vr"></span>
                          <span className="text-muted">
                            {multiImageDisplay}
                          </span>
                        </label>
                      </div>
                      {errors.multi_img && (
                        <div className="invalid-feedback d-block">
                          {Array.isArray(errors.multi_img)
                            ? errors.multi_img[0]
                            : errors.multi_img}
                        </div>
                      )}
                      <div className="form-text">
                        You can select multiple images. Allowed formats: JPEG,
                        PNG, JPG, GIF, WEBP. Max size: 2MB per image.
                      </div>

                      {/* Current multi images */}
                      {currentMultiImages.length > 0 && (
                        <div className="mt-3">
                          <h6 className="mb-4">
                            Current Images ({currentMultiImages.length}):
                            <small className="text-muted ms-2">
                              Previously uploaded
                            </small>
                          </h6>
                          <div className="row">
                            {currentMultiImages.map((image, index) => (
                              <div
                                key={index}
                                className="col-6 col-md-4 mb-3 position-relative"
                              >
                                <img
                                  src={image}
                                  alt={`Current ${index + 1}`}
                                  style={{
                                    height: "70px",
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                  className="rounded border"
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                  onClick={() => removeCurrentMultiImage(index)}
                                  style={{ transform: "translate(50%, -50%)" }}
                                  title="Remove image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New multi image previews */}
                      {multiImagePreviews.length > 0 && (
                        <div className="mt-2">
                          <h6 className="mb-4">
                            New Images ({multiImagePreviews.length}):
                            <small className="text-success ms-2">
                              To be uploaded
                            </small>
                          </h6>
                          <div className="row">
                            {multiImagePreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="col-6 col-md-4 mb-3 position-relative"
                              >
                                <img
                                  src={preview}
                                  alt={`New Preview ${index + 1}`}
                                  style={{
                                    height: "70px",
                                    width: "100%",
                                    objectFit: "cover",
                                  }}
                                  className="rounded border border-success"
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm position-absolute top-0 end-0"
                                  onClick={() => removeNewMultiImage(index)}
                                  style={{ transform: "translate(50%, -50%)" }}
                                  title="Remove new image"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
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
                        to="/admin/products"
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
                            Update Product
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
