import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { IoMdArrowRoundBack} from 'react-icons/io';
import { FaTimes } from 'react-icons/fa';
import './AddProductForm.css';

const ProductForm = () => {
  const [product, setProduct] = useState({
    title: '',
    brand: '',
    price: '',
    discount: '0',
    rating: '0',
    description: '',
    category: '',
    subCategory: '',
    stock: '0',
    warranty: '',
    returnPolicy: '',
    deliveryCharge: '0',
    deliveryTime: '',
    tags: '',
    isFeatured: false,
    specifications: {},
    currency: 'INR'
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [specInput, setSpecInput] = useState({ key: '', value: '' });
  const [isLoading, setIsLoading] = useState(false);
  const deployUrl = "https://shopeasy-backend-0wjl.onrender.com/"
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };


  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Check each file size (max 2MB)
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error('Some images exceed 2MB limit. Please choose smaller files.');
      return;
    }

    // Create previews
    const previews = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve({
          url: reader.result,
          file: file  // Store the file object for reference
        });
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(results => {
      setImagePreviews(prev => [...prev, ...results]);
    });
  };

  // Function to remove an image preview
  const removeImagePreview = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    if (specInput.key && specInput.value) {
      setProduct(prev => ({
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
    const newSpecs = { ...product.specifications };
    delete newSpecs[key];
    setProduct(prev => ({
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
      if (!product[field]?.toString().trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (imagePreviews.length === 0) {
      toast.error('Please upload at least one image');
      return false;
    }

    if (parseFloat(product.price) <= 0) {
      toast.error('Price must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Upload images first
      const uploadFormData = new FormData();
      const files = Array.from(document.querySelector('input[type="file"]').files);
      files.forEach(file => uploadFormData.append('images', file));
      let uploadRes;
      try {
            uploadRes = await axios.post(
            `${deployUrl}api/upload/multiple`,
            uploadFormData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('merchantToken')}`,
              },
            }
          );
          // You can handle success response here
          console.log('Upload successful:', uploadRes.data);
        } catch (error) {
          console.error('Upload failed:', error.response?.data?.message || error.message);
          alert(`Upload Error: ${error.response?.data?.message || 'Something went wrong during upload.'}`);
        }


      const imageUrls = uploadRes.data.imageUrls;

      // Prepare product data according to backend requirements
      const productData = {
        title: product.title.trim(),
        description: product.description.trim(),
        brand: product.brand.trim(),
        category: product.category.trim(),
        subCategory: product.subCategory.trim(),
        price: parseFloat(product.price),
        discount: parseFloat(product.discount) || 0,
        currency: product.currency,
        stock: parseInt(product.stock) || 0,
        imageUrl: imageUrls[0], // Main image
        images: imageUrls,
        rating: parseFloat(product.rating) || 0,
        reviewsCount: 0, // Default as per backend
        tags: product.tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag),
        warranty: product.warranty.trim(),
        returnPolicy: product.returnPolicy.trim(),
        deliveryCharge: parseFloat(product.deliveryCharge) || 0,
        deliveryTime: product.deliveryTime.trim(),
        specifications: product.specifications,
        isFeatured: Boolean(product.isFeatured)
      };

      // Submit product data
      console.log(productData)
      const response = await axios.post(
        `${deployUrl}merchant/additem`, 
        productData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('merchantToken')}`
          }
        }
      );
      console.log(response.err)
      toast.success('Product added successfully!');
      setTimeout(() => navigate('/merchant/profile'), 2000);
    } catch (err) {
          let errorMessage = 'Failed to add product';
          
          if (err.response?.data?.errors) {
            // Display all validation errors
            errorMessage = err.response.data.errors.map(e => e.msg || e.message).join(', ');
          } else {
            errorMessage = err.response?.data?.message || 
                        err.response?.data?.error || 
                        errorMessage;
          }
          
          toast.error(errorMessage);
          console.error('Error adding product:', err.response?.data || err);
        } finally {
          setIsLoading(false);
        }
      };

  // Calculate final price for display
  const calculateFinalPrice = () => {
    const numericPrice = parseFloat(product.price) || 0;
    const numericDiscount = parseFloat(product.discount) || 0;
    const numericDeliveryCharge = parseFloat(product.deliveryCharge) || 0;
    
    const discountedPrice = numericDiscount > 0
      ? Math.round(numericPrice - (numericPrice * numericDiscount) / 100)
      : numericPrice;
      
    return discountedPrice + numericDeliveryCharge;
  };

  return (
    <div className="add-product-container">
      <ToastContainer />
      <button className="add-product-back-button" onClick={() => navigate(-1)}>
        <IoMdArrowRoundBack /> Back
      </button>
      
      <h2 className='main-heading'>Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Title*</label>
              <input 
                name="title" 
                value={product.title} 
                onChange={handleChange} 
                required 
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Brand</label>
              <input 
                name="brand" 
                value={product.brand} 
                onChange={handleChange} 
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (INR)*</label>
              <input 
                type="number" 
                name="price" 
                value={product.price} 
                onChange={handleChange} 
                required 
                min="1"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Discount (%)</label>
              <input 
                type="number" 
                name="discount" 
                min="0" 
                max="100" 
                value={product.discount} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Category</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Category*</label>
              <input 
                name="category" 
                value={product.category} 
                onChange={handleChange} 
                required 
                maxLength={50}
              />
            </div>
            <div className="form-group">
              <label>Sub Category*</label>
              <input 
                name="subCategory" 
                value={product.subCategory} 
                onChange={handleChange} 
                required 
                maxLength={50}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Shipping & Policies</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Delivery Charge (INR)</label>
              <input 
                type="number" 
                name="deliveryCharge" 
                value={product.deliveryCharge} 
                onChange={handleChange} 
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Delivery Time*</label>
              <input 
                name="deliveryTime" 
                placeholder="e.g., 3-5 days" 
                value={product.deliveryTime} 
                onChange={handleChange} 
                required 
                maxLength={50}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Warranty*</label>
              <input 
                name="warranty" 
                placeholder="e.g., 1 year" 
                value={product.warranty} 
                onChange={handleChange} 
                required 
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <label>Return Policy*</label>
              <input 
                name="returnPolicy" 
                placeholder="e.g., 30 days return" 
                value={product.returnPolicy} 
                onChange={handleChange} 
                required 
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
        <h3>Images</h3>
        <div className="form-group">
          <label>Upload Images (Max 5, each &lt; 2MB)*</label> {/* Added size restriction */}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImagesChange} 
            multiple
            required 
          />
          <p className="image-upload-note">Maximum 5 images allowed, each under 2MB</p> {/* Added note */}
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="image-preview-container">
                <img src={preview.url} alt={`Preview ${index}`} />
                <span className="image-index">{index + 1}</span>
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => removeImagePreview(index)}
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>Description*</label>
            <textarea 
              name="description" 
              value={product.description} 
              onChange={handleChange} 
              required 
              maxLength={2000}
            />
          </div>

          <div className="form-group">
            <label>Tags</label>
            <input 
              name="tags" 
              placeholder="Comma separated tags (e.g., electronics, gadget)" 
              value={product.tags} 
              onChange={handleChange} 
              maxLength={200}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Stock Quantity</label>
              <input 
                type="number" 
                name="stock" 
                min="0" 
                value={product.stock} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label>Rating (0-5)</label>
              <input 
                type="number" 
                name="rating" 
                min="0" 
                max="5" 
                step="0.1" 
                value={product.rating} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input 
              type="checkbox" 
              id="isFeatured" 
              name="isFeatured" 
              checked={product.isFeatured} 
              onChange={(e) => setProduct(prev => ({ ...prev, isFeatured: e.target.checked }))} 
            />
            <label htmlFor="isFeatured">Feature this product</label>
          </div>
        </div>

        <div className="form-section">
          <h3>Specifications</h3>
          <div className="specifications-input">
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
          
          {Object.keys(product.specifications).length > 0 && (
            <div className="specifications-list">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="spec-item">
                  <span className="spec-key">{key}:</span>
                  <span className="spec-value">{value}</span>
                  <button 
                    type="button" 
                    className="remove-spec" 
                    onClick={() => removeSpecification(key)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-section final-price-section">
          <h3>Final Price: ₹{calculateFinalPrice().toFixed(2)}</h3>
          <p className="price-breakdown">
            (Price: ₹{parseFloat(product.price || 0).toFixed(2)} - 
            Discount: ₹{(parseFloat(product.price || 0) * parseFloat(product.discount || 0) / 100).toFixed(2)} + 
            Delivery: ₹{parseFloat(product.deliveryCharge || 0).toFixed(2)})
          </p>
        </div>

        <button 
          type="submit" 
          className="add-product-submit-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;