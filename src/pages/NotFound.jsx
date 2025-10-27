import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "../assets/css/notfound.css";
const NotFound = () => {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1 className="notfound-title">404</h1>
        <h2 className="notfound-subtitle">Page Not Found</h2>
        <p className="notfound-text">
          Oops! The page you’re looking for doesn’t exist or has been moved.
        </p>

        <div className="notfound-buttons">
          <Link to="/" className="notfound-btn home-btn">
            <ArrowLeft size={18} />
            Back to Home
          </Link>

          {/* <Link to="/login" className="notfound-btn login-btn">
            Login
          </Link> */}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
