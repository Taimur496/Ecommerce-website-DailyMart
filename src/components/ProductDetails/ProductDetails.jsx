import React, { useEffect, useState } from "react";
import { ShoppingCart, Package, Star, Heart } from "lucide-react";
import { productAPI } from "../../services/api";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

import { useSelector } from "react-redux";

const ProductDetails = () => {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const cartItems = useSelector((state) => state.cart.items);

  const [searchParams] = useSearchParams();
  const productId = parseInt(searchParams.get("id")) || 1;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts();

      if (response.data.status === 200) {
        // Find the specific product or use the first one
        const productData =
          response.data.data.find((p) => p.id === productId) ||
          response.data.data[0];
        setProduct(productData);
      } else {
        console.log("Something went wrong");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const dispatch = useDispatch();
  // ... existing state

  const handleAddToCart = () => {
    if (isProductInCart(product.id)) {
      toast.error("Product is already in your cart!");
      return;
    }
    if (!selectedColor && colors.length > 0) {
      alert("Please select a color");
      return;
    }
    if (!selectedSize && sizes.length > 0) {
      alert("Please select a size");
      return;
    }

    dispatch(
      addToCart({
        product: product,
        quantity: quantity,
        selectedColor: selectedColor,
        selectedSize: selectedSize,
      })
    );

    // Optional: Show success message
    toast.success("Product added to cart!");
  };

  const isProductInCart = (productId) => {
    return cartItems.some((item) => item.product.id === productId);
  };

  if (loading) {
    return (
      <div className="product-details-wrapper">
        <div className="product-details-container">
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-wrapper">
        <div className="product-details-container">
          <div className="alert alert-warning">Product not found</div>
        </div>
      </div>
    );
  }

  // Parse colors and sizes from backend (assuming comma-separated strings)
  const colors = product.product_color
    ? product.product_color.split(",").map((c) => c.trim())
    : [];
  const sizes = product.product_size
    ? product.product_size.split(",").map((s) => s.trim())
    : [];

  // Prepare images array
  const productImages = [];
  if (product.main_img) {
    productImages.push(product.main_img);
  }
  // Handle multi images from multiImages relationship
  if (product.multi_images && Array.isArray(product.multi_images)) {
    product.multi_images.forEach((img) => {
      if (img.multi_img) {
        productImages.push(img.multi_img);
      }
    });
  }

  // Mock reviews (you can add a reviews API endpoint later)
  const reviews = [
    {
      name: "Kazi Ariyan",
      rating: 4,
      comment:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    },
    {
      name: "Sarah Johnson",
      rating: 5,
      comment:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    },
    {
      name: "Mike Peterson",
      rating: 4,
      comment:
        "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    },
  ];

  // Calculate discount percentage
  const discountPercentage =
    product.discount_price && product.selling_price
      ? Math.round(
          ((product.selling_price - product.discount_price) /
            product.selling_price) *
            100
        )
      : 0;

  return (
    <div className="product-details-wrapper">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
      />
      <div className="product-details-container">
        <div className="product-details-card">
          {/* Product Section */}
          <div className="product-grid">
            {/* Image Gallery */}
            <div className="image-gallery-section">
              <div className="main-image-container">
                <img
                  src={
                    productImages[mainImage] ||
                    "https://via.placeholder.com/800x600"
                  }
                  alt={product.product_name}
                  className="main-product-image"
                />
              </div>
              {productImages.length > 1 && (
                <div className="thumbnail-grid">
                  {productImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setMainImage(index)}
                      className={`thumbnail-container ${
                        mainImage === index ? "active" : ""
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="thumbnail-image"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="product-info-section">
              <h2 className="product-title">{product.product_name}</h2>
              <p className="product-description">
                {product.short_descp || "No description available"}
              </p>

              <div className="pricing-container">
                {product.discount_price ? (
                  <>
                    <span className="regular-price">
                      Regular Price ${product.selling_price}
                    </span>
                    <span className="discount-price">
                      {discountPercentage}% Discount
                    </span>
                    <span className="new-price">
                      New Price ${product.discount_price}
                    </span>
                  </>
                ) : (
                  <span className="new-price">
                    Original Price $
                    {product.selling_price || product.discount_price}
                  </span>
                )}
              </div>

              <div className="select-section">
                {/* Quantity */}
                <div className="form-group">
                  <label className="form-label details-quantity-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min="1"
                    max={product.product_qty || 999}
                    className="quantity-input"
                  />
                </div>
                {/* Color Selection */}
                {colors.length > 0 && (
                  <div className="form-group">
                    <label className="form-label color-label">
                      Choose Color
                    </label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select a color</option>
                      {colors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div className="form-group">
                    <label className="form-label size-label">Choose Size</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="form-select"
                    >
                      <option value="">Select a size</option>
                      {sizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="details-action-buttons">
                <button className="btn-add-cart" onClick={handleAddToCart}>
                  <ShoppingCart size={20} /> Add To Cart
                </button>
                <button className="btn-order-now">
                  <Package size={20} /> Order Now
                </button>
                <button className="btn-favourite">
                  <Heart size={20} /> Favourite
                </button>
              </div>

              {/* Product Meta Info */}
              <div className="mt-3">
                {product.product_code && (
                  <p className="text-muted mb-1">
                    <strong>Product Code:</strong> {product.product_code}
                  </p>
                )}

                {product.brand && (
                  <p className="text-muted mb-1">
                    <strong>Brand:</strong> {product.brand.brand_name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Details and Reviews Section */}
          <div className="details-reviews-grid">
            {/* Details */}
            <div className="details-section">
              <h3 className="section-title">DETAILS</h3>
              <div className="section-divider"></div>
              <div className="details-text">
                {product.long_descp ||
                  product.short_descp ||
                  "No detailed description available for this product."}
              </div>
            </div>

            {/* Reviews */}
            <div className="reviews-section">
              <h3 className="section-title">REVIEWS</h3>
              <div className="section-divider reviews-divider"></div>
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className={`review-item ${
                    index !== reviews.length - 1 ? "review-border" : ""
                  }`}
                >
                  <div className="review-header">
                    <span className="reviewer-name">{review.name}</span>
                    <div className="review-stars">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="star">
                          <Star size={16} color="gold" fill="gold" />
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
