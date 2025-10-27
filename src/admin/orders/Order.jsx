import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { toast } from "react-toastify";
import { Package, Eye, RefreshCw } from "lucide-react";

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      if (response.data.status === 200) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const response = await adminAPI.updateOrderStatus(orderId, newStatus);
      if (response.data.status === 200) {
        toast.success("Order status updated successfully");
        // Update local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? response.data.order : order
          )
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingStatus(null);
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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Order Management</h2>
        <button className="btn btn-primary" onClick={fetchOrders}>
          <RefreshCw size={18} className="me-2" />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <Package size={80} className="text-muted mb-3" />
          <h4>No Orders Found</h4>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                    <br />
                    <small className="text-muted">{order.invoice_no}</small>
                  </td>
                  <td>
                    <div>
                      <strong>{order.shipping_address?.name}</strong>
                      <br />
                      <small className="text-muted">
                        {order.shipping_address?.email}
                      </small>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark">
                      {order.order_items?.length} items
                    </span>
                  </td>
                  <td>
                    <strong>${parseFloat(order.total).toFixed(2)}</strong>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        order.payment_status === "paid"
                          ? "bg-success"
                          : "bg-warning text-dark"
                      }`}
                    >
                      {order.payment_method === "stripe" ? "Card" : "COD"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <small>
                      {new Date(order.order_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </small>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center"
                        onClick={() =>
                          navigate(`/admin/order-details/${order.id}`)
                        }
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {order.status !== "delivered" &&
                        order.status !== "cancelled" && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                getNextStatus(order.status)
                              )
                            }
                            disabled={updatingStatus === order.id}
                            title={`Mark as ${getNextStatus(order.status)}`}
                          >
                            {updatingStatus === order.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              />
                            ) : (
                              <>Next →</>
                            )}
                          </button>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
