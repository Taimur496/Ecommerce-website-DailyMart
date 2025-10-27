import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import Login from "../../src/assets/images/login.png";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "user",
    },
  });

  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (formData) => {
    try {
      // Clean and prepare data for backend
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        role: formData.role || "user",
      };

      const result = await authRegister(submitData);
      if (result.success) {
        toast.success(result.message);
        if (result.user.role === "admin") {
          navigate("/login");
        } else {
          navigate("/login");
        }
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-center pt-1">User Register</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                      maxLength: {
                        value: 255,
                        message: "Name cannot exceed 255 characters",
                      },
                    })}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">
                      {errors.name.message}
                    </div>
                  )}
                </div>

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
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    id="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                        message:
                          "Password must contain at least one uppercase, one lowercase letter and one number",
                      },
                    })}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password_confirmation" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={`form-control ${
                      errors.password_confirmation ? "is-invalid" : ""
                    }`}
                    id="password_confirmation"
                    {...register("password_confirmation", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                  />
                  {errors.password_confirmation && (
                    <div className="invalid-feedback">
                      {errors.password_confirmation.message}
                    </div>
                  )}
                </div>

                <input type="hidden" {...register("role")} />

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>
              </form>

              <div className="mt-3 text-center">
                <small className="text-muted fs-6">
                  Already have an account?{" "}
                  <Link to="/login" className="text-decoration-none">
                    Login
                  </Link>
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <img src={Login} className="onboardImg img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default Register;
