import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleUserLogin = () => {
    navigate('/login');
  };

  const handleMerchantLogin = () => {
    navigate('/merchant/login');
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Welcome to ShopEasy</h1>
        <p className="landing-subtitle">Your one-stop shopping destination</p>
        
        <div className="landing-buttons">
          <button 
            onClick={handleUserLogin} 
            className="landing-btn user-btn"
          >
            User Login / Signup
          </button>
          <button 
            onClick={handleMerchantLogin} 
            className="landing-btn merchant-btn"
          >
            Merchant Login / Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;