import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const useWishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const mainUrl = "https://shopeasy-backend-0wjl.onrender.com/"

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlist(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}wishlist`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Failed to add to wishlist');
      
      await fetchWishlist();
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${mainUrl}wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to remove from wishlist');
      
      await fetchWishlist();
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.productId._id === productId);
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  return {
    wishlist,
    loading,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    fetchWishlist
  };
};

export default useWishlist;