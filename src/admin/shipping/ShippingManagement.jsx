import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminAPI } from "../../services/api";

const ShippingManagement = () => {
  const [shippingCharges, setShippingCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    region: "",
    charge: "",
    min_order_value: "0",
    free_shipping_threshold: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchShippingCharges();
  }, []);

  const fetchShippingCharges = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getShippingCharges();
      setShippingCharges(response.data.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch shipping charges";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      region: "",
      charge: "",
      min_order_value: "0",
      free_shipping_threshold: "",
      is_active: true,
    });
    setErrors({});
    setEditingId(null);
  };

  const handleOpenModal = (charge = null) => {
    if (charge) {
      setEditingId(charge.id);
      setFormData({
        region: charge.region || "",
        charge: charge.charge,
        min_order_value: charge.min_order_value || "0",
        free_shipping_threshold: charge.free_shipping_threshold || "",
        is_active: charge.is_active,
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setErrors({});

      if (editingId) {
        const response = await adminAPI.updateShippingCharge(
          editingId,
          formData
        );
        toast.success(response.data.message);
      } else {
        const response = await adminAPI.createShippingCharge(formData);
        toast.success(response.data.message);
      }

      fetchShippingCharges();
      handleCloseModal();
    } catch (error) {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors(validationErrors);

        const firstError = Object.values(validationErrors)[0];
        if (firstError && firstError[0]) {
          toast.error(firstError[0]);
        }
      } else {
        const errorMessage =
          error.response?.data?.message || "Operation failed";
        toast.error(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this shipping charge?")
    ) {
      return;
    }

    try {
      const response = await adminAPI.deleteShippingCharge(id);
      toast.success(response.data.message);
      fetchShippingCharges();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete";
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminAPI.toggleShippingStatus(id);
      toast.success(response.data.message);
      fetchShippingCharges();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to toggle status";
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <Truck size={24} className="me-2" />
                Shipping Charge Management
              </h4>
              <button
                className="btn btn-light btn-sm"
                onClick={() => handleOpenModal()}
              >
                <Plus size={16} className="me-1" />
                Add New Charge
              </button>
            </div>
            <div className="card-body">
              {shippingCharges.length === 0 ? (
                <div className="text-center py-5">
                  <Truck size={48} className="text-muted mb-3" />
                  <p className="text-muted">
                    No shipping charges configured yet.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                  >
                    <Plus size={16} className="me-1" />
                    Add First Charge
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Region</th>
                        <th>Charge</th>
                        <th>Min Order</th>
                        <th>Free Shipping Above</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingCharges.map((charge) => (
                        <tr key={charge.id}>
                          <td>{charge.region || "Default"}</td>
                          <td>${parseFloat(charge.charge).toFixed(2)}</td>
                          <td>
                            ${parseFloat(charge.min_order_value).toFixed(2)}
                          </td>
                          <td>
                            {charge.free_shipping_threshold
                              ? `$${parseFloat(
                                  charge.free_shipping_threshold
                                ).toFixed(2)}`
                              : "N/A"}
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${
                                charge.is_active
                                  ? "btn-success"
                                  : "btn-secondary"
                              }`}
                              onClick={() => handleToggleStatus(charge.id)}
                            >
                              {charge.is_active ? (
                                <>
                                  <ToggleRight size={18} className="me-1 custom-toggle-button" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={18} className="me-1 custom-toggle-button" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleOpenModal(charge)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(charge.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId
                      ? "Edit Shipping Charge"
                      : "Add New Shipping Charge"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="region" className="form-label">
                      Region (Optional)
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.region ? "is-invalid" : ""
                      }`}
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      placeholder="e.g., Dhaka, Chittagong"
                    />
                    {errors.region && (
                      <div className="invalid-feedback d-block">
                        {errors.region[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="charge" className="form-label">
                      Shipping Charge ($) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${
                        errors.charge ? "is-invalid" : ""
                      }`}
                      id="charge"
                      name="charge"
                      value={formData.charge}
                      onChange={handleChange}
                      placeholder="Enter shipping charge"
                      required
                    />
                    {errors.charge && (
                      <div className="invalid-feedback d-block">
                        {errors.charge[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="min_order_value" className="form-label">
                      Minimum Order Value ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${
                        errors.min_order_value ? "is-invalid" : ""
                      }`}
                      id="min_order_value"
                      name="min_order_value"
                      value={formData.min_order_value}
                      onChange={handleChange}
                      placeholder="Minimum order for this charge"
                    />
                    {errors.min_order_value && (
                      <div className="invalid-feedback d-block">
                        {errors.min_order_value[0]}
                      </div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="free_shipping_threshold"
                      className="form-label"
                    >
                      Free Shipping Above ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className={`form-control ${
                        errors.free_shipping_threshold ? "is-invalid" : ""
                      }`}
                      id="free_shipping_threshold"
                      name="free_shipping_threshold"
                      value={formData.free_shipping_threshold}
                      onChange={handleChange}
                      placeholder="Free shipping threshold (optional)"
                    />
                    {errors.free_shipping_threshold && (
                      <div className="invalid-feedback d-block">
                        {errors.free_shipping_threshold[0]}
                      </div>
                    )}
                    <small className="text-muted">
                      Leave empty for no free shipping threshold
                    </small>
                  </div>

                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="is_active">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    <X size={16} className="me-1" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        {editingId ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-1" />
                        {editingId ? "Update" : "Save"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </>
      )}
    </div>
  );
};

export default ShippingManagement;
