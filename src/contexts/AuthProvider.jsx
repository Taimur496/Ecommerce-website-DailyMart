// AuthProvider.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { authAPI } from "../services/api";
import { AuthContext } from "./AuthContext";
import { toast } from "react-toastify";
import { reloadCart } from "../redux/slices/cartSlice";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
      authAPI
        .me()
        .then((response) => {
          setUser(response.data.user);
          // Reload cart after user data is confirmed
          dispatch(reloadCart());
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user");
          setUser(null);
          // Reload cart for guest user
          dispatch(reloadCart());
        });
    } else {
      // Load guest cart if no user
      dispatch(reloadCart());
    }
    setLoading(false);
  }, [dispatch]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, access_token, message } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      // Reload cart for the logged-in user
      dispatch(reloadCart());

      return {
        success: true,
        user,
        message: message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.errors ||
          error.response?.data?.message ||
          "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, access_token, message } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));
      // setUser(user);

      // Reload cart for the new user
      dispatch(reloadCart());

      return {
        success: true,
        user,
        message: message || "Registration successful!",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.errors ||
          error.response?.data?.message ||
          "Registration failed",
      };
    }
  };

  const resetPassword = async (resetData) => {
    try {
      const response = await authAPI.resetPassword(resetData);

      // Your Laravel backend returns: { status: 'success', message: '...' }
      if (response.data?.status === "success") {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Password reset failed",
        };
      }
    } catch (error) {
      console.error("Password reset error:", error);

      // Handle validation errors (422)
      if (error.response?.status === 422 && error.response.data?.errors) {
        const validationErrors = error.response.data.errors;
        // Convert validation errors object to array of messages
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        return {
          success: false,
          error: errorMessages,
        };
      }

      // Handle other errors (400, 500, etc.)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
      };
    }
  };

  const forgotPassword = async (emailData) => {
    try {
      const response = await authAPI.forgotPassword(emailData);

      // Your Laravel backend returns: { status: 'success', message: '...' }
      if (response.data?.status === "success") {
        return {
          success: true,
          message: response.data.message,
        };
      } else {
        return {
          success: false,
          error: response.data?.message || "Failed to send reset link",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      // Handle validation errors (422)
      if (error.response?.status === 422 && error.response.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        return {
          success: false,
          error: errorMessages,
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          "An unexpected error occurred. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      const response = await authAPI.logout();

      // Show success toast with backend message or default
      const successMessage =
        response.data?.message || "Successfully logged out";
      toast.success(successMessage);

      return {
        success: true,
        message: successMessage,
      };
    } catch (error) {
      console.error("Logout error:", error);

      // Show error toast
      const errorMessage =
        error.response?.data?.message || "Logout failed. Please try again.";
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Note: We DON'T clear the user's cart on logout
      // The cart remains in localStorage under their user ID
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      setUser(null);

      // Switch to guest cart (empty) until they log back in
      dispatch(reloadCart());
    }
  };

  const value = {
    user,
    login,
    register,
    resetPassword,
    forgotPassword,
    logout,
    loading,
    isAdmin: user?.role === "admin",
    isUser: user?.role === "user",
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
