import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { apiUrl } from "../api/AppURL";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm({
    mode: "onSubmit", // Changed to onSubmit since we handle validation manually
  });

  const saveContact = async (data) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${apiUrl}/postcontact`, data);

      if (response.data.status === 200) {
        toast.success(response.data.message || "Message sent successfully!");
        reset();
        setIsSubmitted(true);

        // Reset success state after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 2000);
      } else {
        toast.error(response.data.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light py-3 mt-4">
      <div className="container">
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-3 fw-bold text-primary mb-3">Get In Touch</h1>
          <p className="lead text-muted">
            We'd love to hear from you. Send us a message and we'll respond as
            soon as possible.
          </p>
        </div>

        <div className="row g-4">
          {/* Contact Form */}
          <div className="col-lg-7 ">
            <div className="card shadow-lg  rounded-4 custom_contact_border">
              <div className="card-body p-4 p-md-5">
                <h4 className="card-title text-center mb-4 text-primary">
                  <i className="fas fa-envelope me-2"></i>
                  CONTACT WITH US
                </h4>

                <form onSubmit={handleSubmit(saveContact)}>
                  <div className="row g-3">
                    {/* Name Field */}
                    <div className="col-md-12">
                      <input
                        id="name"
                        {...register("name", {
                          required: "Name field is required",
                          minLength: {
                            value: 3,
                            message: "Name must be at least 3 characters",
                          },
                          pattern: {
                            value: /^[A-Za-z\s]+$/,
                            message:
                              "Name field only contain letters and spaces",
                          },
                        })}
                        type="text"
                        className={`bg-light form-control form-control-lg rounded-3 ${
                          errors.name ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your full name"
                        disabled={isSubmitting}
                        onInput={(e) => {
                          const value = e.target.value;

                          if (value.length > 0) {
                            // Check for invalid characters (numbers, special chars)
                            const containsInvalidChars = /[^A-Za-z\s]/.test(
                              value
                            );

                            if (containsInvalidChars) {
                              // Immediately show error for invalid characters
                              trigger("name");
                            }
                          }
                        }}
                        onBlur={() => {
                          // Always validate on blur to catch "required" and "minLength" errors
                          trigger("name");
                        }}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">
                          <span>
                            <i className="fas fa-exclamation-circle me-1"></i>
                          </span>
                          <span
                            style={{
                              fontSize: "1rem",
                            }}
                          >
                            {errors.name.message}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Email Field */}
                    <div className="col-md-12">
                      <input
                        id="email"
                        {...register("email", {
                          required: "Email field is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Please enter a valid email address",
                          },
                        })}
                        type="email"
                        className={`bg-light form-control form-control-lg rounded-3 ${
                          errors.email ? "is-invalid" : ""
                        }`}
                        placeholder="Enter your email address"
                        disabled={isSubmitting}
                        onInput={(e) => {
                          const value = e.target.value;

                          if (value.length > 0) {
                            // Only check for clearly invalid characters or patterns
                            const hasInvalidChars = /[^A-Za-z0-9._%+-@]/.test(
                              value
                            );
                            const hasMultipleAt =
                              (value.match(/@/g) || []).length > 1;
                            const hasConsecutiveDots = /\.\./.test(value);
                            const hasSpaces = /\s/.test(value);

                            if (
                              hasInvalidChars ||
                              hasMultipleAt ||
                              hasConsecutiveDots ||
                              hasSpaces
                            ) {
                              trigger("email");
                            }
                          }
                        }}
                        onBlur={() => {
                          trigger("email");
                        }}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          <span>
                            <i className="fas fa-exclamation-circle me-1"></i>
                          </span>
                          <span
                            style={{
                              fontSize: "1rem",
                            }}
                          >
                            {errors.email.message}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className="col-12">
                      <textarea
                        id="message"
                        {...register("message", {
                          required: "Message field is required",
                          minLength: {
                            value: 10,
                            message: "Message must be at least 10 characters",
                          },
                        })}
                        className={`bg-light form-control form-control-lg rounded-3 ${
                          errors.message ? "is-invalid" : ""
                        }`}
                        placeholder="Tell us more about your inquiry..."
                        rows="5"
                        disabled={isSubmitting}
                        style={{ resize: "none" }}
                        onBlur={() => {
                          // Validate on blur for required and minLength
                          trigger("message");
                        }}
                      ></textarea>
                      {errors.message && (
                        <div className="invalid-feedback">
                          <span>
                            <i className="fas fa-exclamation-circle me-1"></i>
                          </span>
                          <span
                            style={{
                              fontSize: "1rem",
                            }}
                          >
                            {errors.message.message}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 mt-4">
                      <button
                        disabled={isSubmitting}
                        type="submit"
                        className={`btn btn-lg w-100 rounded-3 fw-semibold custom-submit-btn ${
                          isSubmitting
                            ? "btn-secondary"
                            : isSubmitted
                            ? "btn-success"
                            : "btn-primary"
                        }`}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Sending...
                          </>
                        ) : isSubmitted ? (
                          <>
                            <i className="fas fa-check-circle me-2"></i>
                            Message Sent!
                          </>
                        ) : (
                          <>
                            <i className="fas fa-paper-plane me-2"></i>
                            Send Message
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-lg-5 ">
            <div className="h-100">
              {/* Contact Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12">
                  <div className="card  shadow-sm h-100 custom_contact_border">
                    <div className="card-body d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <div
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "50px", height: "50px" }}
                        >
                          <i className="fas fa-map-marker-alt text-white"></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="card-title mb-2">Visit Us</h5>
                        <p className="card-text text-muted mb-0">
                          Bailey Road, Near Bashundhara Shopping Mall
                          <br />
                          Dhaka 1206, Bangladesh
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 ">
                  <div className="card  shadow-sm h-100 custom_contact_border">
                    <div className="card-body d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <div
                          className="bg-success rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "50px", height: "50px" }}
                        >
                          <i className="fas fa-envelope text-white"></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="card-title mb-2">Email Us</h5>
                        <p className="card-text mb-0">
                          <a
                            href="mailto:sktaimur296@gmail.com"
                            className="text-decoration-none text-primary"
                          >
                            sktaimur296@gmail.com
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 ">
                  <div className="card shadow-sm h-100 custom_contact_border">
                    <div className="card-body d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <div
                          className="bg-warning rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "50px", height: "50px" }}
                        >
                          <i className="fas fa-phone text-white"></i>
                        </div>
                      </div>
                      <div>
                        <h5 className="card-title mb-2">Call / Whatsapp</h5>
                        <p className="card-text mb-0">
                          <a
                            href="tel:+8801234567890"
                            className="text-decoration-none text-primary"
                          >
                            +880 191 465 3199
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}

              <div className="card shadow-sm custom_contact_border">
                <div className="card-body p-1">
                  <iframe
                    className="w-100 rounded-2"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.8973193000847!2d90.39216431536436!3d23.753428994640534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b087026b81%3A0x8fa563bbdd5904c2!2sBashundhara%20City!5e0!3m2!1sen!2sbd!4v1627241390779!5m2!1sen!2sbd"
                    height="300"
                    allowFullScreen=""
                    loading="lazy"
                    title="Google Map - Bailey Road, Dhaka"
                  ></iframe>
                </div>
              </div>

              {/* Response Time Alert */}
              <div className="alert alert-info shadow-sm mt-3" role="alert">
                <div className="d-flex align-items-center">
                  <i className="fas fa-clock me-2"></i>
                  <div>
                    <h6 className="alert-heading mb-1">Quick Response</h6>
                    <p className="mb-0 small">
                      We typically respond to all inquiries within 24 hours
                      during business days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
