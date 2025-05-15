import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../../utils';
import "./merchantSignup.css";

const MerchantSignup = () => {
  const [formData, setFormData] = useState({
    merchantName: "",
    email: "",
    password: "",
    phoneNumber: "",
    address: "",
    businessName: "",
    gstNumber: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    merchantName: false,
    email: false,
    password: false,
    phoneNumber: false,
    address: false,
    businessName: false
  });

  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  const validateInputs = () => {
    const requiredFields = ['merchantName', 'email', 'password', 'phoneNumber', 'address', 'businessName'];
    const errors = {};
    
    requiredFields.forEach(field => {
      errors[field] = !formData[field];
    });

    // Additional email validation
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = true;
    }

    // Phone number validation (10 digits)
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = true;
    }

    setInputErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateInputs()) {
      handleError('Please fill all required fields correctly');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${deployUrl}auth/merchant/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        handleSuccess(data.message || "Merchant registration successful");
        setTimeout(() => {
          navigate("/merchant/login");
        }, 1500);
      } else {
        handleError(data.message || "Registration failed");
      }
    } catch (error) {
      handleError(error.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="merchant-signup-container">
      <div className="container">
        <h1>Merchant Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="merchantName">Merchant Name*</label>
            <input
              type="text"
              name="merchantName"
              placeholder="Your full name"
              value={formData.merchantName}
              onChange={handleChange}
              className={inputErrors.merchantName ? 'error' : ''}
            />
          </div>

          <div>
            <label htmlFor="email">Email*</label>
            <input
              type="email"
              name="email"
              placeholder="Your business email"
              value={formData.email}
              onChange={handleChange}
              className={inputErrors.email ? 'error' : ''}
            />
          </div>

          <div className="password-input-container">
            <label htmlFor="password">Password*</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a password"
              value={formData.password}
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

          <div>
            <label htmlFor="phoneNumber">Phone Number*</label>
            <input
              type="text"
              name="phoneNumber"
              placeholder="10-digit mobile number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={inputErrors.phoneNumber ? 'error' : ''}
            />
          </div>

          <div>
            <label htmlFor="businessName">Business Name*</label>
            <input
              type="text"
              name="businessName"
              placeholder="Your business name"
              value={formData.businessName}
              onChange={handleChange}
              className={inputErrors.businessName ? 'error' : ''}
            />
          </div>

          <div>
            <label htmlFor="address">Business Address*</label>
            <textarea
              name="address"
              placeholder="Complete business address"
              value={formData.address}
              onChange={handleChange}
              className={inputErrors.address ? 'error' : ''}
              rows="3"
            />
          </div>

          <div>
            <label htmlFor="gstNumber">GST Number (Optional)</label>
            <input
              type="text"
              name="gstNumber"
              placeholder="22AAAAA0000A1Z5"
              value={formData.gstNumber}
              onChange={handleChange}
            />
          </div>

          <button 
            type="submit"
            className={`merchant-signup-container-button${isLoading ? ' loading' : ''}`}

            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Create Merchant Account'}
          </button>

          <p>Already have an account?
            <span className="login"><Link to="/merchant/login"> Login here</Link></span>
          </p>
        </form>
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default MerchantSignup;