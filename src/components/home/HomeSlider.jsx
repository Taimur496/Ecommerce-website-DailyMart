import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../assets/css/homeslider.css";
import SkeletonDemo from "../../pages/Skeleton";
import { useDataCache } from "../../contexts/useDataCache";
import { Link } from "react-router-dom";

const HomeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);
  const [products, setProducts] = useState([]);

  const { fetch2Products, fetchSliders, cache } = useDataCache();

  const fetchProducts = async () => {
    try {
      if (cache.products.data) {
        setProducts(cache.products.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetch2Products();
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchedSliders = async () => {
    try {
      setLoading(true);

      // Check cache first
      if (cache.sliders.data) {
        // Filter active sliders - check both is_active boolean and status string
        const activeSliders = cache.sliders.data.filter(
          (slider) =>
            slider.is_active === true ||
            slider.is_active === 1 ||
            slider.status === "Active"
        );
        setSliderImages(activeSliders);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const data = await fetchSliders();

      if (data && data.length > 0) {
        // Filter active sliders
        const activeSliders = data.filter(
          (slider) =>
            slider.is_active === true ||
            slider.is_active === 1 ||
            slider.status === "Active"
        );
        setSliderImages(activeSliders);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
      setError("Failed to load sliders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchedSliders();
  }, []);

  // Start auto slide
  const startAutoSlide = () => {
    if (sliderImages.length <= 1) return;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }, 5000);
  };

  // Reset auto slide timer
  const resetAutoSlide = () => {
    startAutoSlide();
  };

  useEffect(() => {
    if (sliderImages.length > 0) {
      startAutoSlide();
    }

    return () => clearInterval(intervalRef.current);
  }, [sliderImages.length]);

  const nextSlide = () => {
    if (sliderImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    resetAutoSlide();
  };

  const prevSlide = () => {
    if (sliderImages.length === 0) return;
    setCurrentSlide(
      (prev) => (prev - 1 + sliderImages.length) % sliderImages.length
    );
    resetAutoSlide();
  };

  const goToSlide = (index) => {
    if (sliderImages.length === 0) return;
    setCurrentSlide(index);
    resetAutoSlide();
  };

  // Show loading state
  if (loading) {
    return <SkeletonDemo />;
  }

  // Show error state
  if (error) {
    return (
      <div className="home-slider-container">
        <div className="slider-grid-container">
          <div className="main-slider">
            <div className="slider-wrapper">
              <div className="error-slider">
                <p>{error}</p>
                <button onClick={fetchedSliders} className="retry-btn">
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-slider-container">
      <div className="slider-grid-container">
        {/* Main Slider Section */}
        <div className="main-slider">
          <div className="slider-wrapper">
            <div
              className="slides-container"
              style={{
                transform: `translateX(-${currentSlide * 33.35}%)`,
              }}
            >
              {sliderImages.map((slide) => (
                <div key={slide.id} className="slide">
                  <Link
                    to={`/productdetails?id=${slide.product_id}`}
                    className="text-decoration-none"
                  >
                    <div className="slide-image">
                      <img
                        src={slide.image_url || slide.image}
                        alt={slide.title || `Slide ${slide.id}`}
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.target.src =
                            "https://images.unsplash.com/photo-1592286927505-1def25115558?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
                        }}
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Navigation Arrows - Only show if there are multiple slides */}
            {sliderImages.length > 1 && (
              <>
                <button className="nav-btn nav-btn-prev" onClick={prevSlide}>
                  <ChevronLeft size={20} />
                </button>
                <button className="nav-btn nav-btn-next" onClick={nextSlide}>
                  <ChevronRight size={20} />
                </button>

                {/* Dots Indicator - Only show if there are multiple slides */}
                <div className="dots-container">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      className={`dot ${
                        index === currentSlide ? "active" : ""
                      }`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Side Images Section */}
        <div className="side-images">
          {products.map((product) => (
            <div key={product.id} className="side-image-card">
              <Link
                to={`/productdetails?id=${product.id}`}
                className="text-decoration-none"
              >
                <div className="side-image-wrapper">
                  <img
                    src={product.main_img}
                    alt={`Side banner ${product.id}`}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSlider;
