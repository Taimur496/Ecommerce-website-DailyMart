import React, { useEffect, useState } from "react";
import "../../assets/css/productcollection.css";
import { useDataCache } from "../../contexts/useDataCache";
import SkeletonDemo from "../../pages/Skeleton";
import { Link } from "react-router-dom";

const ProductCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { fetchSpecialDeals, cache } = useDataCache();

  const fetchProducts = async () => {
    try {
      if (cache.specialDeals.data) {
        setProducts(cache.specialDeals.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await fetchSpecialDeals();
      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      {loading ? (
        <SkeletonDemo />
      ) : (
        <div className="product-collection-section">
          <div className="collection-header">
            <h2 className="collection-title">Special Collections</h2>
            <p className="collection-subtitle">
              Some of our exclusive collections, you may like
            </p>
          </div>

          <div className="products-grid-collection">
            {products.map((product) => (
              <div key={product.id} className="collection-product-card">
                <Link
                  to={`/productdetails?id=${product.id}`}
                  className="text-decoration-none"
                >
                  <div className="collection-product-image-container">
                    <img
                      src={product.main_img}
                      alt={product.product_name}
                      className="collection-product-image"
                    />
                  </div>
                  <div className="collection-product-info">
                    <h3 className="collection-product-name">
                      {product.product_name}
                    </h3>
                    <div className="collection-product-price">
                      Price : {product.selling_price || product.discount_price}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCollection;
