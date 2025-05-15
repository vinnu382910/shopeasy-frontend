import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { toast } from 'react-toastify';
import useWishlist from '../useWishlist';
import Loader from '../Loader';
import './index.css';

const ProductsYouMayLike = () => {
  const navigate = useNavigate();
  const { wishlist, loading: wishlistLoading } = useWishlist();
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mainUrl = "https://shopeasy-backend-0wjl.onrender.com/"

  // Combine wishlist and recommended products
  const allProducts = useMemo(() => {
    const wishlistProducts = wishlist.map(item => item.productId);
    return [...wishlistProducts, ...recommendedProducts].slice(0, 10);
  }, [wishlist, recommendedProducts]);

  const fetchRecommendedProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      // First try to get products based on wishlist categories
      const categories = [...new Set(
        wishlist.map(item => item.productId?.category).filter(Boolean)
      )];

      let products = [];
      
      if (categories.length > 0) {
        const response = await fetch(
          `${mainUrl}products?categories=${categories.join(',')}&limit=8`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (response.ok) {
          const data = await response.json();
          products = data.products || [];
        }
      }

      // If we don't have enough products, fetch highest discount products
      if (products.length < 10) {
        const needed = 10 - products.length;
        const discountResponse = await fetch(
          `${mainUrl}products?sort=discount_desc&limit=${needed}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (discountResponse.ok) {
          const discountData = await discountResponse.json();
          products = [...products, ...(discountData.products || [])];
        }
      }

      // Filter out any wishlist products that might be in recommended
      const wishlistIds = wishlist.map(item => item.productId._id);
      setRecommendedProducts(
        products.filter(p => !wishlistIds.includes(p._id))
      );

    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      toast.error("Failed to load recommended products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedProducts();
  }, [wishlist]);

  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`, { replace: true });
  };

  if (wishlistLoading || loading) {
    return <div className="loading-spinner"><Loader /></div>;
  }

  if (error) {
    return <div className="error-message">Error loading products</div>;
  }

  return (
    <div className="products-you-may-like">
      <h2>Products You May Like</h2>
      
      {allProducts.length > 0 ? (
        <div className="products-grid">
          {allProducts.map(product => (
            <div 
              key={`recommended-${product._id}`}
              className="product-card"
              onClick={() => handleProductClick(product._id)}
            >
              <div className="product-image-container">
                <img 
                  src={product.imageUrl} 
                  alt={product.title}
                  className="product-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-product.jpg';
                  }}
                />
                {product.isFeatured && (
                  <span className="featured-badge">Featured</span>
                )}
                {product.discount > 0 && (
                  <span className="discount-badge">{Math.round(
                    ((product.price - product.finalPrice) / product.price * 100)
                  )}% OFF</span>
                )}
              </div>
              <div className="product-details">
                <h3 className="product-title">{product.title}</h3>
                <div className="product-brand">{product.brand}</div>
                <div className="product-price">
                  <span className="final-price">₹{product.finalPrice.toLocaleString()}</span>
                  {product.discount > 0 && (
                    <span className="original-price">₹{product.price.toLocaleString()}</span>
                  )}
                </div>
                <div className="product-rating">
                  <Star fill="#ffb400" stroke="#ffb400" size={14} />
                  <span>{product.rating?.toFixed(1) || '0.0'}</span>
                  <span>({product.reviewsCount || 0})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">No recommended products found</p>
      )}
    </div>
  );
};

export default ProductsYouMayLike;