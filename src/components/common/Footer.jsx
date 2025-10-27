import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Apple from "../../assets/images/apple.png";
import Google from "../../assets/images/google.png";
import { ArrowRight, Facebook, Instagram, Twitter, User } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaSignOutAlt,
  FaTwitter,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Define the Google Translate initialization function
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        var config = {
          pageLanguage: "en",
          includedLanguages:
            "en,zh-CN,zh-TW,hi,es,ar,bn,pt,ru,ja,pa,de,jv,wu,ms,fr,tr,ko,vi,yue,ur,it,fa,pl,uk",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        };
        var langOptionsID = "google_translate_element";
        new window.google.translate.TranslateElement(config, langOptionsID);
      }
    };

    // Load Google Translate script after page loads
    const loadGoogleTranslate = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src*="translate.google.com"]')) {
        return;
      }

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.defer = true;

      // Add error handling
      script.onerror = () => {
        console.warn("Failed to load Google Translate");
      };

      document.head.appendChild(script);
    };

    // Use requestIdleCallback for better performance, fallback to setTimeout
    if ("requestIdleCallback" in window) {
      requestIdleCallback(loadGoogleTranslate, { timeout: 2000 });
    } else {
      setTimeout(loadGoogleTranslate, 1000);
    }

    // Cleanup function
    return () => {
      if (window.googleTranslateElementInit) {
        delete window.googleTranslateElementInit;
      }
    };
  }, []);

  return (
    <footer className="footer footerback mt-5 pt-4 shadow-sm">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Office Address & Social Links */}
          <div className="footer-col">
            <div className="footer-section">
              <h5 className="footer-menu-title mb-3">OFFICE ADDRESS</h5>
              <address className="footer-address mb-4">
                Road No. 6 Dhanmondi, Dhaka 1209, Bangladesh
                <br />
                <span className="footer-email">
                  Email: sktaimur296@gmail.com
                </span>
                <br />
                <span className="footer-email">
                  Whatsapp: +880 191 465 3199
                </span>
                <br />
                <span className="footer-email text-success">
                  <ArrowRight size={17} />
                  Please message me about your business with more details.
                </span>
              </address>

              <h5 className="footer-menu-title mb-3">SOCIAL LINKS</h5>
              <div className="social-links">
                <a
                  href="#"
                  className="social-link mt-1 me-2"
                  aria-label="Twitter"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaTwitter className="h4" />
                </a>
                <a
                  href="https://m.facebook.com/sheikh.habib.jamil/"
                  className="social-link mt-1 me-2"
                  aria-label="Facebook"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaFacebook className="h4" />
                </a>
                <a
                  href="https://www.instagram.com/toymurislam45/"
                  className="social-link mt-1 me-2"
                  aria-label="Instagram"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaInstagram className="h4" />
                </a>

                <a
                  href="https://wa.me/+8801914653199"
                  className="social-link mt-1"
                  aria-label="Whatsapp"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaWhatsapp className="h4" />
                </a>
              </div>
            </div>
          </div>

          {/* Company Links - Hidden on mobile */}
          <div className="footer-col footer-col-company">
            <div className="footer-section">
              <h5 className="footer-menu-title mb-3">THE COMPANY</h5>
              <nav className="footer-nav">
                <Link to="/about" className="footer-link d-block mb-2">
                  About Us
                </Link>
                <Link
                  to="/company_profile"
                  className="footer-link d-block mb-2"
                >
                  Company Profile
                </Link>
                <Link to="/contact" className="footer-link d-block">
                  Contact Us
                </Link>
              </nav>
            </div>
          </div>

          {/* More Info Links - Hidden on mobile */}
          <div className="footer-col footer-col-info">
            <div className="footer-section">
              <h5 className="footer-menu-title mb-3">MORE INFO</h5>
              <nav className="footer-nav">
                <Link to="/purchase" className="footer-link d-block mb-2">
                  How To Purchase
                </Link>
                <Link to="/privacy" className="footer-link d-block mb-2">
                  Privacy Policy
                </Link>
                <Link to="/refund" className="footer-link d-block">
                  Refund Policy
                </Link>
              </nav>
            </div>
          </div>

          {/* Download Apps */}
          <div className="footer-col">
            <div className="footer-section">
              <h5 className="footer-menu-title mb-3">DOWNLOAD APPS</h5>
              <div className="app-downloads">
                <a
                  href="#"
                  className="app-link d-block"
                  aria-label="Download from Google Play"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Google}
                    alt="Get it on Google Play"
                    className="app-store-img"
                  />
                </a>
                <a
                  href="#"
                  className="app-link d-block"
                  aria-label="Download from App Store"
                  rel="noopener noreferrer"
                >
                  <img
                    src={Apple}
                    alt="Download on the App Store"
                    className="app-store-img"
                  />
                </a>
                <div className="language-section">
                  <div className="language-selector">
                    <span id="google_translate_element"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="custom_footer_bottom bg-dark text-center">
        <p className="fs-6 text-white mb-0 footer-copyright">
          © Copyright {currentYear} by Daily Mart, All Rights Reserved
        </p>
      </div>
    </footer>
  );
};

export default Footer;
