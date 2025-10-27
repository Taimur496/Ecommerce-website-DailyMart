import React, { useState, useEffect } from "react";
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ToggleLeft,
  ToggleRight,
  Calendar,
  DollarSign,
  Percent,
  Truck,
  Package,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminAPI } from "../../services/api";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    min_order_value: "0",
    max_discount: "",
    usage_limit: "",
    usage_per_user: "1",
    start_date: "",
    expiry_date: "",
    product_ids: "",
    description: "",
    is_active: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCoupons();
      setCoupons(response.data.data);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch coupons";
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
      code: "",
      type: "percentage",
      value: "",
      min_order_value: "0",
      max_discount: "",
      usage_limit: "",
      usage_per_user: "1",
      start_date: "",
      expiry_date: "",
      product_ids: "",
      description: "",
      is_active: true,
    });
    setErrors({});
    setEditingId(null);
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_order_value: coupon.min_order_value || "0",
        max_discount: coupon.max_discount || "",
        usage_limit: coupon.usage_limit || "",
        usage_per_user: coupon.usage_per_user || "1",
        start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().slice(0, 16) : "",
        expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().slice(0, 16) : "",
        product_ids: coupon.product_ids ? coupon.product_ids.join(",") : "",
        description: coupon.description || "",
        is_active: coupon.is_active,
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

      // Prepare data
      const submitData = {
        ...formData,
        product_ids: formData.product_ids
          ? formData.product_ids.split(",").map((id) => parseInt(id.trim())).filter(id => !isNaN(id))
          : [],
      };

      if (editingId) {
        const response = await adminAPI.updateCoupon(editingId, submitData);
        toast.success(response.data.message);
      } else {
        const response = await adminAPI.createCoupon(submitData);
        toast.success(response.data.message);
      }

      fetchCoupons();
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
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      const response = await adminAPI.deleteCoupon(id);
      toast.success(response.data.message);
      fetchCoupons();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete";
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adminAPI.toggleCouponStatus(id);
      toast.success(response.data.message);
      fetchCoupons();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to toggle status";
      toast.error(errorMessage);
    }
  };

  const getCouponIcon = (type) => {
    switch (type) {
      case "percentage":
        return <Percent size={16} className="text-primary" />;
      case "fixed":
        return <DollarSign size={16} className="text-success" />;
      case "free_shipping":
        return <Truck size={16} className="text-info" />;
      default:
        return <Tag size={16} />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
                <Tag size={24} className="me-2" />
                Coupon Management
              </h4>
              <button
                className="btn btn-light btn-sm"
                onClick={() => handleOpenModal()}
              >
                <Plus size={16} className="me-1" />
                Add New Coupon
              </button>
            </div>
            <div className="card-body">
              {coupons.length === 0 ? (
                <div className="text-center py-5">
                  <Tag size={48} className="text-muted mb-3" />
                  <p className="text-muted">No coupons created yet.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                  >
                    <Plus size={16} className="me-1" />
                    Create First Coupon
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Value</th>
                        <th>Min Order</th>
                        <th>Usage</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <tr key={coupon.id}>
                          <td>
                            <strong className="text-primary">
                              {coupon.code}
                            </strong>
                            {coupon.description && (
                              <small className="d-block text-muted">
                                {coupon.description}
                              </small>
                            )}
                          </td>
                          <td>
                            <span className="d-flex align-items-center">
                              {getCouponIcon(coupon.type)}
                              <span className="ms-2 text-capitalize">
                                {coupon.type.replace("_", " ")}
                              </span>
                            </span>
                          </td>
                          <td>
                            {coupon.type === "percentage" && `${coupon.value}%`}
                            {coupon.type === "fixed" && `$${parseFloat(coupon.value).toFixed(2)}`}
                            {coupon.type === "free_shipping" && "Free"}
                            {coupon.max_discount && (
                              <small className="d-block text-muted">
                                Max: ${parseFloat(coupon.max_discount).toFixed(2)}
                              </small>
                            )}
                          </td>
                          <td>${parseFloat(coupon.min_order_value).toFixed(2)}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {coupon.coupon_usages_count || 0}
                              {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                            </span>
                            <small className="d-block text-muted mt-1">
                              <Users size={12} /> {coupon.usage_per_user} per user
                            </small>
                          </td>
                          <td>
                            <small>{formatDate(coupon.expiry_date)}</small>
                            {coupon.product_ids && coupon.product_ids.length > 0 && (
                              <small className="d-block text-info">
                                <Package size={12} /> Product specific
                              </small>
                            )}
                          </td>
                          <td>
                            <button
                              className={`btn btn-sm ${
                                coupon.is_active ? "btn-success" : "btn-secondary"
                              }`}
                              onClick={() => handleToggleStatus(coupon.id)}
                            >
                              {coupon.is_active ? (
                                <>
                                  <ToggleRight size={16} className="me-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={16} className="me-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleOpenModal(coupon)}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(coupon.id)}
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
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingId ? "Edit Coupon" : "Add New Coupon"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    {/* Coupon Code */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="code" className="form-label">
                        Coupon Code <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.code ? "is-invalid" : ""}`}
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="e.g., SAVE20"
                        style={{ textTransform: "uppercase" }}
                        required
                      />
                      {errors.code && (
                        <div className="invalid-feedback d-block">
                          {errors.code[0]}
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="type" className="form-label">
                        Discount Type <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.type ? "is-invalid" : ""}`}
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                        <option value="free_shipping">Free Shipping</option>
                      </select>
                      {errors.type && (
                        <div className="invalid-feedback d-block">
                          {errors.type[0]}
                        </div>
                      )}
                    </div>

                    {/* Value */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="value" className="form-label">
                        {formData.type === "percentage" ? "Percentage" : "Amount"} ($)
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        className={`form-control ${errors.value ? "is-invalid" : ""}`}
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder={formData.type === "percentage" ? "e.g., 10" : "e.g., 20.00"}
                        required
                        disabled={formData.type === "free_shipping"}
                      />
                      {errors.value && (
                        <div className="invalid-feedback d-block">
                          {errors.value[0]}
                        </div>
                      )}
                    </div>

                    {/* Min Order Value */}
                    <div className="col-md-6 mb-3">
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
                        placeholder="0.00"
                      />
                      {errors.min_order_value && (
                        <div className="invalid-feedback d-block">
                          {errors.min_order_value[0]}
                        </div>
                      )}
                    </div>

                    {/* Max Discount (for percentage) */}
                    {formData.type === "percentage" && (
                      <div className="col-md-6 mb-3">
                        <label htmlFor="max_discount" className="form-label">
                          Maximum Discount ($)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${
                            errors.max_discount ? "is-invalid" : ""
                          }`}
                          id="max_discount"
                          name="max_discount"
                          value={formData.max_discount}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                        <small className="text-muted">
                          Leave empty for no limit
                        </small>
                        {errors.max_discount && (
                          <div className="invalid-feedback d-block">
                            {errors.max_discount[0]}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Usage Limit */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="usage_limit" className="form-label">
                        Total Usage Limit
                      </label>
                      <input
                        type="number"
                        className={`form-control ${
                          errors.usage_limit ? "is-invalid" : ""
                        }`}
                        id="usage_limit"
                        name="usage_limit"
                        value={formData.usage_limit}
                        onChange={handleChange}
                        placeholder="Unlimited"
                      />
                      <small className="text-muted">
                        Leave empty for unlimited
                      </small>
                      {errors.usage_limit && (
                        <div className="invalid-feedback d-block">
                          {errors.usage_limit[0]}
                        </div>
                      )}
                    </div>

                    {/* Usage Per User */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="usage_per_user" className="form-label">
                        Usage Per User
                      </label>
                      <input
                        type="number"
                        className={`form-control ${
                          errors.usage_per_user ? "is-invalid" : ""
                        }`}
                        id="usage_per_user"
                        name="usage_per_user"
                        value={formData.usage_per_user}
                        onChange={handleChange}
                        placeholder="1"
                        min="1"
                      />
                      {errors.usage_per_user && (
                        <div className="invalid-feedback d-block">
                          {errors.usage_per_user[0]}
                        </div>
                      )}
                    </div>

                    {/* Start Date */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="start_date" className="form-label">
                        <Calendar size={16} className="me-1" />
                        Start Date
                      </label>
                      <input
                        type="datetime-local"
                        className={`form-control ${
                          errors.start_date ? "is-invalid" : ""
                        }`}
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                      />
                      {errors.start_date && (
                        <div className="invalid-feedback d-block">
                          {errors.start_date[0]}
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="expiry_date" className="form-label">
                        <Calendar size={16} className="me-1" />
                        Expiry Date
                      </label>
                      <input
                        type="datetime-local"
                        className={`form-control ${
                          errors.expiry_date ? "is-invalid" : ""
                        }`}
                        id="expiry_date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                      />
                      {errors.expiry_date && (
                        <div className="invalid-feedback d-block">
                          {errors.expiry_date[0]}
                        </div>
                      )}
                    </div>

                    {/* Product IDs */}
                    <div className="col-md-12 mb-3">
                      <label htmlFor="product_ids" className="form-label">
                        <Package size={16} className="me-1" />
                        Product IDs (Optional)
                      </label>
                      <input
                        type="text"
                        className={`form-control ${
                          errors.product_ids ? "is-invalid" : ""
                        }`}
                        id="product_ids"
                        name="product_ids"
                        value={formData.product_ids}
                        onChange={handleChange}
                        placeholder="e.g., 1,5,10"
                      />
                      <small className="text-muted">
                        Comma-separated product IDs. Leave empty for all products.
                      </small>
                      {errors.product_ids && (
                        <div className="invalid-feedback d-block">
                          {errors.product_ids[0]}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="col-md-12 mb-3">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                      <textarea
                        className={`form-control ${
                          errors.description ? "is-invalid" : ""
                        }`}
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        placeholder="e.g., Get 20% off on all items"
                      ></textarea>
                      {errors.description && (
                        <div className="invalid-feedback d-block">
                          {errors.description[0]}
                        </div>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="col-md-12 mb-3">
                      <div className="form-check">
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

export default CouponManagement;