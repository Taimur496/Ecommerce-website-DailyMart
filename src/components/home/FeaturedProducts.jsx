import React, { useEffect } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import "../../assets/css/featureproduct.css";

import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  checkWishlistItem,
  addToWishlist,
  removeFromWishlist,
  addToWishlistOptimistic,
  revertAddToWishlist,
  removeFromWishlistOptimistic,
  revertRemoveFromWishlist,
} from "../../redux/slices/wishlistSlice";
import toast, { Toaster } from "react-hot-toast";

import SkeletonDemo from "../../pages/Skeleton";
import { useDataCache } from "../../contexts/useDataCache";
import AddToCartModal from "./AddToCartModal";

const FeaturedProducts = () => {
  const [products, setProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [wishlistLoadingMap, setWishlistLoadingMap] = React.useState({});

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const wishlisted = useSelector((state) => state.wishlist.wishlisted);

  const { fetchFeaturedProducts, cache } = useDataCache();

  const fetchProducts = async () => {
    try {
      if (cache.featuredProducts.data) {
        setProducts(cache.featuredProducts.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchFeaturedProducts();
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check wishlist status for all products
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      products.forEach((product) => {
        dispatch(checkWishlistItem(product.id));
      });
    }
  }, [products, dispatch]);

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
  const toggleWishlist = async (e, product) => {
    e.stopPropagation();
    const productId = product.id;

    setWishlistLoadingMap((prev) => ({ ...prev, [productId]: true }));

    try {
      if (wishlisted.includes(productId)) {
        // Optimistically remove
        dispatch(removeFromWishlistOptimistic(productId));
        try {
          await dispatch(removeFromWishlist(productId)).unwrap();
          toast.success("Removed from wishlist");
        } catch (error) {
          // Revert if API fails - need to restore the item
          dispatch(
            revertRemoveFromWishlist({
              productId,
              item: null,
            })
          );
          toast.error("Failed to remove from wishlist");
        }
      } else {
        // Optimistically add
        dispatch(addToWishlistOptimistic(productId));
        try {
          await dispatch(addToWishlist(productId)).unwrap();
          toast.success("Added to wishlist");
        } catch (error) {
          // Revert if API fails
          dispatch(revertAddToWishlist(productId));
          toast.error("Failed to add to wishlist");
        }
      }
    } finally {
      setWishlistLoadingMap((prev) => {
        const newMap = { ...prev };
        delete newMap[productId];
        return newMap;
      });
    }
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

  return (
    <div>
      {loading ? (
        <SkeletonDemo />
      ) : (
        <div className="featured-products-section">
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2000,
            }}
          />
          <div className="">
            <div className="text-center mb-1">
              <h2 className="featured-title">FEATURED PRODUCTS</h2>
              <div className="featured-badge">
                Some Of Our Exclusive Collections, You May Like
              </div>
            </div>

            <div className="row">
              {products.map((product, index) => (
                <div
                  key={index}
                  className="col-6 col-sm-4 col-md-3 custom-feature"
                  style={{ padding: "6px" }}
                >
                  <div className="product-card">
                    <Link
                      to={`/productdetails?id=${product.id}`}
                      className="text-decoration-none"
                    >
                      <div className="">
                        <img
                          src={product.main_img}
                          alt={product.product_name}
                          className="feature-product-image"
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

                    <button
                      onClick={(e) => toggleWishlist(e, product)}
                      className="favorite-btn"
                      disabled={wishlistLoadingMap[product.id]}
                    >
                      <Heart
                        size={16}
                        color={
                          wishlisted.includes(product.id)
                            ? "#ef4444"
                            : "#64748b"
                        }
                        fill={
                          wishlisted.includes(product.id) ? "#ef4444" : "none"
                        }
                      />
                    </button>
                    <div className="product-details">
                      <Link
                        to={`/productdetails?id=${product.id}`}
                        className="text-decoration-none"
                      >
                        <h5 className="product-name">{product.product_name}</h5>

                        <div className="price-section">
                          {product.selling_price && product.discount_price ? (
                            <div>
                              <span className="old-price me-2">
                                ${product.selling_price}
                              </span>
                              <span className="current-price">
                                ${product.discount_price}
                              </span>
                            </div>
                          ) : (
                            <span className="current-price">
                              ${product.discount_price || product.selling_price}
                            </span>
                          )}
                        </div>

                        <div className="product-rating">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                fill={
                                  i < Math.floor(product.rating)
                                    ? "#fbbf24"
                                    : "none"
                                }
                                color="#fbbf24"
                              />
                            ))}
                          </div>
                          <span className="rating-text">
                            {product.rating} ({product.reviews})
                          </span>
                        </div>
                      </Link>

                      <div className="action-buttons">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className={`add-to-cart-btn ${
                            isProductInCart(product.id) ? "added" : ""
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {isProductInCart(product.id)
                            ? "Added!"
                            : "Add to Cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AddToCartModal
            show={showModal}
            onClose={() => setShowModal(false)}
            product={selectedProduct}
            onAddToCart={handleModalAddToCart}
          />
        </div>
      )}
    </div>
  );
};

export default FeaturedProducts;
