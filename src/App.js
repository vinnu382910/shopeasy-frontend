import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import 'react-toastify/ReactToastify.css';
import RefreshHandler from './RefreshHandler';
import Login from './components/LoginForm';
import Signup from './components/SignupForm';
import Home from './components/Home';
import MerchantSignup from './components/merchant/MerchantSignup';
import MerchantLogin from './components/merchant/MerchantLogin';
import MerchantProfile from './components/merchant/MerchantProfile';
import AddProductForm from './components/merchant/AddProductForm/addProductForm';
import ProductDetailPage from './components/merchant/ProductDetailPage/ProductDetailPage';
import ProductInfo from './components/ProductInfo';
import Cart from './components/Cart';
import Wishlist from './components/WishList';
import PageNotFound from './components/PageNotFound'
import LandingPage from './components/LandingPage';
import { useState, useEffect } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Check initial auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    const merchantToken = localStorage.getItem('merchantToken');
    setIsAuthenticated(!!token);
    setIsMerchantAuthenticated(!!merchantToken);
    setAuthChecked(true);
  }, []);

  // Private route for normal users
  const PrivateRoute = ({ element }) => {
    if (!authChecked) return <div className="loading-spinner">Loading...</div>;
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  // Private route for merchants
  const MerchantPrivateRoute = ({ element }) => {
    if (!authChecked) return <div className="loading-spinner">Loading...</div>;
    return isMerchantAuthenticated ? element : <Navigate to="/merchant/login" replace />;
  };

  return (
    <div className="App">
      <RefreshHandler 
        setIsAuthenticated={setIsAuthenticated}
        setIsMerchantAuthenticated={setIsMerchantAuthenticated}
        setAuthChecked={setAuthChecked}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Common Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public User Routes */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected User Routes */}
        <Route path="/home" element={<PrivateRoute element={<Home />} />} />
        <Route path="/products/:productId" element={<PrivateRoute element={<ProductInfo />} />} />
        <Route path="/cart" element={<PrivateRoute element={<Cart />} />} />
        <Route path="/wishlist" element={<PrivateRoute element={<Wishlist />} />} />

        {/* Merchant Routes */}
        <Route path="/merchant/signup" element={<MerchantSignup />} />
        <Route path="/merchant/login" element={<MerchantLogin setIsMerchantAuthenticated={setIsMerchantAuthenticated} />} />
        <Route path="/merchant/profile" element={<MerchantPrivateRoute element={<MerchantProfile />} />} />
        <Route path="/merchant/add-product" element={<MerchantPrivateRoute element={<AddProductForm />} />} />
        <Route path="/product/:productId" element={<MerchantPrivateRoute element={<ProductDetailPage />} />}/>
       
        {/* Page Not Found Route*/}
        <Route path="*" element={<PageNotFound />} />
       </Routes>
    </div>
  );
}

export default App;