import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { ToastContainer,toast } from 'react-toastify';
import Loader from '../Loader';
import './index.css';

const Cart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState({
    items: [],
    summary: {
      totalActualPrice: 0,
      totalFinalPrice: 0,
      totalDiscount: 0,
      totalItems: 0,
      deliveryCharge: 50,
      grandTotal: 50
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const mainUrl = "https://shopeasy-backend-0wjl.onrender.com/";

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}usercart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const data = await response.json();
      setCartData(data.data || {
        items: [],
        summary: {
          totalActualPrice: 0,
          totalFinalPrice: 0,
          totalDiscount: 0,
          totalItems: 0,
          deliveryCharge: 50,
          grandTotal: 50
        }
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}usercart/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      if (!response.ok) throw new Error('Failed to update quantity');
      
      fetchCartItems();
      toast.success('Quantity updated successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeItem = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}usercart/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove item');
      
      setSelectedItems(selectedItems.filter(id => id !== productId));
      fetchCartItems();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}usercart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to clear cart');
      
      setCartData({
        items: [],
        summary: {
          totalActualPrice: 0,
          totalFinalPrice: 0,
          totalDiscount: 0,
          totalItems: 0,
          deliveryCharge: 50,
          grandTotal: 50
        }
      });
      setSelectedItems([]);
      toast.success('Cart cleared successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleItemSelection = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter(id => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const calculateSelectedTotals = () => {
    const selectedProducts = cartData.items.filter(item => 
      selectedItems.includes(item.productId._id)
    );
    
    const selectedSummary = selectedProducts.reduce((acc, item) => {
      return {
        totalActualPrice: acc.totalActualPrice + (item.productId.price * item.quantity),
        totalFinalPrice: acc.totalFinalPrice + (item.productId.finalPrice * item.quantity),
        totalDiscount: acc.totalDiscount + 
          ((item.productId.price - item.productId.finalPrice) * item.quantity),
        totalItems: acc.totalItems + item.quantity
      };
    }, {
      totalActualPrice: 0,
      totalFinalPrice: 0,
      totalDiscount: 0,
      totalItems: 0
    });

    const deliveryCharge = selectedItems.length >= 3 ? 0 : 50;
    
    return {
      ...selectedSummary,
      deliveryCharge,
      grandTotal: selectedSummary.totalFinalPrice + deliveryCharge
    };
  };

  if (loading) return <div className="cart-loading"><Loader /></div>;

  const selectedSummary = selectedItems.length > 0 ? 
    calculateSelectedTotals() : 
    {
      totalActualPrice: 0,
      totalFinalPrice: 0,
      totalDiscount: 0,
      totalItems: 0,
      deliveryCharge: 0,
      grandTotal: 0
    };

  return (
    <div className="cart-container">
      <ToastContainer />
      <div className='cart-head-cont'>
        <button onClick={() => navigate("/home")} className="product-info-back-button">
          <ArrowLeft size={20} /> Back to Home
        </button>
        <h2 className="cart-title">
          <ShoppingCart size={24} /> Your Cart <span className='cart-items-length'>({cartData.items.length})</span>
        </h2>
      </div>
      
      {cartData.items.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty</p>
        </div>
      ) : (
        <div className="cart-content-wrapper">
          <div className="cart-items">
            {cartData.items.map(item => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-select">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.productId._id)}
                    onChange={() => toggleItemSelection(item.productId._id)}
                  />
                </div>
                <img 
                  src={item.productId.imageUrl} 
                  alt={item.productId.title} 
                  className="cart-item-image"
                />
                <div className="cart-item-details" onClick={() => navigate(`/products/${item.productId._id}`)}>
                  <h3>{item.productId.title}</h3>
                  <div className="cart-item-pricing">
                    <span className="cart-item-final-price">
                      ₹{(item.productId.finalPrice * item.quantity).toLocaleString()}
                    </span>
                    {item.productId.discount > 0 && (
                      <span className="cart-item-original-price">
                        ₹{(item.productId.price * item.quantity).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="cart-item-merchant">
                    Sold by: {item.productId.merchantId?.businessName || 'Unknown'}
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button 
                      onClick={(e) => {e.stopPropagation(); updateQuantity(item.productId._id, item.quantity - 1)}}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.productId._id, item.quantity + 1)}}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <button 
                  className="cart-item-remove"
                  onClick={() => removeItem(item.productId._id)}
                >
                  <Trash2 size={18} stroke='#000'/>
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary-sidebar">
            <div className="price-details">
              <h3>Price Details ({selectedSummary.totalItems} items)</h3>
              
              <div className="price-row">
                <span>Total MRP</span>
                <span>₹{selectedSummary.totalActualPrice.toLocaleString()}</span>
              </div>
              
              <div className="price-row discount">
                <span>Discount on MRP</span>
                <span>-₹{selectedSummary.totalDiscount.toLocaleString()}</span>
              </div>
              
              <div className="price-row">
                <span>Delivery Charges</span>
                <span>
                  {selectedItems.length >= 3 ? (
                    <span className="free-delivery">FREE</span>
                  ) : (
                    `₹${selectedSummary.deliveryCharge}`
                  )}
                </span>
              </div>
              
              <div className="price-row total">
                <span>Total Amount</span>
                <span>₹{selectedSummary.grandTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="cart-actions">
              <button 
                className="cart-clear-button"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button 
                className="cart-checkout-button"
                disabled={selectedItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;