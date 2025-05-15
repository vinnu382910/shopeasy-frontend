import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import './index.css';

const SimilarProducts = ({ category, subCategory, currentProductId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchProducts = async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch similar products');
    const data = await response.json();
    return data.products || []; // Access the products array from response
  };

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try with both category and subcategory
        if (subCategory) {
          try {
            const products = await fetchProducts(
              `http://localhost:5000/products/category/${encodeURIComponent(category)}/${encodeURIComponent(subCategory)}`
            );
            
            const filtered = products
              .filter(product => product._id !== currentProductId)
              .slice(0, 4);
            
            if (filtered.length > 0) {
              setSimilarProducts(filtered);
              return;
            }
          } catch (subCatError) {
            console.log("Subcategory fetch failed, trying category only");
          }
        }
        
        // Fall back to category only
        const products = await fetchProducts(
          `http://localhost:5000/products/category/${encodeURIComponent(category)}`
        );
        
        const filtered = products
          .filter(product => product._id !== currentProductId)
          .slice(0, 4);
        
        setSimilarProducts(filtered);
        
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError(err.message);
        toast.error("Failed to load similar products");
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchSimilarProducts();
    }
  }, [category, subCategory, currentProductId]);

  if (loading) {
    return <div className="similar-products-loading">Loading similar products...</div>;
  }

  if (error) {
    return <div className="similar-products-error">Error loading similar products</div>;
  }

  if (similarProducts.length === 0) {
    return null;
  }
  const handleProductClick = (productId) => {
    // Replace current route instead of pushing new one
    navigate(`/products/${productId}`, { replace: true });
  };
  return (
    <div className="similar-products-section">
      <h2 className="similar-products-title">Similar Products</h2>
      <div className="similar-products-grid">
        {similarProducts.map(product => (
          <div 
            key={`similar-${product._id}`} 
            className="similar-product-card"
            onClick={() => handleProductClick(product._id)}
          >
            <div className="similar-product-image-container">
              <img 
                src={product.imageUrl} 
                alt={product.title}
                className="similar-product-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/default-product.jpg';
                }}
              />
              {product.isFeatured && (
                <span className="similar-product-featured">Featured</span>
              )}
            </div>
            <div className="similar-product-details">
              <h3 className="similar-product-title">{product.title}</h3>
              <div className="similar-product-brand">{product.brand}</div>
              <div className="similar-product-price">
                <span className="similar-product-final-price">₹{product.finalPrice.toLocaleString()}</span>
                {product.discount > 0 && (
                  <span className="similar-product-original-price">₹{product.price.toLocaleString()}</span>
                )}
              </div>
              <div className="similar-product-rating">
                <Star fill="#ffb400" stroke="#ffb400" size={14} />
                <span>{product.rating?.toFixed(1) || '0.0'}</span>
                <span>({product.reviewsCount || 0})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;