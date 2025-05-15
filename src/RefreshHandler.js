import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RefreshHandler = ({ setIsAuthenticated, setIsMerchantAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const userToken = localStorage.getItem('token');
      const merchantToken = localStorage.getItem('merchantToken');

      // Set authentication states first
      setIsAuthenticated(!!userToken);
      setIsMerchantAuthenticated(!!merchantToken);

      // Only redirect if we're on auth-related pages
      if (userToken) {
        if (
          location.pathname === '/' || 
          location.pathname === '/login' || 
          location.pathname === '/signup'
        ) {
          navigate('/home', { replace: true });
        }
      } else if (merchantToken) {
        if (
          location.pathname === '/' || 
          location.pathname === '/merchant/login' || 
          location.pathname === '/merchant/signup'
        ) {
          navigate('/merchant/profile', { replace: true });
        }
      }

      setAuthChecked(true);
    };

    checkAuthAndRedirect();
  }, [location, navigate, setIsAuthenticated, setIsMerchantAuthenticated]);

  // Return null or a loading indicator if needed
  return null;
};

export default RefreshHandler;