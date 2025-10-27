import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  applyCoupon as applyCouponAction,
  removeCoupon,
} from "../../redux/slices/cartSlice";
import { Link } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Tag,
  X,
} from "lucide-react";
import { couponAPI } from "../../services/api";
import { toast } from "react-toastify";
import "../../assets/css/cart.css";

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, coupon, discount, finalTotal } = useSelector(
    (state) => state.cart
  );

  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(
      updateQuantity({
        productId: item.product.id,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        quantity: newQuantity,
      })
    );
  };

  const handleRemove = (item) => {
    dispatch(
      removeFromCart({
        productId: item.product.id,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    try {
      setApplyingCoupon(true);

      // Get product IDs from cart
      const productIds = items.map((item) => item.product.id);

      const response = await couponAPI.applyCoupon({
        code: couponCode.trim(),
        subtotal: totalPrice,
        product_ids: productIds,
      });

      if (response.data.status === "success") {
        dispatch(applyCouponAction(response.data.coupon));
        toast.success(response.data.message);
        setCouponCode("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to apply coupon";
      toast.error(errorMessage);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info("Coupon removed");
  };

  if (items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-wrapper">
          <div className="empty-cart-content">
            <ShoppingCart className="empty-cart-icon" />
            <h2 className="empty-cart-title">Your cart is empty</h2>
            <p className="empty-cart-text">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/" className="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-wrapper">
        {/* Header */}
        <div className="cart-header">
          <div className="cart-header-content">
            <Link to="/" className="back-btn">
              <ArrowLeft className="back-icon" />
            </Link>
            <div>
              <h1 className="cart-title">Shopping Cart</h1>
              <p className="cart-subtitle">
                {getTotalItems()} items in your cart
              </p>
            </div>
          </div>
        </div>

        <div className="cart-grid">
          {/* Cart Items */}
          <div className="cart-items-section">
            {items.map((item, index) => (
              <div key={index} className="cart-item-content">
                <div className="cart-item-layout">
                  {/* Product Image */}
                  <div className="product-image-container">
                    <div className="product-image-wrapper">
                      <img
                        src={item.product.main_img}
                        alt={item.product.product_name}
                        className="product-image"
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="cart-product-details">
                    <div className="product-header">
                      <div>
                        <h3 className="product-name">
                          {item.product.product_name}
                        </h3>
                        <div className="product-variants">
                          <span className="variant-text">
                            Color: {item.selectedColor}
                          </span>
                          <span className="variant-text">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item)}
                        className="remove-btn-top"
                      >
                        <Trash2 className="remove-icon" />
                      </button>
                    </div>

                    <div className="product-controls">
                      {/* Price */}
                      <div className="cart-product-price">
                        ${item.price.toLocaleString()}
                      </div>

                      {/* Quantity Controls */}
                      <div className="quantity-section">
                        <span className="quantity-label">Quantity:</span>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              handleQuantityChange(item, item.quantity - 1)
                            }
                            className="quantity-btn"
                          >
                            <Minus className="quantity-icon" />
                          </button>
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item, item.quantity + 1)
                            }
                            className="quantity-btn"
                          >
                            <Plus className="quantity-icon" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="item-total-section">
                      <div className="item-total">
                        <span className="item-total-label">Item Total:</span>
                        <span className="item-total-price">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <div className="order-summary-card">
              <h2 className="order-summary-title">Order Summary</h2>

              {/* Coupon Section */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center">
                  <Tag size={16} className="me-2" />
                  Have a coupon code?
                </label>
                {!coupon ? (
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) =>
                        setCouponCode(e.target.value.toUpperCase())
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                    >
                      {applyingCoupon ? (
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="alert alert-success d-flex justify-content-between align-items-center mb-0">
                    <div>
                      <strong>{coupon.code}</strong> applied
                      {coupon.type === "percentage" && (
                        <span className="ms-2">({coupon.value}% off)</span>
                      )}
                      {coupon.type === "fixed" && (
                        <span className="ms-2">(${coupon.value} off)</span>
                      )}
                      {coupon.free_shipping && (
                        <span className="ms-2">(Free shipping)</span>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={handleRemoveCoupon}
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <hr />

              <div className="order-summary-details">
                <div className="summary-row">
                  <span>Subtotal ({getTotalItems()} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {coupon && discount > 0 && (
                  <div className="summary-row text-success">
                    <span>Discount ({coupon.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="summary-total">
                  <div className="total-row">
                    <span>Total</span>
                    <span>${(finalTotal || totalPrice).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Link to="/checkout" className="checkout-btn">
                <div className="checkout-btn-content">
                  <ShoppingCart className="checkout-icon" />
                  <span>Proceed to Checkout</span>
                </div>
              </Link>

              <Link to="/" className="continue-shopping-secondary">
                Continue Shopping
              </Link>

              {/* Security Badge */}
              <div className="security-section">
                <div className="security-badge">
                  <div className="security-indicator">
                    <div className="security-dot"></div>
                  </div>
                  <div className="secure-checkout">
                    Secure checkout guaranteed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
