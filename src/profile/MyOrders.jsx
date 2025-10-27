import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { Package, Eye, Calendar, CreditCard } from "lucide-react";

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await productAPI.getMyOrders();
      if (response.data.status === 200) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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

  const getPaymentBadge = (status) => {
    const badges = {
      pending: "bg-warning text-dark",
      paid: "bg-success text-white",
      failed: "bg-danger text-white",
      refunded: "bg-info text-white",
    };
    return badges[status] || "bg-secondary text-white";
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center"
          style={{ minHeight: "350px" }}
        >
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container py-5">
        <div
          className="d-flex flex-column align-items-center justify-content-center text-center"
          style={{ minHeight: "400px" }}
        >
          <Package size={80} className="text-muted mb-4" />
          <h2>No Orders Yet</h2>
          <p className="text-muted">You haven't placed any orders yet.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate("/")}
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">My Orders</h2>
        <p className="text-muted">{orders.length} order(s) found</p>
      </div>

      <div className="row g-4">
        {orders.map((order) => (
          <div key={order.id} className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-start align-items-start flex-wrap gap-2">
                  <div>
                    <h5 className="mb-2 fw-bold">
                      Order #{order.order_number}
                    </h5>
                    <div className="d-flex gap-3 flex-wrap">
                      <small className="text-muted d-flex align-items-center gap-1">
                        <Calendar size={14} className="me-1" />
                        {new Date(order.order_date).toLocaleDateString(
                          "en-US",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </small>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <CreditCard size={14} className="me-1" />
                        {order.payment_method === "stripe"
                          ? "Card Payment"
                          : "Cash on Delivery"}
                      </small>
                    </div>
                  </div>
                  <div className="mt-1 d-flex gap-2">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span
                      className={`badge ${getPaymentBadge(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status.charAt(0).toUpperCase() +
                        order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-5 mb-3 mb-md-0">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">
                      Items ({order.order_items?.length || 0})
                    </h6>
                    <div>
                      {order.order_items?.slice(0, 3).map((item, index) => (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center py-2 border-bottom"
                        >
                          <span className="small">{item.product_name}</span>
                          <span className="small text-muted">
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                      {order.order_items?.length > 3 && (
                        <small className="text-primary">
                          +{order.order_items.length - 3} more items
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4 mb-3 mb-md-0">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">
                      Shipping Address
                    </h6>
                    <p className="small text-muted mb-0">
                      {order.shipping_address?.address},{" "}
                      {order.shipping_address?.city}
                      <br />
                      {order.shipping_address?.state},{" "}
                      {order.shipping_address?.zip_code}
                    </p>
                  </div>

                  <div className="col-md-3 text-md-end">
                    <h6 className="text-uppercase text-muted small fw-bold mb-2">
                      Total Amount
                    </h6>
                    <h4 className="fw-bold mb-0">
                      ${parseFloat(order.total).toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>

              <div className="card-footer bg-light border-top">
                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2"
                    onClick={() => navigate(`/order-details/${order.id}`)}
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
