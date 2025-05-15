import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import './MerchantHeader.css';

const MerchantHeader = ({ merchantName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      localStorage.removeItem('merchantToken');
      navigate('/merchant/login');
    }
  };

  const handleSellProduct = () => {
    navigate('/merchant/add-product');
  };

  return (
    <header className="merchant-header">
      <div className="merchant-header__left">
        <FaUserCircle className="merchant-header__icon" />
        <span className="merchant-header__welcome">
          <span className="merchant-header__welcome-bold">Welcome</span> {merchantName || 'Merchant'}
        </span>
        <div className='merchant-header-actions-cont'>
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
      </div>

      <div className="merchant-header__right">
        <button
          onClick={handleLogout}
          className="merchant-header__button merchant-header__button--logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default MerchantHeader;
