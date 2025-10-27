import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";
import { productAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckout from "./checkout/StripeCheckout";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalPrice, coupon, discount } = useSelector(
    (state) => state.cart
  );

  // ✅ Get shipping charges from Redux
  const { charges: shippingCharges, loading: loadingShipping } = useSelector(
    (state) => state.shipping
  );

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paymentIntentCreated, setPaymentIntentCreated] = useState(false);

  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);

  const tax = totalPrice * 0.03;
  const finalTotal = totalPrice + tax + shippingCost - (discount || 0);

  // Set default shipping when charges are loaded
  useEffect(() => {
    if (shippingCharges.length > 0 && !selectedShipping) {
      setSelectedShipping(shippingCharges[0].id);
    }
  }, [shippingCharges, selectedShipping]);

  // Calculate shipping cost based on order total and selected region
  useEffect(() => {
    calculateShippingCost();
  }, [totalPrice, selectedShipping, shippingCharges]);

  const calculateShippingCost = () => {
    if (!selectedShipping || shippingCharges.length === 0) {
      setShippingCost(0);
      return;
    }

    const charge = shippingCharges.find((c) => c.id === selectedShipping);
    if (!charge) {
      setShippingCost(0);
      return;
    }

    // Check if free shipping threshold is met
    if (
      charge.free_shipping_threshold &&
      totalPrice >= parseFloat(charge.free_shipping_threshold)
    ) {
      setShippingCost(0);
      return;
    }

    // Check if minimum order value is met
    if (totalPrice >= parseFloat(charge.min_order_value)) {
      setShippingCost(parseFloat(charge.charge));
    } else {
      setShippingCost(parseFloat(charge.charge));
    }
  };

  // Check if selected shipping meets minimum order requirement
  const canPlaceOrder = () => {
    if (!selectedShipping) return false;

    const charge = shippingCharges.find((c) => c.id === selectedShipping);
    if (!charge) return false;

    return totalPrice >= parseFloat(charge.min_order_value);
  };

  // Create payment intent when Stripe is selected (only once)
  useEffect(() => {
    if (paymentMethod === "stripe" && !paymentIntentCreated && finalTotal > 0) {
      setStripeLoading(true);
      createPaymentIntent();
    }
  }, [paymentMethod, finalTotal]);

  const createPaymentIntent = async () => {
    try {
      const response = await productAPI.createPaymentIntent(finalTotal);
      if (response.data.status === 200) {
        setClientSecret(response.data.client_secret);
        setPaymentIntentCreated(true);
      }
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      toast.error("Failed to initialize payment");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleShippingChange = (e) => {
    setSelectedShipping(parseInt(e.target.value));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Reset payment intent when switching methods
    if (method === "cash_on_delivery") {
      setClientSecret("");
      setPaymentIntentCreated(false);
    }
  };

  const validateShippingInfo = () => {
    const required = [
      "name",
      "email",
      "phone",
      "address",
      "city",
      "state",
      "zip_code",
      "country",
    ];
    for (let field of required) {
      if (!shippingInfo[field]) {
        toast.error(`Please fill in ${field.replace("_", " ")}`);
        return false;
      }
    }
    return true;
  };

  const handleStripeSuccess = async (paymentIntent) => {
    await placeOrder(paymentIntent.id);
  };

  const handleStripeError = (error) => {
    toast.error(error);
  };

  const placeOrder = async (stripePaymentIntentId = null) => {
    if (!validateShippingInfo()) {
      return;
    }

    if (!selectedShipping) {
      toast.error("Please select a shipping option");
      return;
    }

    setLoading(true);

    const selectedShippingCharge = shippingCharges.find(
      (c) => c.id === selectedShipping
    );

    const orderData = {
      items: items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.product_name,
        product_color: item.selectedColor,
        product_size: item.selectedSize,
        quantity: item.quantity,
        price: item.price,
      })),
      shipping_address: shippingInfo,
      shipping_charge_id: selectedShipping,
      shipping_cost: shippingCost,
      shipping_region: selectedShippingCharge?.region || "Default",
      payment_method: paymentMethod,
      payment_intent_id: stripePaymentIntentId,
      coupon_id: coupon?.id || null,
      coupon_code: coupon?.code || null,
      discount: discount || 0,
    };

    try {
      const response = await productAPI.placeOrder(orderData);

      if (response.data.status === 201) {
        toast.success("Order placed successfully!");
        dispatch(clearCart());
        // Pass order ID to success page
        navigate(`/order-success/${response.data.order_id}`);
      }
    } catch (error) {
      console.error("Order failed:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async (e) => {
    e.preventDefault();
    await placeOrder();
  };

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Checkout</h2>

      <div className="row">
        <div className="col-md-8">
          {/* Shipping Information Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Shipping Information</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={shippingInfo.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-12 mb-3">
                  <label>Address *</label>
                  <textarea
                    className="form-control"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>City *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>State *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>ZIP Code *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="zip_code"
                    value={shippingInfo.zip_code}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label>Country *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Options */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Shipping Options</h5>
            </div>
            <div className="card-body">
              {loadingShipping ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border spinner-border-sm"
                    role="status"
                  >
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <span className="ms-2">Loading shipping options...</span>
                </div>
              ) : shippingCharges.length === 0 ? (
                <div className="alert alert-warning">
                  No shipping options available at the moment.
                </div>
              ) : (
                <>
                  {shippingCharges.map((charge) => {
                    const minOrderValue = parseFloat(charge.min_order_value);
                    const meetsMinOrder = totalPrice >= minOrderValue;
                    const isFreeShipping =
                      charge.free_shipping_threshold &&
                      totalPrice >= parseFloat(charge.free_shipping_threshold);
                    const isDisabled = !meetsMinOrder;

                    return (
                      <div
                        key={charge.id}
                        className={`form-check mb-3 p-3 border rounded ${
                          isDisabled ? "bg-light opacity-75" : ""
                        }`}
                      >
                        <input
                          className="form-check-input"
                          type="radio"
                          name="shipping"
                          id={`shipping-${charge.id}`}
                          value={charge.id}
                          checked={selectedShipping === charge.id}
                          onChange={handleShippingChange}
                          disabled={isDisabled}
                        />
                        <label
                          className="form-check-label w-100"
                          htmlFor={`shipping-${charge.id}`}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>
                                {charge.region || "Standard Shipping"}
                              </strong>
                              {minOrderValue > 0 && (
                                <div
                                  className={`small ${
                                    meetsMinOrder ? "text-muted" : "text-danger"
                                  }`}
                                >
                                  {meetsMinOrder ? (
                                    <>
                                      ✓ Minimum order: $
                                      {minOrderValue.toFixed(2)}
                                    </>
                                  ) : (
                                    <>
                                      ⚠ Minimum order: $
                                      {minOrderValue.toFixed(2)} (Need $
                                      {(minOrderValue - totalPrice).toFixed(2)}{" "}
                                      more)
                                    </>
                                  )}
                                </div>
                              )}
                              {charge.free_shipping_threshold &&
                                meetsMinOrder && (
                                  <div className="text-muted small">
                                    {isFreeShipping ? (
                                      <span className="text-success">
                                        ✓ Free shipping applied!
                                      </span>
                                    ) : (
                                      <span>
                                        Free shipping on orders over $
                                        {parseFloat(
                                          charge.free_shipping_threshold
                                        ).toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                )}
                            </div>
                            <div className="text-end">
                              <strong
                                className={
                                  isFreeShipping
                                    ? "text-success"
                                    : isDisabled
                                    ? "text-muted"
                                    : ""
                                }
                              >
                                {isDisabled
                                  ? "Not Available"
                                  : isFreeShipping
                                  ? "FREE"
                                  : `${parseFloat(charge.charge).toFixed(2)}`}
                              </strong>
                            </div>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Payment Method</h5>
            </div>
            <div className="card-body">
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="payment"
                  id="cod"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <label className="form-check-label" htmlFor="cod">
                  Cash on Delivery
                </label>
              </div>
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="payment"
                  id="stripe"
                  value="stripe"
                  checked={paymentMethod === "stripe"}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                />
                <label className="form-check-label" htmlFor="stripe">
                  Credit/Debit Card (Stripe)
                </label>
              </div>

              {/* Stripe Payment Form */}
              {paymentMethod === "stripe" && (
                <div className="mt-4">
                  {stripeLoading ? (
                    <div className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted">
                        Initializing secure payment...
                      </p>
                    </div>
                  ) : clientSecret ? (
                    <Elements options={options} stripe={stripePromise}>
                      <StripeCheckout
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                      />
                    </Elements>
                  ) : null}
                </div>
              )}

              {/* Cash on Delivery Button */}
              {paymentMethod === "cash_on_delivery" && (
                <>
                  <button
                    onClick={handleCashOnDelivery}
                    className="btn btn-primary btn-lg w-100 mt-3"
                    disabled={loading || loadingShipping || !canPlaceOrder()}
                  >
                    {loading
                      ? "Processing..."
                      : !canPlaceOrder()
                      ? "Minimum Order Not Met"
                      : "Place Order"}
                  </button>
                  {!canPlaceOrder() && selectedShipping && (
                    <div className="alert alert-warning mt-2 mb-0">
                      <small>
                        Please add $
                        {(
                          parseFloat(
                            shippingCharges.find(
                              (c) => c.id === selectedShipping
                            )?.min_order_value || 0
                          ) - totalPrice
                        ).toFixed(2)}{" "}
                        more to meet the minimum order requirement.
                      </small>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-md-4">
          <div className="card sticky-top" style={{ top: "20px" }}>
            <div className="card-header">
              <h5>Order Summary</h5>
            </div>
            <div className="card-body">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="d-flex justify-content-between mb-2"
                >
                  <span>
                    {item.product.product_name} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              {coupon && discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Discount ({coupon.code}):</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Tax (3%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span
                  className={
                    shippingCost === 0 && selectedShipping ? "text-success" : ""
                  }
                >
                  {loadingShipping ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                    ></span>
                  ) : shippingCost === 0 && selectedShipping ? (
                    "FREE"
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>${finalTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
