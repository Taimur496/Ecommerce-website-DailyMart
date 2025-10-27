import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { adminAPI } from "../../services/api";

const AdminOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await adminAPI.getOrderById(orderId);
      if (response.data.status === 200) {
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      // const response = await api.put(`/admin/orders/${orderId}/status`, {
      //   status: newStatus,
      // });
      if (response.data.status === 200) {
        toast.success(`Order ${newStatus} successfully`);
        setOrder(response.data.order);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setUpdating(true);
    try {
      const response = await adminAPI.cancelOrder(orderId, cancelReason);
      if (response.data.status === 200) {
        toast.success("Order cancelled successfully");
        setOrder(response.data.order);
        setShowCancelModal(false);
        setCancelReason("");
      }
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: "confirmed",
      confirmed: "processing",
      processing: "shipped",
      shipped: "delivered",
    };
    return statusFlow[currentStatus];
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
    if (order.status === "cancelled") return false;
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

  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "400px" }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
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
          onClick={() => navigate("/admin/orders")}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <button
          className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center gap-2"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="fw-bold mb-1">Order #{order.order_number}</h2>
            <p className="text-muted mb-0">Invoice: {order.invoice_no}</p>
          </div>
          <div className="d-flex gap-2">
            {order.status !== "delivered" && order.status !== "cancelled" && (
              <>
                <button
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={() => updateOrderStatus(getNextStatus(order.status))}
                  disabled={updating}
                >
                  {updating ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <>
                      <ChevronRight size={18} />
                      Move to {getNextStatus(order.status)}
                    </>
                  )}
                </button>
                <button
                  className="btn btn-danger d-flex align-items-center gap-2"
                  onClick={() => setShowCancelModal(true)}
                  disabled={updating}
                >
                  <XCircle size={18} />
                  Cancel Order
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" ? (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between position-relative">
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

              {/* Timeline steps */}
              {[
                {
                  status: "pending",
                  icon: Clock,
                  label: "Pending",
                  date: order.order_date,
                },
                {
                  status: "confirmed",
                  icon: CheckCircle,
                  label: "Confirmed",
                  date: order.confirmed_date,
                },
                {
                  status: "processing",
                  icon: Package,
                  label: "Processing",
                  date: order.processing_date,
                },
                {
                  status: "shipped",
                  icon: Truck,
                  label: "Shipped",
                  date: order.shipped_date,
                },
                {
                  status: "delivered",
                  icon: CheckCircle,
                  label: "Delivered",
                  date: order.delivered_date,
                },
              ].map(({ status, icon: Icon, label, date }) => (
                <div
                  key={status}
                  className="d-flex flex-column align-items-center position-relative"
                  style={{ zIndex: 1, flex: 1 }}
                >
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                      isStepCompleted(status)
                        ? "bg-success text-white"
                        : "bg-light text-muted"
                    }`}
                    style={{ width: "40px", height: "40px" }}
                  >
                    <Icon size={20} />
                  </div>
                  <small className="fw-bold text-center">{label}</small>
                  {date && (
                    <small
                      className="text-muted text-center"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {new Date(date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="alert alert-danger d-flex align-items-center gap-2"
          role="alert"
        >
          <XCircle size={24} />
          <div>
            <strong>Order Cancelled</strong>
            <p className="mb-0">
              Reason: {order.return_reason || "No reason provided"}
            </p>
            <small className="text-muted">
              Cancelled on: {new Date(order.cancel_date).toLocaleString()}
            </small>
          </div>
        </div>
      )}

      <div className="row">
        {/* Left Column */}
        <div className="col-lg-8">
          {/* Customer & Order Info */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0">Order Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <small className="text-muted d-block">Customer Name</small>
                  <strong>{order.shipping_address?.name}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Email</small>
                  <strong>{order.shipping_address?.email}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Phone</small>
                  <strong>{order.shipping_address?.phone}</strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Order Date</small>
                  <strong>
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
                <div className="col-md-4">
                  <small className="text-muted d-block">Status</small>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <div className="col-md-4">
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

          {/* Payment Info */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0 d-flex align-items-center gap-2">
                <CreditCard size={18} />
                Payment Information
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <small className="text-muted">Payment Method</small>
                <p className="mb-0 fw-bold">
                  {order.payment_method === "stripe"
                    ? "Card Payment (Stripe)"
                    : "Cash on Delivery"}
                </p>
              </div>
              <div className="mb-2">
                <small className="text-muted">Payment Status</small>
                <p className="mb-0">
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
                </p>
              </div>
              {order.stripe_payment_intent_id && (
                <div>
                  <small className="text-muted">Stripe Payment ID</small>
                  <p className="mb-0 small font-monospace">
                    {order.stripe_payment_intent_id}
                  </p>
                </div>
              )}
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

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Order</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCancelModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this order?</p>
                <div className="mb-3">
                  <label className="form-label">Cancellation Reason *</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                  disabled={updating}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleCancelOrder}
                  disabled={updating}
                >
                  {updating ? (
                    <span className="spinner-border spinner-border-sm me-2" />
                  ) : null}
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetails;
