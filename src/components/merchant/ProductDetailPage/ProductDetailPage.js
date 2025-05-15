import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../../Loader';
import './ProductDetailsPage.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(''); // State for main image display
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    category: '',
    subCategory: '',
    price: 0,
    discount: 0,
    currency: 'INR',
    stock: 0,
    warranty: '',
    returnPolicy: '',
    deliveryCharge: 0,
    deliveryTime: '',
    tags: [],
    isFeatured: false,
    specifications: {}
  });
  const [loading, setLoading] = useState(true);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [specInput, setSpecInput] = useState({ key: '', value: '' });

  const token = localStorage.getItem('merchantToken');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${deployUrl}merchant/myproduct/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduct(res.data);
        setFormData({
          ...res.data,
          tags: res.data.tags?.join(', ') || '',
          specifications: res.data.specifications || {}
        });
        const mainImage = res.data.images[0]
        setMainImage(mainImage)
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(results => {
      setImagePreviews([...imagePreviews, ...results]);
    });
  };

  const addSpecification = () => {
    if (specInput.key && specInput.value) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specInput.key.trim()]: specInput.value.trim()
        }
      }));
      setSpecInput({ key: '', value: '' });
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const validateForm = () => {
    const requiredFields = [
      'title', 'category', 'subCategory', 'price', 
      'description', 'warranty', 'returnPolicy',
      'deliveryTime'
    ];

    for (const field of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Prepare the data for submission
      const updateData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        deliveryCharge: parseFloat(formData.deliveryCharge) || 0,
        stock: parseInt(formData.stock) || 0,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isFeatured: Boolean(formData.isFeatured),
        specifications: formData.specifications
      };

      const res = await axios.put(
        `${deployUrl}merchant/update/${productId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProduct(res.data);
      setEditMode(false);
      toast.success('Product updated successfully!');
      navigate('/merchant/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update product');
      console.error('Error updating product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      await axios.delete(`${deployUrl}merchant/delete/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      navigate('/merchant/profile');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinalPrice = () => {
    const numericPrice = parseFloat(formData.price) || 0;
    const numericDiscount = parseFloat(formData.discount) || 0;
    const numericDeliveryCharge = parseFloat(formData.deliveryCharge) || 0;
    
    const discountedPrice = numericDiscount > 0
      ? Math.round(numericPrice - (numericPrice * numericDiscount) / 100)
      : numericPrice;
      
    return discountedPrice + numericDeliveryCharge;
  };

  if (loading && !product) {
    return <Loader />
  }

  if (!product) {
    return <div className="product-details-error-container">Product not found</div>;
  }

  return (
    <div className="product-details-product-detail-container">
      <ToastContainer />
      <h2 className='product-details-main-heading'>{editMode ? 'Edit Product' : 'Product Details'}</h2>
      
      {editMode ? (
        <div className="product-details-product-edit-form">
          <div className="product-details-form-section">
            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Title*</label>
                <input 
                  name="title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                  maxLength={100}
                />
              </div>
              <div className="product-details-form-group">
                <label>Brand</label>
                <input 
                  name="brand" 
                  value={formData.brand} 
                  onChange={handleChange} 
                  maxLength={50}
                />
              </div>
            </div>

            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Price (INR)*</label>
                <input 
                  type="number" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange} 
                  required 
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="product-details-form-group">
                <label>Discount (%)</label>
                <input 
                  type="number" 
                  name="discount" 
                  min="0" 
                  max="100" 
                  value={formData.discount} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          </div>

          <div className="product-details-form-section">
            <h3>Category</h3>
            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Category*</label>
                <input 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  required 
                  maxLength={50}
                />
              </div>
              <div className="product-details-form-group">
                <label>Sub Category*</label>
                <input 
                  name="subCategory" 
                  value={formData.subCategory} 
                  onChange={handleChange} 
                  required 
                  maxLength={50}
                />
              </div>
            </div>
          </div>

          <div className="product-details-form-section">
            <h3>Shipping & Policies</h3>
            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Delivery Charge (INR)</label>
                <input 
                  type="number" 
                  name="deliveryCharge" 
                  value={formData.deliveryCharge} 
                  onChange={handleChange} 
                  min="0"
                />
              </div>
              <div className="product-details-form-group">
                <label>Delivery Time*</label>
                <input 
                  name="deliveryTime" 
                  placeholder="e.g., 3-5 days" 
                  value={formData.deliveryTime} 
                  onChange={handleChange} 
                  required 
                  maxLength={50}
                />
              </div>
            </div>

            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Warranty*</label>
                <input 
                  name="warranty" 
                  placeholder="e.g., 1 year" 
                  value={formData.warranty} 
                  onChange={handleChange} 
                  required 
                  maxLength={100}
                />
              </div>
              <div className="product-details-form-group">
                <label>Return Policy*</label>
                <input 
                  name="returnPolicy" 
                  placeholder="e.g., 30 days return" 
                  value={formData.returnPolicy} 
                  onChange={handleChange} 
                  required 
                  maxLength={100}
                />
              </div>
            </div>
          </div>

          <div className="product-details-form-section">
            <h3>Images</h3>
            <div className="product-details-form-group">
              <label>Upload Additional Images (Max 5)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImagesChange} 
                multiple
              />
              <div className="product-details-image-previews">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="product-details-image-preview-container">
                    <img src={preview} alt={`Preview ${index}`} />
                    <span className="product-details-image-index">{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="product-details-form-section">
            <h3>Additional Information</h3>
            <div className="product-details-form-group">
              <label>Description*</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                required 
                maxLength={2000}
              />
            </div>

            <div className="product-details-form-group">
              <label>Tags</label>
              <input 
                name="tags" 
                placeholder="Comma separated tags (e.g., electronics, gadget)" 
                value={formData.tags} 
                onChange={handleChange} 
                maxLength={200}
              />
            </div>

            <div className="product-details-form-row">
              <div className="product-details-form-group">
                <label>Stock Quantity</label>
                <input 
                  type="number" 
                  name="stock" 
                  min="0" 
                  value={formData.stock} 
                  onChange={handleChange} 
                />
              </div>
              <div className="product-details-form-group">
                <label>Rating (0-5)</label>
                <input 
                  type="number" 
                  name="rating" 
                  min="0" 
                  max="5" 
                  step="0.1" 
                  value={formData.rating} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="product-details-form-group checkbox-group">
              <label htmlFor="isFeatured">Feature this product</label>
              <input 
                type="checkbox" 
                id="isFeatured" 
                name="isFeatured" 
                checked={formData.isFeatured} 
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))} 
                className='product-details-checkbox'
              />
            </div>
          </div>

          <div className="product-details-form-section">
            <h3>Specifications</h3>
            <div className="product-details-specifications-input">
              <input
                type="text"
                placeholder="Key (e.g., 'Color')"
                value={specInput.key}
                onChange={(e) => setSpecInput(prev => ({ ...prev, key: e.target.value }))}
                maxLength={30}
              />
              <input
                type="text"
                placeholder="Value (e.g., 'Red')"
                value={specInput.value}
                onChange={(e) => setSpecInput(prev => ({ ...prev, value: e.target.value }))}
                maxLength={100}
              />
              <button type="button" onClick={addSpecification}>Add</button>
            </div>
            
            {Object.keys(formData.specifications).length > 0 && (
              <div className="product-details-specifications-list">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="product-details-spec-item">
                    <span className="product-details-spec-key">{key}:</span>
                    <span className="product-details-spec-value">{value}</span>
                    <button 
                      type="button" 
                      className="product-details-remove-spec" 
                      onClick={() => removeSpecification(key)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="product-details-form-section final-price-section">
            <h3>Final Price: <span className='product-details-finalprice'>₹{calculateFinalPrice().toFixed(2)}</span></h3>
            <p className="product-details-price-breakdown">
              (Price: ₹{parseFloat(formData.price || 0).toFixed(2)} - 
              Discount: ₹{(parseFloat(formData.price || 0) * parseFloat(formData.discount || 0) / 100).toFixed(2)} + 
              Delivery: ₹{parseFloat(formData.deliveryCharge || 0).toFixed(2)})
            </p>
          </div>

          <div className="product-details-form-actions">
            <button 
              type="button" 
              className="product-details-btn-update" 
              onClick={handleUpdate}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button 
              type="button" 
              className="product-details-btn-cancel" 
              onClick={() => setEditMode(false)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="product-details-product-details-view">
          <div className="product-details-product-images">
            <div className="product-details-main-image">
              <img 
                src={mainImage} 
                alt={product.title} 
                className="product-details-main-img"
              />
            </div>
            <div className="product-details-thumbnail-images">
            {product.images?.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt={`${product.title} ${index + 1}`}
                className={`product-details-thumbnail ${mainImage === img ? 'active-thumbnail' : ''}`}
                onClick={() => setMainImage(img)}
              />
            ))}
            </div>
          </div>

          <div className="product-details-product-info">
            <h1 className="product-details-product-title">{product.title}</h1>
            <p className="product-details-product-description">{product.description}</p>
            
            <div className="product-details-price-section">
              <div className="product-details-original-price">₹{product.price}</div>
              {product.discount > 0 && (
                <div className="product-details-discount-badge">{product.discount}% OFF</div>
              )}
              <div className="product-details-final-price">₹{product.finalPrice}</div>
              {product.deliveryCharge > 0 && (
                <div className="product-details-delivery-charge">+ ₹{product.deliveryCharge} delivery charge</div>
              )}
            </div>

            <div className="product-details-details-grid">
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Brand:</span>
                <span className="product-details-detail-value">{product.brand || '-'}</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Category:</span>
                <span className="product-details-detail-value">{product.category} / {product.subCategory}</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Stock:</span>
                <span className="product-details-detail-value">{product.stock} available</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Rating:</span>
                <span className="product-details-detail-value">{product.rating} ⭐ ({product.reviewsCount} reviews)</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Delivery:</span>
                <span className="product-details-detail-value">{product.deliveryTime} days</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Warranty:</span>
                <span className="product-details-detail-value">{product.warranty || '-'}</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Return Policy:</span>
                <span className="product-details-detail-value">{product.returnPolicy || '-'}</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Featured:</span>
                <span className="product-details-detail-value">{product.isFeatured ? 'Yes' : 'No'}</span>
              </div>
              <div className="product-details-detail-item">
                <span className="product-details-detail-label">Tags:</span>
                <span className="product-details-detail-value">{product.tags?.join(', ') || '-'}</span>
              </div>
            </div>

            {Object.keys(product.specifications || {}).length > 0 && (
              <div className="product-details-specifications-section">
                <h3>Specifications</h3>
                <div className="product-details-specs-grid">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="product-details-spec-item">
                      <span className="product-details-spec-key">{key}:</span>
                      <span className="product-details-spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="product-details-product-actions">
              <button 
                className="product-details-btn-edit"
                onClick={() => setEditMode(true)}
              >
                Edit Product
              </button>
              <button 
                className="product-details-btn-delete"
                onClick={handleDelete}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;