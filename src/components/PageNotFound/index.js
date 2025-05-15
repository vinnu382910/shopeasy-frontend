import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // Import the CSS file

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="not-found-container">
      <img 
        src="https://res.cloudinary.com/dgc9ugux7/image/upload/v1747249445/PageNotFound_kkcvt3.jpg" 
        alt="Page not found" 
        className="not-found-image"
      />
      <h1 className="not-found-title">Oops! Page Not Found</h1>
      <p className="not-found-text">The page you're looking for doesn't exist or has been moved.</p>
      <button 
        onClick={handleGoHome} 
        className="not-found-button"
      >
        Go to Home Page
      </button>
    </div>
  );
};

export default NotFound;