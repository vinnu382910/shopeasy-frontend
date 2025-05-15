import { Link } from 'react-router-dom';
import useWishlist from '../useWishlist';
import Loader from "../Loader";
import './index.css'

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist } = useWishlist();

  if (loading) return <Loader />;

  return (
    <div className="wishlist-container">
      <h2>Your Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <p>Your wishlist is empty</p>
          <Link to="/products">Browse Products</Link>
        </div>
      ) : (
        <div className="wishlist-items">
          {wishlist.map(item => (
            <div key={item._id} className="wishlist-item">
              <Link to={`/products/${item.productId._id}`}>
                <img 
                  className="wishlist-img"
                  src={item.productId.imageUrl} 
                  alt={item.productId.title} 
                />
                <h3>{item.productId.title}</h3>
                <p>₹{item.productId.finalPrice}</p>
              </Link>
              <button 
                onClick={() => removeFromWishlist(item.productId._id)}
                className="remove-wishlist"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;