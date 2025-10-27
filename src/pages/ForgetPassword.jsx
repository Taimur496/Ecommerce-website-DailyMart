import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";
import Forget from "../../src/assets/images/forget.jpg";

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const [alertMessage, setAlertMessage] = useState({ type: "", message: "" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (formData) => {
    try {
      setAlertMessage({ type: "", message: "" });
      const result = await forgotPassword(formData);

      if (result.success) {
        setAlertMessage({ type: "success", message: result.message });
        toast.success(result.message);
        reset(); // Clear the form on success
      } else {
        setAlertMessage({ type: "error", message: result.error });
        toast.error(result.error);
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
            <div className="card-header text-center">
              <h3 className="mt-1">Reset Your Password</h3>
              <p className="mb-0 text-muted small">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </div>
            <div className="card-body">
              {alertMessage.type === "success" && alertMessage.message && (
                <div className="marginBottom alert alert-success" role="alert">
                  {alertMessage.message}
                </div>
              )}
              {alertMessage.type === "error" && alertMessage.message && (
                <div className="marginBottom alert alert-danger" role="alert">
                  {alertMessage.message}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    placeholder="Enter your email address"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
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
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <Link to="/login" className="text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Login
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
        <div className="col-md-6">
          <img className="onboardImg img-fluid" src={Forget} />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
