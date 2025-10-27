import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FireExtinguisher,
  Flame,
} from "lucide-react";
import "../../assets/css/newarrival.css";
import SkeletonDemo from "../../pages/Skeleton";
import { useDataCache } from "../../contexts/useDataCache";
import { Link } from "react-router-dom";
import { addToCart } from "../../redux/slices/cartSlice";
import AddToCartModal from "./AddToCartModal";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const NewArrival = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { fetchHotDeals, cache } = useDataCache();
  const [showModal, setShowModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const calculateDiscount = (sellingPrice, discountPrice) => {
    // Convert to numbers to ensure proper comparison
    const selling = parseFloat(sellingPrice);
    const discount = parseFloat(discountPrice);

    // Check if discount price is valid and actually represents a discount
    if (!discount || discount <= 0 || discount >= selling) {
      return null;
    }

    // Calculate discount percentage
    const discountPercent = ((selling - discount) * 100) / selling;

    // Only show discount if it's at least 1%
    if (discountPercent >= 1) {
      return `${Math.round(discountPercent)}% OFF`;
    }

    return null;
  };
  const hasVariants = (product) => {
    const colors = product.product_color
      ? product.product_color.split(",").map((c) => c.trim())
      : [];
    const sizes = product.product_size
      ? product.product_size.split(",").map((s) => s.trim())
      : [];
    return colors.length > 0 || sizes.length > 0;
  };

  const handleAddToCart = (product) => {
    if (isProductInCart(product.id)) {
      toast.error("Product is already in your cart!");
      return;
    }

    if (hasVariants(product)) {
      setSelectedProduct(product);
      setShowModal(true);
    } else {
      dispatch(
        addToCart({
          product: product,
          quantity: 1,
          selectedColor: null,
          selectedSize: null,
        })
      );
      toast.success("Product added to cart!");
    }
  };

  const handleModalAddToCart = (cartData) => {
    dispatch(addToCart(cartData));
    toast.success("Product added to cart!");
  };

  const isProductInCart = (productId) => {
    return cartItems.some((item) => item.product.id === productId);
  };

  const fetchProducts = async () => {
    try {
      if (cache.hotDeals.data) {
        setProducts(cache.hotDeals.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchHotDeals();
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const itemsPerView = 5;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerView
  );

  return (
    <div>
      {loading ? (
        <SkeletonDemo />
      ) : products.length > 0 ? (
        <div className="new-arrival-section">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2000,
            }}
          />
          <div className="section-header">
            <div className="arrival-header">
              <h2 className="arrival-title">
                Hot Deals
                <Flame
                  style={{
                    color: "#F26925",
                    marginLeft: "4px",
                    marginBottom: "8px",
                  }}
                  size={28}
                />
              </h2>
              <p className="arrival-subtitle">
                Some of our exclusive collections, you may like
              </p>
            </div>
            <div className="navigation-controls">
              <button
                className="nav-button"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                aria-label="Previous products"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="nav-button"
                onClick={handleNext}
                disabled={currentIndex >= maxIndex}
                aria-label="Next products"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="products-container">
            <div className="products-grid">
              {visibleProducts.map((product) => (
                <div key={product.id} className="arrival-product-card">
                  <Link
                    to={`/productdetails?id=${product.id}`}
                    className="text-decoration-none"
                  >
                    <div className="arrival-image-container">
                      <img
                        src={product.main_img}
                        alt={product.product_name}
                        className="arrival-image"
                      />
                    </div>
                    <div
                      className={`discount-badge ${
                        !calculateDiscount(
                          product.selling_price,
                          product.discount_price
                        )
                          ? "original-badge"
                          : ""
                      }`}
                    >
                      {calculateDiscount(
                        product.selling_price,
                        product.discount_price
                      ) || "New"}
                    </div>
                  </Link>
                  <div className="product-info">
                    <Link
                      to={`/productdetails?id=${product.id}`}
                      className="text-decoration-none"
                    >
                      <div className="product-category">
                        {product.category?.category_name ||
                          product.category_name}
                      </div>
                      <h3 className="product-name">{product.product_name}</h3>

                      <div className="price-section">
                        {product.selling_price && product.discount_price ? (
                          <div>
                            <span className="old-price me-2">
                              ${product.selling_price}
                            </span>
                            <span className="arrival-current-price">
                              ${product.discount_price}
                            </span>
                          </div>
                        ) : (
                          <span className="current-price">
                            ${product.discount_price || product.selling_price}
                          </span>
                        )}
                      </div>
                    </Link>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`add-to-cart ${
                        isProductInCart(product.id) ? "added" : ""
                      }`}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div> No products found </div>
      )}
      <AddToCartModal
        show={showModal}
        onClose={() => setShowModal(false)}
        product={selectedProduct}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default NewArrival;
