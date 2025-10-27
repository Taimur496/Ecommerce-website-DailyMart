import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import "../assets/css/orderSuccess.css";
import { productAPI } from "../services/api";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await productAPI.getOrderById(orderId);
      if (response.data.status === 200) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate item price after discount
  const calculateDiscountedItemPrice = (item) => {
    if (!order.discount || order.discount === 0) {
      return {
        originalPrice: parseFloat(item.price),
        discountedPrice: parseFloat(item.price),
        itemDiscount: 0,
        discountedTotal: parseFloat(item.total),
      };
    }

    // Calculate this item's proportion of the subtotal
    const itemSubtotal = parseFloat(item.total);
    const orderSubtotal = parseFloat(order.subtotal);
    const itemProportion = itemSubtotal / orderSubtotal;

    // Calculate discount for this item
    const itemDiscount = parseFloat(order.discount) * itemProportion;

    // Calculate discounted total for this item
    const discountedTotal = itemSubtotal - itemDiscount;

    // Calculate discounted price per unit
    const discountedPrice = discountedTotal / item.quantity;

    return {
      originalPrice: parseFloat(item.price),
      discountedPrice: discountedPrice,
      itemDiscount: itemDiscount,
      discountedTotal: discountedTotal,
    };
  };

  if (loading) {
    return (
      <div className="order-success-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-success-container">
        <div className="error-message">Order not found</div>
        <button className="btn-continue-shopping" onClick={() => navigate("/")}>
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-wrapper">
        {/* Success Header */}
        <div className="success-header">
          <CheckCircle className="success-icon" />
          <h1 className="success-title">Thank You!</h1>
          <p className="success-subtitle">
            Your order has been successfully placed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="order-summary-card">
          <h2 className="section-title">Order Summary</h2>

          {/* Order Info Grid */}
          <div className="order-info-grid">
            <div className="info-row">
              <span className="info-label">Order ID:</span>
              <span className="info-value">#{order.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Customer:</span>
              <span className="info-value">
                {order.shipping_address?.name || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span className="info-value">
                {new Date(order.order_date).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span className="info-value">
                {order.shipping_address?.address},{" "}
                {order.shipping_address?.city}, {order.shipping_address?.state},{" "}
                {order.shipping_address?.zip_code}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="status-badge status-pending">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Contact:</span>
              <span className="info-value">
                {order.shipping_address?.phone || "N/A"}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Method:</span>
              <span className="payment-badge">
                {order.payment_method === "stripe"
                  ? "Stripe"
                  : "Cash on Delivery"}
              </span>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="order-items-section">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items?.map((item, index) => {
                  const priceInfo = calculateDiscountedItemPrice(item);
                  const hasDiscount = priceInfo.itemDiscount > 0;

                  return (
                    <tr key={index}>
                      <td>
                        <div className="item-details">
                          {item.product_name}
                          {(item.product_color || item.product_size) && (
                            <div className="item-variants">
                              {item.product_color && (
                                <span>Color: {item.product_color}</span>
                              )}
                              {item.product_size && (
                                <span>Size: {item.product_size}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        {hasDiscount ? (
                          <div>
                            <div
                              style={{
                                textDecoration: "line-through",
                                color: "#999",
                                fontSize: "0.9em",
                              }}
                            >
                              ${priceInfo.originalPrice.toFixed(2)}
                            </div>
                            {order.discount > 0 && (
                              <div
                                style={{ color: "#28a745", fontWeight: "500" }}
                              >
                                <span>
                                  -${parseFloat(order.discount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div
                              style={{ color: "#28a745", fontWeight: "500" }}
                            >
                              ${priceInfo.discountedPrice.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div>${priceInfo.originalPrice.toFixed(2)}</div>
                        )}
                      </td>
                      <td>
                        {hasDiscount ? (
                          <div>
                            {/* <div
                              style={{
                                textDecoration: "line-through",
                                color: "#999",
                                fontSize: "0.9em",
                              }}
                            >
                              ${parseFloat(item.total).toFixed(2)}
                            </div> */}
                            <div
                              style={{ color: "#28a745", fontWeight: "500" }}
                            >
                              ${priceInfo.discountedTotal.toFixed(2)}
                            </div>
                          </div>
                        ) : (
                          <div>${parseFloat(item.total).toFixed(2)}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Order Totals */}
          <div className="order-totals">
            <div className="total-row">
              <span>Subtotal</span>
              <span>
                {order.discount > 0 ? (
                  <>
                    {/* <span
                      style={{
                        textDecoration: "line-through",
                        color: "#999",
                        fontSize: "0.9em",
                        marginRight: "8px",
                      }}
                    >
                      ${parseFloat(order.subtotal).toFixed(2)}
                    </span> */}
                    <span style={{ color: "#28a745", fontWeight: "500" }}>
                      $
                      {(
                        parseFloat(order.subtotal) - parseFloat(order.discount)
                      ).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                )}
              </span>
            </div>

            <div className="total-row">
              <span>Tax</span>
              <span>${parseFloat(order.tax).toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Shipping</span>
              <span>${parseFloat(order.shipping_cost).toFixed(2)}</span>
            </div>
            <div className="total-row grand-total">
              <span>Grand Total</span>
              <span>${parseFloat(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn-view-details"
            onClick={() => navigate(`/order-details/${order.id}`)}
          >
            View Order Details
          </button>
          <button
            className="btn-continue-shopping"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
