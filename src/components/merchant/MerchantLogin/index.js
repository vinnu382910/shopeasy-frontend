import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './merchantLogin.css';

const MerchantLogin = () => {
  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    email: false,
    password: false
  });
  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('merchantToken');
    if (token) {
      navigate('/merchant/profile');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (inputErrors[name]) {
      setInputErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const errors = {
      email: !form.email || !/^\S+@\S+\.\S+$/.test(form.email),
      password: !form.password || form.password.length < 4 || form.password.length > 100
    };
    setInputErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please enter valid email and password (4-100 characters)');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${deployUrl}auth/merchant/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('merchantToken', data.token);
        localStorage.setItem('merchantName', data.name);
        toast.success('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/merchant/profile');
        }, 1000);
      } else {
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="merchant-login-container">
      <ToastContainer />
      <div className="container">
        <h1>Merchant Login</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter your business email"
              value={form.email}
              onChange={handleChange}
              className={inputErrors.email ? 'error' : ''}
            />
          </div>

          <div className="password-input-container">
            <label htmlFor="password">Password</label>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className={inputErrors.password ? 'error' : ''}
            />
            <div className="show-password-toggle">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={togglePasswordVisibility}
              />
              <label htmlFor="showPassword">Show Password</label>
            </div>
          </div>

          <button 
            type="submit" 
            className={`merchant-login-container-button${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="signup-link">
            Don't have a merchant account?{' '}
            <span className="login"><Link to="/merchant/signup">Sign up here</Link></span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default MerchantLogin;