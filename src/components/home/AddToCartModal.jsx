import React, { useState, useEffect } from "react";
import { X, ShoppingCart } from "lucide-react";

const AddToCartModal = ({ show, onClose, product, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Parse colors and sizes
  const colors = product?.product_color
    ? product.product_color.split(",").map((c) => c.trim())
    : [];
  const sizes = product?.product_size
    ? product.product_size.split(",").map((s) => s.trim())
    : [];

  // Reset form when modal opens with new product
  useEffect(() => {
    if (show && product) {
      setSelectedColor(colors.length > 0 ? colors[0] : "");
      setSelectedSize(sizes.length > 0 ? sizes[0] : "");
      setQuantity(1);
    }
  }, [show, product]);

  const handleAddToCart = () => {
    // Validation
    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color");
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size");
      return;
    }

    // Call parent's add to cart function
    onAddToCart({
      product,
      quantity,
      selectedColor: selectedColor || null,
      selectedSize: selectedSize || null,
    });

    // Close modal
    onClose();
  };

  if (!show || !product) return null;

  const price = product.discount_price || product.selling_price;

  return (
    <>
      {/* Bootstrap Modal */}
      <div
        className="modal fade show"
        style={{ display: "block" }}
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">Add to Cart</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Product Info */}
              <div className="d-flex mb-3">
                <img
                  src={product.main_img}
                  alt={product.product_name}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
                <div className="ms-3">
                  <h6 className="mb-1">{product.product_name}</h6>
                  <p className="mb-0 text-success fw-bold">${price}</p>
                </div>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">
                    Choose Color <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    {colors.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">
                    Choose Size <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    {sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                  max={product.product_qty || 999}
                />
              </div>

              {/* Total Price */}
              <div className="alert alert-light d-flex justify-content-between align-items-center">
                <span>Total:</span>
                <strong className="text-primary">
                  ${(price * quantity).toFixed(2)}
                </strong>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddToCart}
              >
                <ShoppingCart size={16} className="me-2" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
};

export default AddToCartModal;
