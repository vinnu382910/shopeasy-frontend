import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MerchantHeader from '../MerchantHeader/merchantHeader';
import { useNavigate } from 'react-router-dom';
import Loader from '../../Loader';
import './merchantProfile.css';

const MerchantProfile = () => {
  const [products, setProducts] = useState([]);
  const [merchantName, setMerchantName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('merchantToken');
        if (!token) throw new Error('Token not found. Please login again.');

        const res = await axios.get(`${deployUrl}merchant/myproducts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMerchantName(res.data.merchantInfo.name);
        setProducts(res.data.products);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load merchant data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);
  const navigate = useNavigate();
  const handleSellProduct = () => {
    navigate('/merchant/add-product');
  };
  return (
    <div className="merchant-profile-container">
      <MerchantHeader merchantName={merchantName} />
      <div className='merchant-header-actions-cont2'>
      <h1 className="products-heading">Your Products</h1>
          <div className="merchant-header__actions">
            <button
              onClick={handleSellProduct}
              className="merchant-header__button merchant-header__button--sell"
            >
              Sell Products
            </button>
          </div>
          <div className="merchant-header__actions">
            <button
              className="merchant-header__button merchant-header__button--sell"
            >
              Check Orders
            </button>
          </div>
        </div>
      {loading ? (
        <Loader />
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="product-card-link"
            >
              <div className="product-card">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="product-image"
                />
                <div className="product-details">
                  <h3 className="product-title">{product.title}</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">
                    ₹{product.price}
                    {product.discount > 0 && (
                      <span className="product-discount">
                        {' '}
                        ({product.discount}% OFF)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MerchantProfile;
