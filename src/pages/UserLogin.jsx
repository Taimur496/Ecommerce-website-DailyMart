// src/components/Login.js
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Login from "../../src/assets/images/login.png";

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from || "/";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (formData) => {
    try {
      const submitData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };
      const result = await login(submitData);
      if (result.success) {
        toast.success(result.message);
        if (result.user.role === "admin") {
          // navigate("/admin/dashboard");
          if (from.startsWith("/admin/")) {
            navigate(from, { replace: true });
          } else {
            navigate("/admin/dashboard", { replace: true });
          }
        } else {
          // Redirect to intended destination or home page
          navigate(from, { replace: true });
        }
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center pt-1">User Login</h3>
              {/* Show message if user was redirected from a protected route */}
              {location.state?.from && location.state.from !== "/" && (
                <div className="alert alert-info alert-sm mt-2 mb-0">
                  <small>Please log in to access {location.state.from}</small>
                </div>
              )}
            </div>
            <div className="card-body">
              {/* Add custom CSS */}
              <style>{`
                .password-toggle-btn {
                  position: absolute !important;
                  right: 10px !important;
                  top: 50% !important;
                  transform: translateY(-50%) !important;
                  background: transparent !important;
                  border: none !important;
                  cursor: pointer !important;
                  padding: 5px !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                  z-index: 1000 !important;
                  color: #6c757d !important;
                  width: 30px !important;
                  height: 30px !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                }
                
                .password-toggle-btn:hover {
                  color: #495057 !important;
                  background: transparent !important;
                }
                
                .password-toggle-btn:focus {
                  outline: none !important;
                  box-shadow: none !important;
                }
                
                .password-toggle-btn svg {
                  pointer-events: none !important;
                  display: block !important;
                  opacity: 1 !important;
                  visibility: visible !important;
                }
                
                .password-container {
                  position: relative !important;
                }
              `}</style>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    autoComplete="username"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <div className="password-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      style={{ paddingRight: "45px" }}
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 1,
                          message: "Password is required",
                        },
                      })}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={togglePasswordVisibility}
                    >
                      {!showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-eye-off-icon cursor-pointer"
                        >
                          <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"></path>
                          <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                          <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"></path>
                          <path d="m2 2 20 20"></path>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-eye-icon cursor-pointer"
                        >
                          <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/forgot-password" className="text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Forgot Password?
                </Link>
              </div>

              <div className="mt-2 text-center">
                <small className="text-muted fs-6">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-decoration-none">
                    Sign up here
                  </Link>
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <img src={Login} alt="Login" className="onboardImg img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
