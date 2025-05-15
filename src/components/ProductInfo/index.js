import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Star, ArrowLeft, Phone, MapPin, Store } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import useWishlist from "../useWishlist";
import Loader from "../Loader";
import './index.css';

const ProductInfo = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartStatus, setCartStatus] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const mainUrl = "https://shopeasy-backend-0wjl.onrender.com/";

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Parallel fetching of product and cart status
        const [productResponse, cartResponse] = await Promise.all([
          fetch(`${mainUrl}products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${mainUrl}usercart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
    
        if (!productResponse.ok) throw new Error('Failed to fetch product');
        
        const productData = await productResponse.json();
        setProduct(productData);
        setMainImage(productData.imageUrl || productData.images?.[0] || '');
        
        // Set the similar and recommended products from backend response
        if (productData.similarProducts) {
          setSimilarProducts(productData.similarProducts);
        }
        if (productData.productsYouMayLike) {
          setRecommendedProducts(productData.productsYouMayLike);
        }
    
        // Handle cart response safely
        if (cartResponse.ok) {
          const cartData = await cartResponse.json();
          
          // Safely check if product exists in cart
          const cartItems = Array.isArray(cartData.data.items) ? cartData.data.items : [];
          const isInCart = cartItems.some(item => 
            item.productId && item.productId._id === productId
          );
          setCartStatus(isInCart);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const addToCart = async (e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}usercart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      
      if (!response.ok) throw new Error('Failed to add to cart');
      
      setCartStatus(true);
      toast.success('Added to cart successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renderProductCard = (product) => {
    const discountPercentage = Math.round(((product.price - product.finalPrice) / product.price) * 100);
    
    return (
      <div 
        key={product._id} 
        className="recommended-product-card"
        onClick={() => navigate(`/products/${product._id}`)}
      >
        <div className="recommended-product-image-container">
          <img 
            src={product.imageUrl} 
            alt={product.title}
            className="recommended-product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-product.jpg';
            }}
          />
          {product.discount > 0 && (
            <span className="recommended-product-discount-badge">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        <div className="recommended-product-details">
          <h4 className="recommended-product-title">{product.title}</h4>
          <div className="recommended-product-price">
            <span className="recommended-product-final-price">₹{product.finalPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <span className="recommended-product-original-price">₹{product.price.toLocaleString()}</span>
            )}
          </div>
          <div className="recommended-product-rating">
            <Star fill="#ffb400" stroke="#ffb400" size={14} />
            <span>{product.rating?.toFixed(1) || '0.0'}</span>
            <span>({product.reviewsCount || 0})</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="product-info-loader"><Loader /></div>;
  }

  if (!product) {
    return <div className="product-info-not-found">Product not found</div>;
  }

  const discountPercentage = Math.round(((product.price - product.finalPrice) / product.price) * 100);

  return (
    <div className="product-info-container">
      <button onClick={() => navigate("/home")} className="product-info-back-button">
        <ArrowLeft size={20} /> Back To Home
      </button>

      <div className="product-info-main">
        {/* Image Gallery Section */}
        <div className="product-info-image-section">
          <div className="product-info-main-image-container">
            <img 
              src={mainImage} 
              alt={product.title} 
              className="product-info-main-image" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-product.jpg';
              }}
            />
          </div>
          <div className="product-info-thumbnails">
            {[product.imageUrl, ...(product.images || [])]
              .filter((img, index, arr) => arr.indexOf(img) === index)
              .map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.title} thumbnail ${index + 1}`}
                  className={`product-info-thumbnail ${mainImage === img ? 'active-thumbnail' : ''}`}
                  onClick={() => setMainImage(img)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-product.jpg';
                  }}
                />
              ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className="product-info-details-section">
          <h1 className="product-info-title">{product.title}</h1>
          
          <div className="product-info-meta">
            <span className="product-info-brand">Brand: {product.brand || 'No brand'}</span>
            <span className="product-info-category">{product.category} › {product.subCategory}</span>
            {product.isFeatured && <span className="product-info-featured">Featured</span>}
          </div>
          
          <div className="product-info-rating">
            <div className="product-info-stars">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  fill={i < Math.floor(product.rating || 0) ? "#ffb400" : "none"} 
                  stroke="#ffb400" 
                  size={18} 
                />
              ))}
              <span className="product-info-rating-value">{product.rating?.toFixed(1)}</span>
            </div>
            <span className="product-info-review-count">({product.reviewsCount || 0} reviews)</span>
          </div>
          
          <div className="product-info-pricing">
            <span className="product-info-final-price">₹{product.finalPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="product-info-original-price">₹{product.price.toLocaleString()}</span>
                <span className="product-info-discount">{discountPercentage}% OFF</span>
              </>
            )}
          </div>
          
          {/* Merchant Details */}
          {product.merchantDetails && (
            <div className="product-info-merchant">
              <h3 className="merchant-section-title">Sold By</h3>
              <div className="merchant-details">
                <div className="merchant-detail-item">
                  <Store className="merchant-icon" size={16} />
                  <span className="merchant-detail-value">{product.merchantDetails.businessName}</span>
                </div>
                {product.merchantDetails.merchantName && (
                  <div className="merchant-detail-item">
                    <span className="merchant-detail-label">Owner:</span>
                    <span className="merchant-detail-value">{product.merchantDetails.merchantName}</span>
                  </div>
                )}
                {product.merchantDetails.address && (
                  <div className="merchant-detail-item">
                    <MapPin className="merchant-icon" size={16} />
                    <span className="merchant-detail-value">{product.merchantDetails.address}</span>
                  </div>
                )}
                {product.merchantDetails.merchantPhoneNumber && (
                  <div className="merchant-detail-item">
                    <Phone className="merchant-icon" size={16} />
                    <span className="merchant-detail-value">{product.merchantDetails.merchantPhoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="product-info-delivery">
            <p>
              <span className="delivery-label">Delivery:</span> 
              <span className="delivery-value">{product.deliveryTime} {product.deliveryTime === '1' ? 'day' : 'days'}</span>
            </p>
            <p>
              <span className="delivery-label">Delivery Charge:</span> 
              <span className="delivery-value">₹{product.deliveryCharge || 'Free'}</span>
            </p>
          </div>
          
          <div className="product-info-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>
          
          {Object.keys(product.specifications || {}).length > 0 && (
            <div className="product-info-specifications">
              <h3>Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <span className="spec-key">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {product.tags?.length > 0 && (
            <div className="product-info-tags">
              <h3>Tags</h3>
              <div className="tags-container">
                {product.tags.map((tag, index) => (
                  <span key={index} className="product-tag">{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="product-info-actions">
            <button 
              className={`product-info-wishlist-button ${isInWishlist(product._id) ? 'in-wishlist' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (isInWishlist(product._id)) {
                  navigate('/wishlist');
                } else {
                  toggleWishlist(product._id);
                }
              }}
            >
              <Heart 
                className="product-info-icon" 
                fill={isInWishlist(product._id) ? 'red' : 'none'}
              />
              {isInWishlist(product._id) ? 'Go To Wishlist' : 'Add to Wishlist'}
            </button>
            <button 
              className={`product-info-cart-button ${cartStatus ? 'in-cart' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (cartStatus) {
                  navigate('/cart');
                } else {
                  addToCart(e);
                }
              }}
            >
              <ShoppingCart className="product-info-icon" />
              {cartStatus ? 'Go To Cart' : 'Add To Cart'}
            </button>
          </div>
          
          <div className="product-info-policies">
            <div className="policy-item">
              <span className="policy-label">Warranty:</span>
              <span className="policy-value">{product.warranty || 'No warranty'}</span>
            </div>
            <div className="policy-item">
              <span className="policy-label">Return Policy:</span>
              <span className="policy-value">{product.returnPolicy || 'No returns'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Recommendations Section */}
      <div className="product-recommendations">
        {similarProducts.length > 0 && (
          <div className="recommendation-section">
            <h2 className="recommendation-section-title">Similar Products</h2>
            <div className="recommendation-products-grid">
              {similarProducts.map(renderProductCard)}
            </div>
          </div>
        )}

        {recommendedProducts.length > 0 && (
          <div className="recommendation-section">
            <h2 className="recommendation-section-title">You Might Also Like</h2>
            <div className="recommendation-products-grid">
              {recommendedProducts.map(renderProductCard)}
            </div>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default ProductInfo;