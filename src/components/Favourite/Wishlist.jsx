import React, { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import {
  removeFromWishlist,
  fetchWishlistCount,
} from "../../redux/slices/wishlistSlice";
import { wishlistAPI } from "../../services/api";
import toast, { Toaster } from "react-hot-toast";
import "../../assets/css/wishlist.css";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.items);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      setWishlist(response.data.wishlists || []);
      // Update Redux count after fetching wishlist
      dispatch(fetchWishlistCount());
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    // Optimistically update UI
    setRemoving((prev) => ({ ...prev, [productId]: true }));
    setWishlist((prev) => prev.filter((item) => item.product_id !== productId));

    try {
      // Make API call
      await wishlistAPI.removeFromWishlist(productId);
      // Dispatch Redux action to update count and wishlisted array
      await dispatch(removeFromWishlist(productId)).unwrap();
      // Force refresh the count to ensure synchronization
      await dispatch(fetchWishlistCount());
      toast.success("Removed from wishlist");
    } catch (error) {
      // Revert UI if API call fails
      await fetchWishlist();
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemoving((prev) => {
        const newMap = { ...prev };
        delete newMap[productId];
        return newMap;
      });
    }
  };

  const handleAddToCart = (product) => {
    if (isProductInCart(product.id)) {
      toast.error("Product is already in your cart!");
      return;
    }

    dispatch(
      addToCart({
        product: product,
        quantity: 1,
        selectedColor: null,
        selectedSize: null,
      })
    );
    toast.success("Product added to cart!");
  };

  const isProductInCart = (productId) => {
    return cartItems.some((item) => item.product.id === productId);
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
        }}
      />
      <div className="container py-4">
        {/* Header */}
        <div className="wishlist-header mb-4">
          <button
            onClick={() => navigate("/")}
            className="btn btn-link p-0 me-3 text-decoration-none"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="wishlist-title">My Wishlist</h1>
            <p className="text-muted">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in
              your wishlist
            </p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist text-center py-5">
            <Heart size={64} className="text-muted mb-3" />
            <h3>Your wishlist is empty</h3>
            <p className="text-muted mb-4">
              Add products to your wishlist to save them for later
            </p>
            <Link to="/" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row">
            {wishlist.map((item) => (
              <div
                key={item.product_id}
                className="col-12 col-sm-6 col-lg-4 mb-4"
              >
                <div className="wishlist-card">
                  {/* Product Image */}
                  <Link
                    to={`/productdetails?id=${item.product_id}`}
                    className="text-decoration-none"
                  >
                    <div className="wishlist-card-image">
                      <img
                        src={item.product.main_img}
                        alt={item.product.product_name}
                        className="img-fluid"
                      />
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="wishlist-card-body">
                    <Link
                      to={`/productdetails?id=${item.product_id}`}
                      className="text-decoration-none"
                    >
                      <h5 className="wishlist-product-name">
                        {item.product.product_name}
                      </h5>

                      {/* Price */}
                      <div className="wishlist-price mb-2">
                        {item.product.selling_price &&
                        item.product.discount_price ? (
                          <div>
                            <span className="old-price">
                              ${item.product.selling_price}
                            </span>
                            <span className="current-price ms-2">
                              ${item.product.discount_price}
                            </span>
                          </div>
                        ) : (
                          <span className="current-price">
                            $
                            {item.product.discount_price ||
                              item.product.selling_price}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="wishlist-rating mb-3">
                        <div className="stars d-inline-flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={
                                i < Math.floor(item.product.rating)
                                  ? "#fbbf24"
                                  : "none"
                              }
                              color="#fbbf24"
                            />
                          ))}
                        </div>
                        <span className="rating-text ms-2">
                          ({item.product.reviews})
                        </span>
                      </div>
                    </Link>

                    {/* Action Buttons */}
                    <div className="wishlist-actions d-flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className={`btn btn-sm flex-grow-1 ${
                          isProductInCart(item.product_id)
                            ? "btn-secondary"
                            : "btn-primary"
                        }`}
                        disabled={isProductInCart(item.product_id)}
                      >
                        <ShoppingCart size={14} className="me-1" />
                        {isProductInCart(item.product_id)
                          ? "In Cart"
                          : "Add to Cart"}
                      </button>
                      <button
                        onClick={() =>
                          handleRemoveFromWishlist(item.product_id)
                        }
                        className="btn btn-sm btn-outline-danger"
                        disabled={removing[item.product_id]}
                      >
                        {removing[item.product_id] ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          ></span>
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
