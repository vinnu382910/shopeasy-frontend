import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    role === "user" ? navigate(`/login`) : navigate(`/merchant/login`)
  };

  const handleRegister = (role) => {
    console.log(role)
    role === "user" ? navigate(`/signup`) : navigate(`/merchant/signup`)
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-primary">Shop</span>
            <span>Easy</span>
          </div>
          <div className="header-buttons">
            <button 
              onClick={() => handleLogin('user')}
              className="login-btn"
            >
              Login
            </button>
            <button 
              onClick={() => handleRegister('user')}
              className="signup-btn"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>
      <main>
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className='main-heading'>Welcome to shopeasy</h1>
                <p className="hero-subtitle">
                  Your one-stop destination for all your shopping needs. Join us as a merchant or a customer.
                </p>
              </div>
              <div className="hero-cta">
                <button 
                  onClick={() => handleRegister('user')}
                  className="cta-btn primary"
                >
                  Shop as a Customer
                  <ArrowRight className="cta-icon" />
                </button>
                <button 
                  onClick={() => handleRegister('merchant')}
                  className="cta-btn secondary"
                >
                  Join as a Merchant
                  <ArrowRight className="cta-icon" />
                </button>
              </div>
            </div>
            <div className="product-showcase">
              <div className="showcase-container">
                <div className="showcase-backdrop"></div>
                <div className="product-grid">
                  <div className="product-card featured">
                    <div className="card-header">
                      <h3>Premium Headphones</h3>
                      <p className="card-description">Noise Cancelling</p>
                    </div>
                    <div className="card-image-placeholder"></div>
                    <div className="card-footer">
                      <p className="price">₹1,999</p>
                      <button className="add-to-cart">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  <div className="product-card">
                    <div className="card-header">
                      <h3>Smart Watch</h3>
                    </div>
                    <div className="card-image-placeholder small"></div>
                    <div className="card-footer">
                      <p className="price">₹2,499</p>
                    </div>
                  </div>
                  <div className="product-card">
                    <div className="card-header">
                      <h3>Wireless Earbuds</h3>
                    </div>
                    <div className="card-image-placeholder small"></div>
                    <div className="card-footer">
                      <p className="price">₹1,299</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="how-it-works">
          <div className="works-container">
            <div className="section-header">
              <h2>How It Works</h2>
              <p className="section-subtitle">
                Join our platform as a merchant to sell your products or as a customer to shop from a wide range of products.
              </p>
            </div>
            <div className="steps-grid">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Create an Account</h3>
                <p className="step-description">
                  Sign up as a merchant or a customer to get started with our platform.
                </p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Browse or List Products</h3>
                <p className="step-description">
                  Merchants can list their products, while customers can browse and shop.
                </p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Manage Orders</h3>
                <p className="step-description">Track your orders as a customer or manage orders as a merchant.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="footer-container">
          <p className="copyright">
            &copy; {new Date().getFullYear()} shopeasy. All rights reserved on vinnu382910.
          </p>
          <div className="footer-links">
            <button className="footer-link">
              Terms
            </button>
            <button className="footer-link">
              Privacy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;