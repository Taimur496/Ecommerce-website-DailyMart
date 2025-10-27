import Forget from "../../src/assets/images/forget.jpg";
import React, { useEffect, useContext } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AuthContext } from "../contexts/AuthContext";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      token: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  useEffect(() => {
    // Get token and email from URL parameters
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // Debug logs - remove these after fixing
    console.log("Raw URL params:", {
      token,
      email,
      fullURL: window.location.href,
      searchParamsString: searchParams.toString(),
    });

    if (token) {
      setValue("token", token);

      // Decode the email parameter properly
      if (email) {
        const decodedEmail = decodeURIComponent(email);
        console.log("Decoded email:", decodedEmail); // Debug log
        setValue("email", decodedEmail);

        // Force update the form values
        setTimeout(() => {
          console.log("Current form values:", getValues()); // Debug log
        }, 100);
      }
    } else {
      toast.error(
        "Invalid reset token. Please request a new password reset link."
      );
      navigate("/forgot-password");
    }
  }, [searchParams, setValue, navigate, getValues]);

  const onSubmit = async (formData) => {
    try {
      console.log("Submitting form data:", formData); // Debug log
      const result = await resetPassword(formData);

      if (result.success) {
        toast.success(result.message);
        navigate("/login");
        // setTimeout(() => navigate("/login"), 500);
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
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3 className="mt-1">Reset Your Password</h3>
              <p className="mb-0 text-muted small">
                Enter your new password below to complete the reset process.
              </p>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Hidden token field */}
                <input type="hidden" {...register("token")} />

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    readOnly
                    style={{ backgroundColor: "#f1f1f1" }}
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
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    New Password
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
                    disabled={isSubmitting}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password_confirmation" className="form-label">
                    Confirm New Password
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
                    disabled={isSubmitting}
                  />
                  {errors.password_confirmation && (
                    <div className="invalid-feedback">
                      {errors.password_confirmation.message}
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
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <div className="mt-3 text-center">
                <Link to="/login" className="text-decoration-none">
                  <i className="bi bi-arrow-left me-1"></i>
                  Back to Login
                </Link>
              </div>

              <div className="mt-1 text-center">
                <small className="text-muted fs-6">
                  Need a new reset link?{" "}
                  <Link to="/forgot-password" className="text-decoration-none">
                    Click here
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

export default ResetPassword;
