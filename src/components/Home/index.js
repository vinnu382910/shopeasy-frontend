import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { TbLogout2 } from "react-icons/tb";
import useWishlist from "../useWishlist";
import FilterBar from "../FilterBar";
import Loader from "../Loader";
import './index.css';

const Home = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOption, setSortOption] = useState('');
  const [cartItemCount, setCartItemCount] = useState(0);
  const [cartStatus, setCartStatus] = useState({});
  const [showFeatured, setShowFeatured] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    minPrice: 0,
    maxPrice: 1000000,
    category: '',
    minRating: 0,
    q: ''
  });

  const { isInWishlist, toggleWishlist, wishlist } = useWishlist();
  const wishlistCount = wishlist.length;
  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"
  const fetchProducts = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (filters.category) {
        const response = await fetch(`${deployUrl}products/category/${filters.category}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        let filteredProducts = data?.products || [];
        filteredProducts = filteredProducts.filter(product => {
          return (
            product.finalPrice >= (filters.minPrice || 0) &&
            product.finalPrice <= (filters.maxPrice || 1000000) &&
            product.rating >= (filters.minRating || 0) &&
            (filters.q ? product.title.toLowerCase().includes(filters.q.toLowerCase()) : true) &&
            (!filters.featured || product.featured)
          );
        });

        if (filters.sort === 'price_asc') {
          filteredProducts.sort((a, b) => a.finalPrice - b.finalPrice);
        } else if (filters.sort === 'price_desc') {
          filteredProducts.sort((a, b) => b.finalPrice - a.finalPrice);
        }

        setProducts(filteredProducts);
      } else {
        const params = new URLSearchParams();
        params.append('minPrice', filters.minPrice || 0);
        params.append('maxPrice', filters.maxPrice || 1000000);
        
        if (filters.minRating) {
          params.append('minRating', filters.minRating);
        }
        if (filters.sort) {
          params.append('sort', filters.sort);
        }
        if (filters.featured) {
          params.append('featured', filters.featured);
        }
        if (filters.q) {
          params.append('q', filters.q);
        }

        const response = await fetch(`${deployUrl}products?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data?.products || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCartItemCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${deployUrl}usercart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      
      const data = await response.json();
      const count = data.count || 0;
      const items = Array.isArray(data.data.items) ? data.data.items : [];
      setCartItemCount(count);
      
      const status = {};
      items.forEach(item => {
        if (item.productId && item.productId._id) {
          status[item.productId._id] = true;
        }
      });
      setCartStatus(status);
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartItemCount(0);
      setCartStatus({});
    }
  }, []);

  useEffect(() => {
    fetchProducts({
      ...activeFilters,
      sort: sortOption,
      featured: showFeatured
    });
    fetchCartItemCount();
  }, [activeFilters, sortOption, showFeatured, fetchProducts, fetchCartItemCount]);

  const applyFilters = (filters) => {
    const updatedFilters = {
      ...filters,
      sort: sortOption,
      featured: showFeatured
    };
    setActiveFilters(filters);
    fetchProducts(updatedFilters);
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
  };

  const handleFeaturedToggle = () => {
    setShowFeatured(prev => !prev);
  };

  const addToCart = async (productId, e) => {
    e.stopPropagation();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${deployUrl}usercart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      
      if (!response.ok) throw new Error('Failed to add to cart');
      
      setCartStatus(prev => ({ ...prev, [productId]: true }));
      setCartItemCount(prev => prev + 1);
      toast.success('Added to cart successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    toast('User Logged Out');
    setTimeout(() => {
      navigate('/');
    }, 1000);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  return (
    <div className="user-home-container">
      <ToastContainer autoClose={3000} />
      {isLoading && <Loader />}
      {showLogoutConfirm && (
        <div className="logout-confirmation-popup">
          <div className="logout-confirmation-content">
            <p>Are you sure you want to Logout?</p>
            <div className="logout-confirmation-buttons">
              <button onClick={confirmLogout} className="confirm-button">Yes</button>
              <button onClick={cancelLogout} className="cancel-button">No</button>
            </div>
          </div>
        </div>
      )}

      <div className="user-home-header">
        <h1>🛍️ <span className="user-home-header-name">Shopeasy</span></h1>
        <div className="user-home-user-info">
          <Link to="/wishlist" className="cart-icon-link">
            <div className="cart-icon-container">
              <Heart size={24} />
              {wishlistCount > 0 && (
                <span className="cart-item-count">{wishlistCount}</span>
              )}
            </div> 
          </Link>
          <Link to="/cart" className="cart-icon-link">
            <div className="cart-icon-container">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="cart-item-count">{cartItemCount}</span>
              )}
            </div>
          </Link>

          <FilterBar 
            onApplyFilters={applyFilters}
            initialFilters={activeFilters}
          />
          <button onClick={handleLogout} className="user-home-logout-button">Logout</button>
          <button onClick={handleLogout} className="user-home-logout-icon">
            <TbLogout2 size={24} />
          </button>
        </div>
      </div>

      <div className="sort-options-container">
        <div className="sort-options">
          <select 
            value={sortOption}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price Low to High</option>
            <option value="price_desc">Price High to Low</option>
          </select>
          
          <label className="featured-toggle">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={handleFeaturedToggle}
              className='featured-toggle-checkbox'
            />
            <span className='featured-toggle-text'>Featured Only</span>
          </label>
        </div>
      </div>

      {!isLoading && (
        <>
          {products.length > 0 ? (
            <div className="user-home-products-list">
              {products.map((product) => {
                const discountPercentage = product.discount;
                
                return (
                  <div className="user-home-product-card" key={product._id} onClick={() => navigate(`/products/${product._id}`)}>
                    <div className="product-home-image-cont">
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="user-home-product-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-product.png';
                        }}
                      />
                      <button 
                          className={`small-device user-home-action-button user-home-wishlist-button ${
                            isInWishlist(product._id) ? 'in-wishlist' : ''
                          }`}
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
                            className="user-home-icon" 
                            fill={isInWishlist(product._id) ? 'red' : 'none'} 
                          />
                          <span>{isInWishlist(product._id) ? 'Go To Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                    </div>
                    <div className="user-home-product-info">
                      <h3 className="user-home-product-title">{product.title}</h3>
                      <p className="user-home-product-description">
                        {product.description.length > 100 
                          ? `${product.description.substring(0, 100)}...` 
                          : product.description}
                      </p>
                      
                      <div className="user-home-rating">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            fill={i < Math.floor(product.rating || 0) ? "#ffb400" : "none"} 
                            stroke="#ffb400" 
                            size={18} 
                          />
                        ))}
                        <span>({product.reviewsCount || 0})</span>
                      </div>
                      
                      <div className="user-home-product-pricing">
                        <span className="user-home-final-price">₹{product.finalPrice.toLocaleString()}</span>
                        {product.discount > 0 && (
                          <>
                            <span className="user-home-original-price">₹{product.price}</span>
                            <span className="user-home-discount">{discountPercentage}% OFF</span>
                          </>
                        )}
                      </div>

                      {product.merchantDetails && (
                        <div className="user-home-merchant">
                          <span>Sold by: {product.merchantDetails.businessName}</span>
                        </div>
                      )}

                      <div className="user-home-product-actions">
                        <button 
                          className={`user-home-action-button user-home-wishlist-button ${
                            isInWishlist(product._id) ? 'in-wishlist' : ''
                          }`}
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
                            className="user-home-icon" 
                            fill={isInWishlist(product._id) ? 'red' : 'none'} 
                          />
                          <span>{isInWishlist(product._id) ? 'Go To Wishlist' : 'Add to Wishlist'}</span>
                        </button>
                        <button 
                          className={`user-home-action-button user-home-cart-button ${
                            cartStatus[product._id] ? 'added-to-cart' : ''
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cartStatus[product._id]) {
                              navigate('/cart');
                            } else {
                              addToCart(product._id, e);
                            }
                          }}
                        >
                          <ShoppingCart className="user-home-icon" />
                          <span>
                            {cartStatus[product._id] ? 'Go To Cart' : 'Add To Cart'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="user-home-no-products">
              <p>***No products found matching your filters***</p>
              <button 
                onClick={() => {
                  setSortOption('');
                  setShowFeatured(false);
                  applyFilters({
                    minPrice: 0,
                    maxPrice: 1000000,
                    category: '',
                    minRating: 0,
                    q: ''
                  });
                }}
                className="reset-filters-button"
              >
                Reset Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;