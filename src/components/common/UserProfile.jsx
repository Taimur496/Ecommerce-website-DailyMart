import React, { useState, useEffect } from "react";
import { User, Mail, Save, AlertCircle, Camera } from "lucide-react";
import { userAPI } from "../../services/api";
import { toast } from "react-toastify";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.profile();
      const userData = response.data.user;
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and GIF images are allowed");
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getProfileImage = () => {
    // If there's a preview (new upload), show it
    if (previewUrl) {
      return previewUrl;
    }

    // Use profile_photo_url from backend (this should be the full URL)
    if (user?.profile_photo_url) {
      return user.profile_photo_url;
    }

    // Fallback to profile_photo_path if profile_photo_url is not available
    if (user?.profile_photo_path) {
      return `http://localhost:8000/storage/${user.profile_photo_path}`;
    }

    return null;
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     setUpdating(true);

  //     const formDataToSend = new FormData();
  //     formDataToSend.append("name", formData.name);
  //     formDataToSend.append("email", formData.email);

  //     if (selectedFile) {
  //       formDataToSend.append("profile_photo", selectedFile);
  //     }

  //     const response = await fetch("http://localhost:8000/api/user/profile", {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         Accept: "application/json",
  //       },
  //       body: formDataToSend,
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setUser(data.user);
  //       localStorage.setItem("user", JSON.stringify(data.user));
  //       setSelectedFile(null);
  //       setPreviewUrl(null);
  //       document.getElementById("profile_photo").value = "";
  //       toast.success("Profile updated successfully!");
  //     } else {
  //       throw new Error(data.message || "Upload failed");
  //     }
  //   } catch (err) {
  //     if (err.response?.status === 422) {
  //       const validationErrors = err.response.data.errors || {};
  //       setErrors(validationErrors);

  //       const firstError = Object.values(validationErrors)[0];
  //       if (firstError && firstError[0]) {
  //         toast.error(firstError[0]);
  //       }
  //     } else {
  //       const errorMessage =
  //         err.response?.data?.message || "Failed to update profile";
  //       toast.error(errorMessage);
  //     }
  //   } finally {
  //     setUpdating(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);

      if (selectedFile) {
        formDataToSend.append("profile_photo", selectedFile);
      }

      const response = await userAPI.updateProfile(formDataToSend);

      setUser(response.data.user);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setSelectedFile(null);
      setPreviewUrl(null);
      document.getElementById("profile_photo").value = "";
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors || {};
        setErrors(validationErrors);

        const firstError = Object.values(validationErrors)[0];
        if (firstError && firstError[0]) {
          toast.error(firstError[0]);
        }
      } else {
        const errorMessage =
          err.response?.data?.message || "Failed to update profile";
        toast.error(errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div
        className="container py-5 d-flex flex-column align-items-center justify-content-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-3 mt-3">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">My Profile</h4>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="d-flex align-items-center mb-3">
                    <div className="position-relative me-3">
                      {getProfileImage() ? (
                        <img
                          src={getProfileImage()}
                          alt="Profile"
                          className="rounded-circle"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            border: "3px solid #667eea",
                          }}
                        />
                      ) : (
                        <div
                          className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "80px",
                            height: "80px",
                            fontSize: "32px",
                            fontWeight: "600",
                          }}
                        >
                          {getUserInitials()}
                        </div>
                      )}
                    </div>
                    <div className="ms-3">
                      <h5 className="mb-0">{user?.name}</h5>
                      <p className="text-muted mb-0">{user?.email}</p>
                      <span className="badge bg-success mt-1 text-capitalize">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <hr />

              <h5 className="mb-3">Update Profile Information</h5>
              <form onSubmit={handleSubmit}>
                {/* Profile Photo Upload */}
                <div className="mb-3">
                  <label htmlFor="profile_photo" className="form-label">
                    <Camera size={16} className="me-1" />
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    id="profile_photo"
                    accept="image/jpeg,image/png,image/jpg,image/gif"
                    onChange={handleFileChange}
                  />
                  <small className="text-muted">
                    Max size: 2MB (JPG, PNG, GIF only)
                  </small>
                  {selectedFile && (
                    <div className="mt-2">
                      <small className="text-success">
                        ✓ {selectedFile.name} selected - Click "Update Profile"
                        to save
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    <User size={16} className="me-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name[0]}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <Mail size={16} className="me-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email[0]}
                    </div>
                  )}
                  <div className="form-text">
                    This email will be used for account notifications and login
                  </div>
                </div>
                <div className="alert alert-info d-flex align-items-start">
                  <AlertCircle size={20} className="me-2 mt-1" />
                  <div>
                    <strong>Security Notice:</strong> After updating your email,
                    you may need to log in with your new email address.
                  </div>
                </div>

                <div className="mb-3">
                  <small className="text-muted">
                    <AlertCircle size={14} className="me-1" />
                    Member since:{" "}
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </small>
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={updating}
                  >
                    {updating ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} className="me-2" />
                        Update Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm mt-3">
            <div className="card-body">
              <h6 className="card-title">Account Information</h6>
              <div className="row">
                <div className="col-6">
                  <small className="text-muted">Account ID</small>
                  <p className="mb-2">{user?.id}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Account Type</small>
                  <p className="mb-2 text-capitalize">{user?.role}</p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Email Verified</small>
                  <p className="mb-0">
                    {user?.email_verified_at ? (
                      <span className="badge bg-success">Verified</span>
                    ) : (
                      <span className="badge bg-warning">Not Verified</span>
                    )}
                  </p>
                </div>
                <div className="col-6">
                  <small className="text-muted">Last Login</small>
                  <p className="mb-0">
                    {user?.last_login_at
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
