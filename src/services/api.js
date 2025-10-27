// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// Simple API methods - just return axios responses

export const authAPI = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
  me: () => api.get("/me"),
  forgotPassword: (data) => api.post("/forgot-password", data),
  resetPassword: (data) => api.post("/reset-password", data),
};

export const adminAPI = {
  dashboard: () => api.get("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Admin Profile Methods
  profile: () => api.get("/admin/profile"),

  updateProfile: (formData) =>
    api.post("/admin/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  // Add these order management methods
  getAllOrders: () => api.get("/admin/orders"),
  getOrderById: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id, reason) =>
    api.put(`/admin/orders/${id}/cancel`, { reason }),

  // Shipping Charge Methods
  getShippingCharges: () => api.get("/admin/shipping-charges"),
  getShippingChargeById: (id) => api.get(`/admin/shipping-charges/${id}`),
  createShippingCharge: (data) => api.post("/admin/shipping-charges", data),
  updateShippingCharge: (id, data) =>
    api.put(`/admin/shipping-charges/${id}`, data),
  deleteShippingCharge: (id) => api.delete(`/admin/shipping-charges/${id}`),
  toggleShippingStatus: (id) =>
    api.post(`/admin/shipping-charges/${id}/toggle-status`),

  // Coupon methods
  getCoupons: () => api.get("/admin/coupons"),
  createCoupon: (data) => api.post("/admin/coupons", data),
  updateCoupon: (id, data) => api.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => api.delete(`/admin/coupons/${id}`),
  toggleCouponStatus: (id) => api.post(`/admin/coupons/${id}/toggle-status`),
};

export const couponAPI = {
  applyCoupon: (data) => api.post("/coupon/apply", data),
};

export const userAPI = {
  dashboard: () => api.get("/"),
  profile: () => api.get("/user/profile"),
  updateProfile: (formData) =>
    api.post("/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getShippingCharges: () => api.get("/shipping-charges"),
};

export const categoryAPI = {
  // Get all categories with optional filters
  getAll: (params = {}) => api.get("/admin/categories", { params }),

  // Get single category by ID
  getById: (id) => api.get(`/admin/categories/${id}`),

  // Create new category
  create: (data) => {
    // Always use FormData for file uploads
    return api.post("/admin/categories", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update category
  update: (id, data) => {
    // Use FormData with _method field for Laravel
    data.append("_method", "PUT");
    return api.post(`/admin/categories/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Delete category
  delete: (id) => api.delete(`/admin/categories/${id}`),
};

export const subCategoryAPI = {
  // Get all subcategories with optional filters
  getAll: (params = {}) => api.get("/admin/subcategories", { params }),

  // Get single subcategory by ID
  getById: (id) => api.get(`/admin/subcategories/${id}`),

  create: (data) => {
    return api.post("/admin/subcategories", data);
  },

  update: (id, data) => {
    return api.put(`/admin/subcategories/${id}`, data);
  },

  delete: (id) => api.delete(`/admin/subcategories/${id}`),

  getByCategory: (categoryId) =>
    api.get(`/admin/categories/${categoryId}/subcategories`),
};

export const brandAPI = {
  getAll: (params = {}) => api.get("/admin/brands", { params }),

  getById: (id) => api.get(`/admin/brands/${id}`),

  create: (data) => {
    return api.post("/admin/brands", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  update: (id, data) => {
    data.append("_method", "PUT");
    return api.post(`/admin/brands/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => api.delete(`/admin/brands/${id}`),
};

export const productAPI = {
  // Get all categories with optional filters
  getAll: (params = {}) => api.get("/admin/products", { params }),

  // Get single category by ID
  getById: (id) => api.get(`/admin/products/${id}`),

  // Create new category
  create: (data) => {
    // Always use FormData for file uploads
    return api.post("/admin/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Update category
  update: (id, data) => {
    data.append("_method", "PUT");
    return api.post(`/admin/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  delete: (id) => api.delete(`/admin/products/${id}`),
  getFeatured: () => api.get("/get-featureproducts"),
  getHotDeals: () => api.get("/get-hotdeals"),
  getSpecialDeals: () => api.get("/get-specialdeals"),
  getCategories: () => api.get("/get-categories"),
  getBrands: () => api.get("/get-brands"),
  getProducts: () => api.get("/get-products"),
  get2Products: () => api.get("/get-2products"),
  getProductById: (id) => api.get(`/get-product/${id}`),
  getSubCategories: () => api.get("/get-subcategories"),
  createPaymentIntent: (amount) =>
    api.post("/create-payment-intent", { amount }),
  placeOrder: (orderData) => api.post("/place-order", orderData),
  getMyOrders: () => api.get("/my-orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  search: (params = {}) => api.get("/admin/products/search", { params }),
};

export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),

  getWishlistCount: () => api.get("/wishlist/count"),

  addToWishlist: (productId) =>
    api.post("/wishlist", { product_id: productId }),

  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),

  checkInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
};

export const sliderAPI = {
  getAll: (params = {}) => api.get("/admin/sliders", { params }),
  getById: (id) => api.get(`/admin/sliders/${id}`),
  create: (data) =>
    api.post("/admin/sliders", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) => {
    data.append("_method", "PUT");
    return api.post(`/admin/sliders/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  delete: (id) => api.delete(`/admin/sliders/${id}`),

  getSliders: (params = {}) => api.get("/frontend/sliders", { params }),
};

export default api;
