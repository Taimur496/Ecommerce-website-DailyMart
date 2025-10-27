import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
} from "lucide-react";

const OrderDetails = () => {
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

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-warning text-dark",
      confirmed: "bg-info text-white",
      processing: "bg-primary text-white",
      shipped: "bg-secondary text-white",
      delivered: "bg-success text-white",
      cancelled: "bg-danger text-white",
    };
    return badges[status] || "bg-secondary text-white";
  };

  const isStepCompleted = (step) => {
    const statusOrder = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);
    return currentIndex >= stepIndex;
  };

  const isStepActive = (step) => {
    return order.status === step;
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container py-5 text-center">
        <h3>Order not found</h3>
        <button
          className="btn btn-primary mt-3"
          onClick={() => navigate("/my-orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-4">
        <button
          className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center gap-2"
          onClick={() => navigate("/my-orders")}
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <h2 className="fw-bold">Order Details</h2>
      </div>

      {/* Order Status Timeline */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between position-relative">
            {/* Progress Line */}
            <div
              className="position-absolute"
              style={{
                top: "20px",
                left: "40px",
                right: "40px",
                height: "2px",
                background: "#e5e7eb",
                zIndex: 0,
              }}
            ></div>

            {/* Pending */}
            <div
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  isStepCompleted("pending")
                    ? "bg-success text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                <Clock size={20} />
              </div>
              <small className="fw-bold text-center">Pending</small>
              {order.order_date && (
                <small className="text-muted">
                  {new Date(order.order_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              )}
            </div>

            {/* Confirmed */}
            <div
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  isStepCompleted("confirmed")
                    ? "bg-success text-white"
                    : isStepActive("confirmed")
                    ? "bg-primary text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                <CheckCircle size={20} />
              </div>
              <small className="fw-bold text-center">Confirmed</small>
              {order.confirmed_date && (
                <small className="text-muted">
                  {new Date(order.confirmed_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              )}
            </div>

            {/* Processing */}
            <div
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  isStepCompleted("processing")
                    ? "bg-success text-white"
                    : isStepActive("processing")
                    ? "bg-primary text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                <Package size={20} />
              </div>
              <small className="fw-bold text-center">Processing</small>
              {order.processing_date && (
                <small className="text-muted">
                  {new Date(order.processing_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              )}
            </div>

            {/* Shipped */}
            <div
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  isStepCompleted("shipped")
                    ? "bg-success text-white"
                    : isStepActive("shipped")
                    ? "bg-primary text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                <Truck size={20} />
              </div>
              <small className="fw-bold text-center">Shipped</small>
              {order.shipped_date && (
                <small className="text-muted">
                  {new Date(order.shipped_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              )}
            </div>

            {/* Delivered */}
            <div
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                  isStepCompleted("delivered")
                    ? "bg-success text-white"
                    : "bg-light text-muted"
                }`}
                style={{ width: "40px", height: "40px" }}
              >
                <CheckCircle size={20} />
              </div>
              <small className="fw-bold text-center">Delivered</small>
              {order.delivered_date && (
                <small className="text-muted">
                  {new Date(order.delivered_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Order Information */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Order Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <small className="text-muted d-block">Order Number</small>
                  <strong>{order.order_number}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Invoice Number</small>
                  <strong>{order.invoice_no}</strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Order Date</small>
                  <strong>
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Order Status</small>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Payment Method</small>
                  <div className="d-flex align-items-center gap-1">
                    <CreditCard size={16} className="me-2" />
                    <strong>
                      {order.payment_method === "stripe"
                        ? "Card Payment"
                        : "Cash on Delivery"}
                    </strong>
                  </div>
                </div>
                <div className="col-md-6">
                  <small className="text-muted d-block">Payment Status</small>
                  <span
                    className={`badge ${
                      order.payment_status === "paid"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Order Items</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.order_items?.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <strong className="d-block">
                              {item.product_name}
                            </strong>
                            {(item.product_color || item.product_size) && (
                              <div className="d-flex gap-2 mt-1">
                                {item.product_color && (
                                  <small className="text-muted">
                                    Color: {item.product_color}
                                  </small>
                                )}
                                {item.product_size && (
                                  <small className="text-muted">
                                    Size: {item.product_size}
                                  </small>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>${parseFloat(item.price).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td className="fw-bold">
                          ${parseFloat(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-lg-4">
          {/* Shipping Address */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <MapPin size={18} />
                Shipping Address
              </h5>
            </div>
            <div className="card-body">
              <p className="mb-1 fw-bold">{order.shipping_address?.name}</p>
              <p className="mb-1 small">{order.shipping_address?.email}</p>
              <p className="mb-1 small">{order.shipping_address?.phone}</p>
              <hr />
              <p className="mb-0 small text-muted">
                {order.shipping_address?.address}
                <br />
                {order.shipping_address?.city}, {order.shipping_address?.state}
                <br />
                {order.shipping_address?.zip_code}
                <br />
                {order.shipping_address?.country}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-light">
              <h5 className="mb-0">Order Summary</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${parseFloat(order.tax).toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${parseFloat(order.shipping_cost).toFixed(2)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong className="fs-5">Total:</strong>
                <strong className="fs-5">
                  ${parseFloat(order.total).toFixed(2)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
